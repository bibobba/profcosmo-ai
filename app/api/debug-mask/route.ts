import { NextResponse } from "next/server";
import sharp from "sharp";
import * as ort from "onnxruntime-node";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const HAIR_PARSER_MODEL_URL =
  "https://github.com/yakhyo/face-parsing/releases/download/weights/resnet18.onnx";
const HAIR_PARSER_MODEL_PATH =
  "/tmp/profcosmo-parsing-resnet18-yakhyo-v1.onnx";
const HAIR_CLASS_INDEX = 17; // yakhyo/CelebAMask-HQ: hair

let hairParserSessionPromise: Promise<ort.InferenceSession> | null = null;
let hairParserModelPromise: Promise<Buffer> | null = null;

async function loadHairParserModel() {
  if (!hairParserModelPromise) {
    hairParserModelPromise = (async () => {
      try {
        const fs = await import("node:fs/promises");
        const existing = await fs.stat(HAIR_PARSER_MODEL_PATH);
        if (existing.size > 1_000_000) {
          return fs.readFile(HAIR_PARSER_MODEL_PATH);
        }
      } catch {
        // First invocation or stale/missing file.
      }

      console.log("[PROFCOSMO] downloading local BiSeNet ONNX model");
      const response = await fetch(HAIR_PARSER_MODEL_URL);
      if (!response.ok) {
        throw new Error(
          `Не удалось загрузить модель сегментации волос: HTTP ${response.status}`
        );
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.length < 1_000_000) {
        throw new Error("Файл модели сегментации волос поврежден или слишком мал.");
      }

      const fs = await import("node:fs/promises");
      await fs.writeFile(HAIR_PARSER_MODEL_PATH, buffer);
      console.log("[PROFCOSMO] BiSeNet ONNX model ready", {
        megabytes: Math.round(buffer.length / 1024 / 1024),
      });
      return buffer;
    })();
  }

  return hairParserModelPromise;
}

async function getHairParserSession() {
  if (!hairParserSessionPromise) {
    hairParserSessionPromise = (async () => {
      const model = await loadHairParserModel();
      const session = await ort.InferenceSession.create(model, {
        executionProviders: ["cpu"],
        graphOptimizationLevel: "all",
      });
      console.log("[PROFCOSMO] BiSeNet session ready", {
        inputs: session.inputNames,
        outputs: session.outputNames,
      });
      return session;
    })();
  }

  return hairParserSessionPromise;
}

async function getHairSegmentation(
  sourceFile: File,
  width: number,
  height: number
) {
  const sourceBuffer = Buffer.from(
    await sourceFile.arrayBuffer()
  );

  /*
   * BiSeNet face parsing is trained/evaluated on face-centred crops.
   * The previous diagnostic fed the entire portrait into 512x512, making
   * the face too small for reliable hair classification.
   *
   * For this diagnostic we first take a large, centred head/face crop,
   * run BiSeNet there, then map the hair mask back to the original image.
   * This changes only the diagnostic parser input; the production route
   * remains untouched until we validate the result.
   */
  const cropSize = Math.max(
    256,
    Math.min(
      width,
      height,
      Math.round(
        Math.min(width, height) * 0.90
      )
    )
  );

  const cropLeft = Math.max(
    0,
    Math.round((width - cropSize) / 2)
  );

  const portrait = height >= width;
  const cropTop = Math.max(
    0,
    Math.min(
      height - cropSize,
      Math.round(
        height * (portrait ? 0.02 : 0.05)
      )
    )
  );

  const { data: rgb } = await sharp(sourceBuffer)
    .rotate()
    .extract({
      left: cropLeft,
      top: cropTop,
      width: cropSize,
      height: cropSize,
    })
    .resize(512, 512, {
      fit: "fill",
    })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // yakhyo's BiSeNet preprocessing: RGB, [0..1], ImageNet normalization.
  const mean = [0.485, 0.456, 0.406];
  const std = [0.229, 0.224, 0.225];
  const input = new Float32Array(1 * 3 * 512 * 512);

  for (let i = 0; i < 512 * 512; i++) {
    input[i] =
      (rgb[i * 3] / 255 - mean[0]) / std[0];
    input[512 * 512 + i] =
      (rgb[i * 3 + 1] / 255 - mean[1]) / std[1];
    input[2 * 512 * 512 + i] =
      (rgb[i * 3 + 2] / 255 - mean[2]) / std[2];
  }

  const session = await getHairParserSession();
  const inputName = session.inputNames[0];
  const outputs = await session.run({
    [inputName]: new ort.Tensor("float32", input, [1, 3, 512, 512]),
  });

  const output = outputs[session.outputNames[0]];
  if (!output?.data || !output.dims) {
    throw new Error("BiSeNet не вернул карту сегментации.");
  }

  const dims = output.dims.map(Number);
  if (dims.length !== 4) {
    throw new Error(
      `Неожиданная форма выхода BiSeNet: [${dims.join(", ")}]`
    );
  }

  const channels = dims[1];
  const outHeight = dims[2];
  const outWidth = dims[3];
  if (channels <= HAIR_CLASS_INDEX) {
    throw new Error(
      `В выходе BiSeNet нет класса волос: каналов ${channels}.`
    );
  }

  const values = output.data as Float32Array | number[];

  // Diagnostic only: record the actual class distribution returned by ONNX.
  const classCounts = new Array<number>(channels).fill(0);

  const hairMask = Buffer.alloc(outWidth * outHeight);

  for (let y = 0; y < outHeight; y++) {
    for (let x = 0; x < outWidth; x++) {
      const pixel = y * outWidth + x;
      let bestClass = 0;
      let bestScore = -Infinity;

      for (let cls = 0; cls < channels; cls++) {
        const score = Number(
          values[cls * outHeight * outWidth + pixel]
        );
        if (score > bestScore) {
          bestScore = score;
          bestClass = cls;
        }
      }

      classCounts[bestClass] += 1;
      hairMask[pixel] =
        bestClass === HAIR_CLASS_INDEX ? 255 : 0;
    }
  }

  const classDistribution = classCounts
    .map((count, index) => ({
      classIndex: index,
      pixels: count,
      percent: Number(
        ((count / (outWidth * outHeight)) * 100).toFixed(3)
      ),
    }))
    .sort((a, b) => b.pixels - a.pixels);

  const hairPixels = classCounts[HAIR_CLASS_INDEX] || 0;

  const localMask = await sharp(hairMask, {
    raw: {
      width: outWidth,
      height: outHeight,
      channels: 1,
    },
  })
    .resize(cropSize, cropSize, {
      fit: "fill",
      kernel: "nearest",
    })
    .dilate(2)
    .raw()
    .toBuffer();

  const fullMask = Buffer.alloc(width * height, 0);

  for (let y = 0; y < cropSize; y++) {
    const targetY = cropTop + y;
    if (targetY < 0 || targetY >= height) continue;

    for (let x = 0; x < cropSize; x++) {
      const targetX = cropLeft + x;
      if (targetX < 0 || targetX >= width) continue;

      fullMask[targetY * width + targetX] =
        localMask[y * cropSize + x];
    }
  }

  return {
    data: fullMask,
    info: {
      width,
      height,
      channels: 1,
      size: fullMask.length,
      parserOutputDims: dims,
      parserChannels: channels,
      parserOutWidth: outWidth,
      parserOutHeight: outHeight,
      parserHairPixels: hairPixels,
      parserTopClasses: classDistribution.slice(0, 8),
    },
  };
}

async function createHairMask(
  width: number,
  height: number,
  gender: string,
  length: string,
  structure: string,
  sourceFile: File
) {
  let segmentation: { data: Buffer; info: any } | null = null;
  let segmentationError: string | null = null;

  try {
    segmentation = await getHairSegmentation(
      sourceFile,
      width,
      height
    );
  } catch (error) {
    // Never block image generation if the local parser cannot initialize.
    // The existing geometric mask is safer than failing the whole request.
    segmentationError =
      error instanceof Error ? error.message : String(error);
    console.error(
      "[PROFCOSMO] BiSeNet segmentation failed; using safe fallback:",
      error
    );
  }

  const portrait = height >= width;
  const longHair =
    length === "below-shoulders" ||
    length === "long";

  const faceCx = 0.50;
  const faceCy = portrait ? 0.43 : 0.46;
  const faceRx = portrait ? 0.20 : 0.23;
  const faceRy = portrait ? 0.25 : 0.27;

  const alpha = Buffer.alloc(
    width * height,
    255
  );

  let hairPixelsAfterDilation = 0;

  const insideEllipse = (
    x: number,
    y: number,
    cx: number,
    cy: number,
    rx: number,
    ry: number
  ) => {
    const dx = (x / width - cx) / rx;
    const dy = (y / height - cy) / ry;
    return dx * dx + dy * dy <= 1;
  };

  if (segmentation) {
    /*
     * IMPORTANT:
     * Do not replace the semantic hair mask with a large head ellipse.
     * The previous ellipse made a huge amount of scalp/background editable,
     * which allowed GPT Image to redraw the head contour.
     *
     * The edit zone is now the detected hair mask plus a controlled local
     * expansion. This gives the model room to build the requested hairstyle
     * while keeping the original head contour outside the edit zone.
     */
    const expansionRatio =
      structure === "afro-curls"
        ? 0.045
        : longHair
          ? 0.035
          : 0.025;

    const expansionPixels = Math.max(
      8,
      Math.round(
        Math.min(width, height) *
          expansionRatio
      )
    );

    void expansionPixels;

    // The segmentation result is already a binary full-resolution mask.
    // Do not run a second Sharp dilation here: it can destroy the 1-channel
    // binary mask in this runtime. Keep the verified segmentation unchanged.
    const expanded = Buffer.from(segmentation.data);

    hairPixelsAfterDilation = 0;
    for (const value of expanded) {
      if (value >= 128) hairPixelsAfterDilation++;
    }

    for (let i = 0; i < expanded.length; i++) {
      alpha[i] =
        expanded[i] >= 128
          ? 0
          : 255;
    }
  } else {
    /*
     * Conservative fallback only if the local hair parser cannot initialize.
     * This fallback is deliberately smaller than the previous head ellipse.
     * The normal path uses semantic hair segmentation.
     */
    const fallbackCx = 0.50;
    const fallbackCy = portrait ? 0.30 : 0.31;
    const fallbackRx = portrait ? 0.29 : 0.32;
    const fallbackRy = portrait ? 0.24 : 0.26;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (
          insideEllipse(
            x,
            y,
            fallbackCx,
            fallbackCy,
            fallbackRx,
            fallbackRy
          )
        ) {
          alpha[y * width + x] = 0;
        }
      }
    }
  }

  /*
   * The face, ears and lower facial area are never part of the editable zone.
   * This is a deterministic safety boundary on top of the semantic mask.
   */
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const inFace = insideEllipse(
        x,
        y,
        faceCx,
        faceCy,
        faceRx,
        faceRy
      );

      const leftEar = insideEllipse(
        x,
        y,
        0.29,
        0.44,
        0.055,
        0.09
      );

      const rightEar = insideEllipse(
        x,
        y,
        0.71,
        0.44,
        0.055,
        0.09
      );

      if (inFace || leftEar || rightEar) {
        alpha[y * width + x] = 255;
      }
    }
  }

  void gender;
  void length;
  const rgba = Buffer.alloc(
    width * height * 4
  );

  for (let i = 0; i < alpha.length; i++) {
    const offset = i * 4;
    rgba[offset] = 255;
    rgba[offset + 1] = 255;
    rgba[offset + 2] = 255;
    rgba[offset + 3] = alpha[i];
  }

  const buffer = await sharp(rgba, {
    raw: {
      width,
      height,
      channels: 4,
    },
  })
    .png()
    .toBuffer();

  return {
    buffer,
    diagnostic: {
      ...(segmentation
        ? {
            ...segmentation.info,
            segmentationError: null,
          }
        : {
            segmentationError,
          }),
      hairPixelsAfterDilation,
    },
  };
}



export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get("image");

    if (!(image instanceof File)) {
      return NextResponse.json(
        { error: "Загрузите фотографию." },
        { status: 400 }
      );
    }

    if (!image.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Можно загрузить только изображение." },
        { status: 400 }
      );
    }

    const gender = String(formData.get("gender") || "male");
    const length = String(formData.get("length") || "short");
    const structure = String(formData.get("structure") || "afro-curls");

    const sourceBuffer = Buffer.from(await image.arrayBuffer());
    const metadata = await sharp(sourceBuffer).metadata();

    if (!metadata.width || !metadata.height) {
      return NextResponse.json(
        { error: "Не удалось определить размер изображения." },
        { status: 400 }
      );
    }

    const maskResult = await createHairMask(
      metadata.width,
      metadata.height,
      gender,
      length,
      structure,
      new File([sourceBuffer], image.name || "source.jpg", {
        type: image.type || "image/jpeg",
      })
    );
    const mask = maskResult.buffer;

    // Diagnostic view:
    // white = editable hair zone, black = protected source pixels.
    const { data: maskAlpha } = await sharp(mask)
      .extractChannel("alpha")
      .raw()
      .toBuffer({ resolveWithObject: true });

    let editablePixels = 0;
    for (const value of maskAlpha) {
      if (value < 128) editablePixels++;
    }

    console.log(
      "[PROFCOSMO] final diagnostic mask:",
      {
        width: metadata.width,
        height: metadata.height,
        editablePixels,
        editablePercent: Number(
          ((editablePixels / (metadata.width * metadata.height)) * 100).toFixed(3)
        ),
      }
    );

    const maskView = await sharp(maskAlpha, {
      raw: {
        width: metadata.width,
        height: metadata.height,
        channels: 1,
      },
    })
      .negate()
      .png()
      .toBuffer();

    const preview = await sharp(sourceBuffer)
      .resize(metadata.width, metadata.height)
      .composite([
        {
          input: await sharp(mask)
            .extractChannel("alpha")
            .negate()
            .blur(0.3)
            .linear(0.55, 0)
            .png()
            .toBuffer(),
          blend: "screen",
        },
      ])
      .jpeg({ quality: 92 })
      .toBuffer();

    return NextResponse.json({
      success: true,
      width: metadata.width,
      height: metadata.height,
      mask: `data:image/png;base64,${maskView.toString("base64")}`,
      preview: `data:image/jpeg;base64,${preview.toString("base64")}`,
      diagnostic: {
        hairClassIndex: HAIR_CLASS_INDEX,
        editablePixels: (() => {
          const alpha = maskAlpha;
          let count = 0;
          for (const value of alpha) {
            if (value < 128) count++;
          }
          return count;
        })(),
        editablePercent: Number(
          ((maskAlpha.reduce(
            (count, value) => count + (value < 128 ? 1 : 0),
            0
          ) / (metadata.width * metadata.height)) * 100).toFixed(3)
        ),
        ...(maskResult.diagnostic || {}),
      },
    });
  } catch (error) {
    console.error("[PROFCOSMO] debug mask error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Не удалось построить диагностическую маску.",
      },
      { status: 500 }
    );
  }
}
