import { NextResponse } from "next/server";
import sharp, { type OverlayOptions } from "sharp";
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


const FACE_DETECTOR_MODEL_URL =
  "https://github.com/yakhyo/uniface/releases/download/weights/scrfd_10g_kps.onnx";
const FACE_DETECTOR_MODEL_PATH =
  "/tmp/profcosmo-scrfd-10g-kps.onnx";

let faceDetectorSessionPromise: Promise<ort.InferenceSession> | null = null;
let faceDetectorModelPromise: Promise<Buffer> | null = null;

async function loadFaceDetectorModel() {
  if (!faceDetectorModelPromise) {
    faceDetectorModelPromise = (async () => {
      try {
        const fs = await import("node:fs/promises");
        const existing = await fs.stat(FACE_DETECTOR_MODEL_PATH);
        if (existing.size > 10_000_000) {
          return fs.readFile(FACE_DETECTOR_MODEL_PATH);
        }
      } catch {
        // First invocation.
      }

      const response = await fetch(FACE_DETECTOR_MODEL_URL);
      if (!response.ok) {
        throw new Error(
          `Не удалось загрузить SCRFD: HTTP \${response.status}`
        );
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.length < 10_000_000) {
        throw new Error("Файл SCRFD повреждён или слишком мал.");
      }

      const fs = await import("node:fs/promises");
      await fs.writeFile(FACE_DETECTOR_MODEL_PATH, buffer);
      return buffer;
    })();
  }

  return faceDetectorModelPromise;
}

async function getFaceDetectorSession() {
  if (!faceDetectorSessionPromise) {
    faceDetectorSessionPromise = (async () => {
      const model = await loadFaceDetectorModel();
      return ort.InferenceSession.create(model, {
        executionProviders: ["cpu"],
        graphOptimizationLevel: "all",
      });
    })();
  }

  return faceDetectorSessionPromise;
}

function distance2bbox(
  points: Float32Array | number[],
  distances: Float32Array | number[]
) {
  const count = Math.floor(points.length / 2);
  const boxes = new Float32Array(count * 4);

  for (let i = 0; i < count; i++) {
    const px = Number(points[i * 2]);
    const py = Number(points[i * 2 + 1]);
    const l = Number(distances[i * 4]);
    const t = Number(distances[i * 4 + 1]);
    const r = Number(distances[i * 4 + 2]);
    const b = Number(distances[i * 4 + 3]);

    boxes[i * 4] = px - l;
    boxes[i * 4 + 1] = py - t;
    boxes[i * 4 + 2] = px + r;
    boxes[i * 4 + 3] = py + b;
  }

  return boxes;
}

function nmsBoxes(
  detections: Array<[number, number, number, number, number]>,
  threshold: number
) {
  const order = detections
    .map((_, index) => index)
    .sort((a, b) => detections[b][4] - detections[a][4]);

  const keep: number[] = [];

  while (order.length) {
    const current = order.shift()!;
    keep.push(current);

    const [x1, y1, x2, y2] = detections[current];
    const areaA =
      Math.max(0, x2 - x1 + 1) *
      Math.max(0, y2 - y1 + 1);

    const remaining: number[] = [];

    for (const index of order) {
      const [xx1, yy1, xx2, yy2] = detections[index];
      const areaB =
        Math.max(0, xx2 - xx1 + 1) *
        Math.max(0, yy2 - yy1 + 1);

      const ix1 = Math.max(x1, xx1);
      const iy1 = Math.max(y1, yy1);
      const ix2 = Math.min(x2, xx2);
      const iy2 = Math.min(y2, yy2);

      const intersection =
        Math.max(0, ix2 - ix1 + 1) *
        Math.max(0, iy2 - iy1 + 1);

      const union = areaA + areaB - intersection;
      const iou = union > 0 ? intersection / union : 0;

      if (iou <= threshold) {
        remaining.push(index);
      }
    }

    order.splice(0, order.length, ...remaining);
  }

  return keep;
}

async function detectLargestFace(
  sourceBuffer: Buffer,
  width: number,
  height: number
) {
  const detectorInputSize = 640;

  const { data: rgb } = await sharp(sourceBuffer)
    .rotate()
    .resize(detectorInputSize, detectorInputSize, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 1 },
    })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // SCRFD expects BGR and (pixel - 127.5) / 127.5.
  const input = new Float32Array(
    1 * 3 * detectorInputSize * detectorInputSize
  );

  const plane = detectorInputSize * detectorInputSize;

  for (let i = 0; i < plane; i++) {
    const r = rgb[i * 3];
    const g = rgb[i * 3 + 1];
    const b = rgb[i * 3 + 2];

    input[i] = (b - 127.5) / 127.5;
    input[plane + i] = (g - 127.5) / 127.5;
    input[plane * 2 + i] = (r - 127.5) / 127.5;
  }

  const session = await getFaceDetectorSession();
  const inputName = session.inputNames[0];

  const outputs = await session.run({
    [inputName]: new ort.Tensor(
      "float32",
      input,
      [1, 3, detectorInputSize, detectorInputSize]
    ),
  });

  /*
   * SCRFD output order in UniFace:
   *   0..2 = scores for strides 8, 16, 32
   *   3..5 = bbox distances for strides 8, 16, 32
   *   6..8 = landmarks
   *
   * IMPORTANT:
   * bbox predictions are distances in feature-map units and MUST be
   * multiplied by the corresponding stride before distance2bbox().
   */
  const outputNames = session.outputNames;
  const outputValues = outputNames.map((name) => outputs[name]);

  const scoresByLevel = outputValues.slice(0, 3);
  const boxesByLevel = outputValues.slice(3, 6);
  const landmarksByLevel = outputValues.slice(6, 9);

  const strides = [8, 16, 32];
  const numAnchors = 2;
  const threshold = 0.5;

  const detections: Array<
    [number, number, number, number, number]
  > = [];
  const detectionLandmarks: Array<Array<[number, number]> | null> = [];

  /*
   * sharp(..., fit: "contain") centers the resized image inside the
   * 640x640 canvas by default. For a 1440x1920 portrait:
   *   1920 -> 640
   *   1440 -> 480
   *   horizontal padding = 80 px on each side.
   *
   * SCRFD coordinates are in the padded 640x640 image. We must remove
   * that padding before mapping them back to the original image.
   */
  const resizeFactor = Math.min(
    detectorInputSize / width,
    detectorInputSize / height
  );
  const resizedWidth = Math.round(width * resizeFactor);
  const resizedHeight = Math.round(height * resizeFactor);
  const padX = (detectorInputSize - resizedWidth) / 2;
  const padY = (detectorInputSize - resizedHeight) / 2;

  for (let level = 0; level < 3; level++) {
    const stride = strides[level];
    const scoresTensor = scoresByLevel[level];
    const boxesTensor = boxesByLevel[level];
    const landmarksTensor = landmarksByLevel[level];

    if (!scoresTensor?.data || !boxesTensor?.data) {
      continue;
    }

    const scores = scoresTensor.data as
      | Float32Array
      | number[];

    const boxValues = boxesTensor.data as
      | Float32Array
      | number[];

    const featureHeight = detectorInputSize / stride;
    const featureWidth = detectorInputSize / stride;
    const positions = featureHeight * featureWidth;

    for (let p = 0; p < positions; p++) {
      const x = (p % featureWidth) * stride;
      const y = Math.floor(p / featureWidth) * stride;

      for (let anchor = 0; anchor < numAnchors; anchor++) {
        const index = p * numAnchors + anchor;
        const score = Number(scores[index]);

        if (score < threshold) continue;

        const boxOffset = index * 4;

        // SCRFD bbox predictions are stride-relative.
        const distances = [
          Number(boxValues[boxOffset]) * stride,
          Number(boxValues[boxOffset + 1]) * stride,
          Number(boxValues[boxOffset + 2]) * stride,
          Number(boxValues[boxOffset + 3]) * stride,
        ];

        const box = distance2bbox(
          [x, y],
          distances
        );

        let landmarks: Array<[number, number]> | null = null;

        if (landmarksTensor?.data) {
          const landmarkValues = landmarksTensor.data as
            | Float32Array
            | number[];
          const landmarkOffset = index * 10;
          const decoded: Array<[number, number]> = [];

          for (let point = 0; point < 5; point++) {
            const dx =
              Number(landmarkValues[landmarkOffset + point * 2]) *
              stride;
            const dy =
              Number(landmarkValues[landmarkOffset + point * 2 + 1]) *
              stride;

            const px = x + dx;
            const py = y + dy;

            decoded.push([
              Math.max(0, Math.min(width, (px - padX) / resizeFactor)),
              Math.max(0, Math.min(height, (py - padY) / resizeFactor)),
            ]);
          }

          landmarks = decoded;
        }

        detections.push([
          Math.max(0, (box[0] - padX) / resizeFactor),
          Math.max(0, (box[1] - padY) / resizeFactor),
          Math.min(width, (box[2] - padX) / resizeFactor),
          Math.min(height, (box[3] - padY) / resizeFactor),
          score,
        ]);
        detectionLandmarks.push(landmarks);
      }
    }
  }

  if (!detections.length) {
    throw new Error(
      "SCRFD не нашёл лицо на фотографии."
    );
  }

  const keep = nmsBoxes(detections, 0.4);

  let bestIndex = keep[0];
  let best = detections[bestIndex];

  for (const index of keep) {
    const candidate = detections[index];

    const bestArea =
      Math.max(0, best[2] - best[0]) *
      Math.max(0, best[3] - best[1]);

    const candidateArea =
      Math.max(0, candidate[2] - candidate[0]) *
      Math.max(0, candidate[3] - candidate[1]);

    if (candidateArea > bestArea) {
      best = candidate;
      bestIndex = index;
    }
  }

  return {
    x1: best[0],
    y1: best[1],
    x2: best[2],
    y2: best[3],
    confidence: best[4],
    landmarks: detectionLandmarks[bestIndex] || null,
  };
}

async function getHairSegmentation(
  sourceFile: File,
  width: number,
  height: number
) {
  const sourceBuffer = Buffer.from(
    await sourceFile.arrayBuffer()
  );

  const face = await detectLargestFace(
    sourceBuffer,
    width,
    height
  );

  const faceWidth = face.x2 - face.x1;
  const faceHeight = face.y2 - face.y1;

  // BiSeNet is trained on a face crop. Keep the face large in the
  // parser input, while adding only enough margin to include the
  // existing hairstyle above the forehead.
  const cropLeft = Math.max(
    0,
    Math.round(face.x1 - faceWidth * 0.30)
  );
  const cropRight = Math.min(
    width,
    Math.round(face.x2 + faceWidth * 0.30)
  );
  const cropTop = Math.max(
    0,
    Math.round(face.y1 - faceHeight * 0.45)
  );
  const cropBottom = Math.min(
    height,
    Math.round(face.y2 + faceHeight * 0.20)
  );

  const cropWidth = Math.max(
    1,
    cropRight - cropLeft
  );
  const cropHeight = Math.max(
    1,
    cropBottom - cropTop
  );

  const { data: rgb } = await sharp(sourceBuffer)
    .rotate()
    .extract({
      left: cropLeft,
      top: cropTop,
      width: cropWidth,
      height: cropHeight,
    })
    .resize(512, 512, {
      fit: "fill",
    })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // BiSeNet expects RGB input normalized with ImageNet statistics.
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
    [inputName]: new ort.Tensor(
      "float32",
      input,
      [1, 3, 512, 512]
    ),
  });

  const output = outputs[session.outputNames[0]];
  if (!output?.data || !output.dims) {
    throw new Error(
      "BiSeNet не вернул карту сегментации."
    );
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
  const classCounts = new Array<number>(channels).fill(0);
  const hairMask = Buffer.alloc(outWidth * outHeight, 0);
  const diagnosticClassMasks = new Map<number, Buffer>();
  for (const cls of [14, 16, 17]) {
    diagnosticClassMasks.set(cls, Buffer.alloc(outWidth * outHeight, 0));
  }

  for (let y = 0; y < outHeight; y++) {
    for (let x = 0; x < outWidth; x++) {
      const pixel =
        y * outWidth + x;

      let bestClass = 0;
      let bestScore = -Infinity;

      for (let cls = 0; cls < channels; cls++) {
        const score = Number(
          values[
            cls * outHeight * outWidth + pixel
          ]
        );

        if (score > bestScore) {
          bestScore = score;
          bestClass = cls;
        }
      }

      classCounts[bestClass] += 1;

      if (bestClass === HAIR_CLASS_INDEX) {
        hairMask[pixel] = 255;
      }

      const diagnosticMask = diagnosticClassMasks.get(bestClass);
      if (diagnosticMask) {
        diagnosticMask[pixel] = 255;
      }
    }
  }

  const classDistribution = classCounts
    .map((count, index) => ({
      classIndex: index,
      pixels: count,
      percent: Number(
        (
          (count / (outWidth * outHeight)) *
          100
        ).toFixed(3)
      ),
    }))
    .sort((a, b) => b.pixels - a.pixels);

  const hairPixels =
    classCounts[HAIR_CLASS_INDEX] || 0;

  const cropMask = await sharp(hairMask, {
    raw: {
      width: outWidth,
      height: outHeight,
      channels: 1,
    },
  })
    .resize(cropWidth, cropHeight, {
      fit: "fill",
      kernel: "nearest",
    })
    .raw()
    .toBuffer();

  const fullMask = Buffer.alloc(
    width * height,
    0
  );

  for (let y = 0; y < cropHeight; y++) {
    const sourceY = cropTop + y;
    if (
      sourceY < 0 ||
      sourceY >= height
    ) continue;

    const sourceRow =
      sourceY * width;
    const cropRow =
      y * cropWidth;

    for (let x = 0; x < cropWidth; x++) {
      const sourceX = cropLeft + x;
      if (
        sourceX < 0 ||
        sourceX >= width
      ) continue;

      fullMask[sourceRow + sourceX] =
        cropMask[cropRow + x];
    }
  }

  const fullDiagnosticClassMasks: Record<number, Buffer> = {};

  for (const [cls, classMask] of diagnosticClassMasks.entries()) {
    const restored = await sharp(classMask, {
      raw: {
        width: outWidth,
        height: outHeight,
        channels: 1,
      },
    })
      .resize(cropWidth, cropHeight, {
        fit: "fill",
        kernel: "nearest",
      })
      .raw()
      .toBuffer();

    const full = Buffer.alloc(width * height, 0);

    for (let y = 0; y < cropHeight; y++) {
      const sourceY = cropTop + y;
      if (sourceY < 0 || sourceY >= height) continue;

      for (let x = 0; x < cropWidth; x++) {
        const sourceX = cropLeft + x;
        if (sourceX < 0 || sourceX >= width) continue;

        full[sourceY * width + sourceX] =
          restored[y * cropWidth + x];
      }
    }

    fullDiagnosticClassMasks[cls] = full;
  }

  return {
    data: fullMask,
    diagnosticClassMasks: fullDiagnosticClassMasks,
    info: {
      width,
      height,
      face: {
        x1: Number(face.x1.toFixed(1)),
        y1: Number(face.y1.toFixed(1)),
        x2: Number(face.x2.toFixed(1)),
        y2: Number(face.y2.toFixed(1)),
        confidence: Number(face.confidence.toFixed(4)),
        landmarks: face.landmarks
          ? face.landmarks.map(([x, y]) => [
              Number(x.toFixed(1)),
              Number(y.toFixed(1)),
            ])
          : null,
      },
      landmarks: face.landmarks
        ? face.landmarks.map(([x, y]) => [
            Number(x.toFixed(1)),
            Number(y.toFixed(1)),
          ])
        : null,
      crop: {
        left: cropLeft,
        top: cropTop,
        right: cropRight,
        bottom: cropBottom,
        width: cropWidth,
        height: cropHeight,
      },
      channels: 1,
      size: fullMask.length,
      parserOutputDims: dims,
      parserChannels: channels,
      parserOutWidth: outWidth,
      parserOutHeight: outHeight,
      parserHairPixels: hairPixels,
      parserTopClasses:
        classDistribution.slice(0, 8),
    },
  };
}

function createSafeGeometricMask(
  width: number,
  height: number,
  face: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    confidence: number;
    landmarks?: Array<[number, number]> | null;
  },
  structure: string,
  length: string
) {
  const alpha = Buffer.alloc(width * height, 255);

  const landmarks = face.landmarks;

  if (!landmarks || landmarks.length < 5) {
    return {
      alpha,
      usedLandmarks: false,
    };
  }

  const [leftEye, rightEye, nose, leftMouth, rightMouth] = landmarks;

  const eyeMidX = (leftEye[0] + rightEye[0]) / 2;
  const featureWidth = Math.max(
    1,
    Math.abs(rightEye[0] - leftEye[0])
  );
  const featureTop = Math.min(
    leftEye[1],
    rightEye[1],
    nose[1],
    leftMouth[1],
    rightMouth[1]
  );
  const featureBottom = Math.max(
    leftEye[1],
    rightEye[1],
    nose[1],
    leftMouth[1],
    rightMouth[1]
  );
  const featureHeight = Math.max(
    1,
    featureBottom - featureTop
  );

  const afro = structure === "afro-curls";
  const longHair =
    length === "below-shoulders" ||
    length === "long";

  /*
   * The inner ellipse is a hard face-protection boundary.
   * The outer zones are intentionally geometric and conservative:
   * crown + side hair area only. This is a diagnostic mask, not yet
   * the production hair mask.
   */
  const faceCx = eyeMidX;
  const faceCy =
    (featureTop + featureBottom) / 2 +
    featureHeight * 0.10;
  const faceRx =
    featureWidth * (afro ? 0.78 : 0.72);
  const faceRy =
    featureHeight * (afro ? 0.95 : 0.90);

  const crownRx =
    featureWidth * (afro ? 1.35 : 1.15);
  const crownTop =
    featureTop -
    featureHeight * (afro ? 1.05 : 0.85);
  const crownBottom =
    featureTop +
    featureHeight * (afro ? 0.95 : 0.80);

  const sideRx =
    featureWidth * (afro ? 1.50 : 1.30);
  const sideInnerRx =
    featureWidth * (afro ? 0.55 : 0.65);
  const sideTop =
    featureTop -
    featureHeight * 0.15;
  const sideBottom =
    featureBottom +
    featureHeight * (longHair ? 1.80 : 0.20);

  const setEditable = (
    x: number,
    y: number,
    editable: boolean
  ) => {
    if (
      x < 0 ||
      x >= width ||
      y < 0 ||
      y >= height
    ) {
      return;
    }

    if (editable) {
      alpha[y * width + x] = 0;
    }
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const nx = (x - faceCx) / Math.max(1, crownRx);
      const ny =
        (y - (crownTop + crownBottom) / 2) /
        Math.max(1, (crownBottom - crownTop) / 2);

      const inCrown = nx * nx + ny * ny <= 1;

      const faceDx =
        (x - faceCx) / Math.max(1, faceRx);
      const faceDy =
        (y - faceCy) / Math.max(1, faceRy);
      const inProtectedFace =
        faceDx * faceDx +
          faceDy * faceDy <=
        1;

      const leftSide =
        x >= faceCx - sideRx &&
        x <= faceCx - sideInnerRx &&
        y >= sideTop &&
        y <= sideBottom;

      const rightSide =
        x <= faceCx + sideRx &&
        x >= faceCx + sideInnerRx &&
        y >= sideTop &&
        y <= sideBottom;

      setEditable(
        x,
        y,
        (inCrown || leftSide || rightSide) &&
          !inProtectedFace
      );
    }
  }

  return {
    alpha,
    usedLandmarks: true,
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
  let segmentation: {
    data: Buffer;
    info: any;
    diagnosticClassMasks?: Record<number, Buffer>;
  } | null = null;
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
    diagnosticClassMasks:
      segmentation?.diagnosticClassMasks || {},
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

    const safeGeometricMask = createSafeGeometricMask(
      metadata.width,
      metadata.height,
      maskResult.diagnostic?.face
        ? {
            ...maskResult.diagnostic.face,
            landmarks:
              maskResult.diagnostic.landmarks || null,
          }
        : {
            x1: 0,
            y1: 0,
            x2: metadata.width,
            y2: metadata.height,
            confidence: 0,
            landmarks: null,
          },
      structure,
      length
    );

    const safeMaskRgba = Buffer.alloc(
      metadata.width * metadata.height * 4
    );

    for (let i = 0; i < safeGeometricMask.alpha.length; i++) {
      const offset = i * 4;
      safeMaskRgba[offset] = 255;
      safeMaskRgba[offset + 1] = 255;
      safeMaskRgba[offset + 2] = 255;
      safeMaskRgba[offset + 3] =
        safeGeometricMask.alpha[i];
    }

    const safeMaskPng = await sharp(safeMaskRgba, {
      raw: {
        width: metadata.width,
        height: metadata.height,
        channels: 4,
      },
    })
      .png()
      .toBuffer();

    const safeMaskView = await sharp(
      safeGeometricMask.alpha,
      {
        raw: {
          width: metadata.width,
          height: metadata.height,
          channels: 1,
        },
      }
    )
      .negate()
      .png()
      .toBuffer();

    const safePreview = await sharp(sourceBuffer)
      .composite([
        {
          input: await sharp(safeGeometricMask.alpha, {
            raw: {
              width: metadata.width,
              height: metadata.height,
              channels: 1,
            },
          })
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

    const diagnosticClassPreviews: Record<string, string> = {};

    if (maskResult.diagnosticClassMasks) {
      for (const cls of [14, 16, 17]) {
        const classMask = maskResult.diagnosticClassMasks[cls];
        if (!classMask) continue;

        const rgba = Buffer.alloc(metadata.width * metadata.height * 4);
        for (let i = 0; i < classMask.length; i++) {
          const offset = i * 4;
          rgba[offset] = 255;
          rgba[offset + 1] = 255;
          rgba[offset + 2] = 255;
          rgba[offset + 3] = classMask[i];
        }

        const overlay = await sharp(sourceBuffer)
          .composite([
            {
              input: await sharp(rgba, {
                raw: {
                  width: metadata.width,
                  height: metadata.height,
                  channels: 4,
                },
              })
                .png()
                .toBuffer(),
              blend: "screen",
            },
          ])
          .jpeg({ quality: 90 })
          .toBuffer();

        diagnosticClassPreviews[String(cls)] =
          `data:image/jpeg;base64,${overlay.toString("base64")}`;
      }
    }

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

    const faceInfo = maskResult.diagnostic?.face;
    const cropInfo = maskResult.diagnostic?.crop;

    const overlaySvg =
      faceInfo && cropInfo
        ? Buffer.from(`<svg width="${metadata.width}" height="${metadata.height}" xmlns="http://www.w3.org/2000/svg">
            <rect x="${faceInfo.x1}" y="${faceInfo.y1}" width="${Math.max(1, faceInfo.x2-faceInfo.x1)}" height="${Math.max(1, faceInfo.y2-faceInfo.y1)}" fill="none" stroke="red" stroke-width="8"/>
            <rect x="${cropInfo.left}" y="${cropInfo.top}" width="${cropInfo.width}" height="${cropInfo.height}" fill="none" stroke="yellow" stroke-width="6"/>
          </svg>`)
        : null;

    const previewComposites: OverlayOptions[] = [
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
    ];

    if (overlaySvg) {
      previewComposites.push({
        input: overlaySvg,
        blend: "over",
      });
    }

    const preview = await sharp(sourceBuffer)
      .resize(metadata.width, metadata.height)
      .composite(previewComposites)
      .jpeg({ quality: 92 })
      .toBuffer();

    return NextResponse.json({
      success: true,
      width: metadata.width,
      height: metadata.height,
      mask: `data:image/png;base64,${maskView.toString("base64")}`,
      preview: `data:image/jpeg;base64,${preview.toString("base64")}`,
      safeMask: `data:image/png;base64,${safeMaskView.toString("base64")}`,
      safeMaskPreview: `data:image/jpeg;base64,${safePreview.toString("base64")}`,
      safeMaskPng: `data:image/png;base64,${safeMaskPng.toString("base64")}`,
      diagnostic: {
        diagnosticVersion: "scrfd-safe-geometric-1",
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
        safeGeometricMask: {
          usedLandmarks: safeGeometricMask.usedLandmarks,
          editablePixels: safeGeometricMask.alpha.reduce(
            (count, value) => count + (value < 128 ? 1 : 0),
            0
          ),
        },
      },
      diagnosticClassPreviews,
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
