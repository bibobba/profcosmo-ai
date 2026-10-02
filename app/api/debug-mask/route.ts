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

const MODNET_MODEL_URL =
  "https://huggingface.co/yakhyo/uniface-weights/resolve/main/modnet_photographic.onnx";
const MODNET_MODEL_PATH =
  "/tmp/profcosmo-modnet-photographic.onnx";

let modnetSessionPromise: Promise<ort.InferenceSession> | null = null;
let modnetModelPromise: Promise<Buffer> | null = null;

async function loadModnetModel() {
  if (!modnetModelPromise) {
    modnetModelPromise = (async () => {
      try {
        const fs = await import("node:fs/promises");
        const existing = await fs.stat(MODNET_MODEL_PATH);
        if (existing.size > 10_000_000) {
          return fs.readFile(MODNET_MODEL_PATH);
        }
      } catch {
        // First invocation.
      }

      console.log("[PROFCOSMO] downloading MODNet ONNX model");
      const response = await fetch(MODNET_MODEL_URL);
      if (!response.ok) {
        throw new Error(
          `Не удалось загрузить MODNet: HTTP ${response.status}`
        );
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.length < 10_000_000) {
        throw new Error("Файл MODNet повреждён или слишком мал.");
      }

      const fs = await import("node:fs/promises");
      await fs.writeFile(MODNET_MODEL_PATH, buffer);
      console.log("[PROFCOSMO] MODNet ONNX model ready", {
        megabytes: Math.round(buffer.length / 1024 / 1024),
      });
      return buffer;
    })();
  }

  return modnetModelPromise;
}

async function getModnetSession() {
  if (!modnetSessionPromise) {
    modnetSessionPromise = (async () => {
      const model = await loadModnetModel();
      const session = await ort.InferenceSession.create(model, {
        executionProviders: ["cpu"],
        graphOptimizationLevel: "all",
      });
      console.log("[PROFCOSMO] MODNet session ready", {
        inputs: session.inputNames,
        outputs: session.outputNames,
      });
      return session;
    })();
  }

  return modnetSessionPromise;
}

const MOBILE_HAIRNET_MODEL_URL =
  "https://github.com/clibdev/mobile-hair-segmentation-pytorch/releases/latest/download/mobile-hair-net-v2.onnx";
const MOBILE_HAIRNET_MODEL_PATH =
  "/tmp/profcosmo-mobile-hairnet-v2.onnx";

let mobileHairNetSessionPromise: Promise<ort.InferenceSession> | null = null;
let mobileHairNetModelPromise: Promise<Buffer> | null = null;

async function loadMobileHairNetModel() {
  if (!mobileHairNetModelPromise) {
    mobileHairNetModelPromise = (async () => {
      try {
        const fs = await import("node:fs/promises");
        const existing = await fs.stat(MOBILE_HAIRNET_MODEL_PATH);
        if (existing.size > 5_000_000) return fs.readFile(MOBILE_HAIRNET_MODEL_PATH);
      } catch {}
      const response = await fetch(MOBILE_HAIRNET_MODEL_URL);
      if (!response.ok) throw new Error(`Не удалось загрузить MobileHairNet V2: HTTP ${response.status}`);
      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.length < 5_000_000) throw new Error("Файл MobileHairNet V2 повреждён или слишком мал.");
      const fs = await import("node:fs/promises");
      await fs.writeFile(MOBILE_HAIRNET_MODEL_PATH, buffer);
      return buffer;
    })();
  }
  return mobileHairNetModelPromise;
}

async function getMobileHairNetSession() {
  if (!mobileHairNetSessionPromise) {
    mobileHairNetSessionPromise = (async () => {
      const model = await loadMobileHairNetModel();
      return ort.InferenceSession.create(model, {
        executionProviders: ["cpu"],
        graphOptimizationLevel: "all",
      });
    })();
  }
  return mobileHairNetSessionPromise;
}

async function getMobileHairNetMask(
  sourceBuffer: Buffer,
  width: number,
  height: number,
  face: { x1: number; y1: number; x2: number; y2: number }
) {
  const inputSize = 224;

  // MobileHairNet is a hair/head model. Do not feed it the whole portrait.
  // Crop around the detected face so hair occupies a large fraction of the input.
  const faceWidth = face.x2 - face.x1;
  const faceHeight = face.y2 - face.y1;

  const cropLeft = Math.max(0, Math.round(face.x1 - faceWidth * 0.60));
  const cropTop = Math.max(0, Math.round(face.y1 - faceHeight * 0.50));
  const cropRight = Math.min(width, Math.round(face.x2 + faceWidth * 0.60));
  const cropBottom = Math.min(height, Math.round(face.y2 + faceHeight * 0.20));

  const cropWidth = cropRight - cropLeft;
  const cropHeight = cropBottom - cropTop;

  const { data: rgb } = await sharp(sourceBuffer)
    .rotate()
    .extract({
      left: cropLeft,
      top: cropTop,
      width: cropWidth,
      height: cropHeight,
    })
    .resize(inputSize, inputSize, { fit: "fill" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const input = new Float32Array(1 * 3 * inputSize * inputSize);
  const plane = inputSize * inputSize;
  for (let i = 0; i < plane; i++) {
    input[i] = (rgb[i * 3] / 255 - 0.5) / 0.5;
    input[plane + i] = (rgb[i * 3 + 1] / 255 - 0.5) / 0.5;
    input[plane * 2 + i] = (rgb[i * 3 + 2] / 255 - 0.5) / 0.5;
  }

  const session = await getMobileHairNetSession();
  const outputs = await session.run({
    [session.inputNames[0]]: new ort.Tensor("float32", input, [1, 3, inputSize, inputSize]),
  });
  const output = outputs[session.outputNames[0]];
  if (!output?.data || !output.dims) throw new Error("MobileHairNet V2 не вернул маску волос.");

  const dims = output.dims.map(Number);
  if (dims.length !== 4 || dims[1] < 2) {
    throw new Error(`Неожиданная форма выхода MobileHairNet V2: [${dims.join(", ")}]`);
  }
  const channels = dims[1], outHeight = dims[2], outWidth = dims[3];
  const values = output.data as Float32Array | number[];
  const small = Buffer.alloc(outWidth * outHeight);
  for (let y = 0; y < outHeight; y++) {
    for (let x = 0; x < outWidth; x++) {
      const pixel = y * outWidth + x;
      let bestClass = 0, bestScore = -Infinity;
      for (let cls = 0; cls < channels; cls++) {
        const score = Number(values[cls * outHeight * outWidth + pixel]);
        if (score > bestScore) { bestScore = score; bestClass = cls; }
      }
      small[pixel] = bestClass > 0 ? 255 : 0;
    }
  }
  const cropMask = await sharp(small, {
    raw: { width: outWidth, height: outHeight, channels: 1 },
  })
    .resize(cropWidth, cropHeight, { fit: "fill", kernel: "nearest" })
    .raw()
    .toBuffer();

  const fullMask = Buffer.alloc(width * height, 0);
  for (let y = 0; y < cropHeight; y++) {
    cropMask.copy(
      fullMask,
      (cropTop + y) * width + cropLeft,
      y * cropWidth,
      (y + 1) * cropWidth
    );
  }

  return {
    mask: fullMask,
    outputDims: dims,
    crop: {
      left: cropLeft,
      top: cropTop,
      right: cropRight,
      bottom: cropBottom,
      width: cropWidth,
      height: cropHeight,
    },
  };
}

async function getModnetMatte(
  sourceBuffer: Buffer,
  width: number,
  height: number
) {
  const inputSize = 512;

  const { data: rgb } = await sharp(sourceBuffer)
    .rotate()
    .resize(inputSize, inputSize, {
      fit: "fill",
    })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // MODNet photographic preprocessing:
  // RGB -> [0,1] -> normalize to [-1,1] -> NCHW.
  const input = new Float32Array(
    1 * 3 * inputSize * inputSize
  );
  const plane = inputSize * inputSize;

  for (let i = 0; i < plane; i++) {
    input[i] =
      (rgb[i * 3] / 255 - 0.5) / 0.5;
    input[plane + i] =
      (rgb[i * 3 + 1] / 255 - 0.5) / 0.5;
    input[plane * 2 + i] =
      (rgb[i * 3 + 2] / 255 - 0.5) / 0.5;
  }

  const session = await getModnetSession();
  const inputName = session.inputNames[0];
  const outputs = await session.run({
    [inputName]: new ort.Tensor(
      "float32",
      input,
      [1, 3, inputSize, inputSize]
    ),
  });

  const output = outputs[session.outputNames[0]];
  if (!output?.data || !output.dims) {
    throw new Error("MODNet не вернул matte.");
  }

  const dims = output.dims.map(Number);
  if (dims.length !== 4) {
    throw new Error(
      `Неожиданная форма выхода MODNet: [${dims.join(", ")}]`
    );
  }

  const matteHeight = dims[2];
  const matteWidth = dims[3];
  const values = output.data as Float32Array | number[];

  const small = Buffer.alloc(
    matteWidth * matteHeight
  );

  for (let i = 0; i < small.length; i++) {
    const value = Math.max(
      0,
      Math.min(1, Number(values[i]))
    );
    small[i] = Math.round(value * 255);
  }

  const matte = await sharp(small, {
    raw: {
      width: matteWidth,
      height: matteHeight,
      channels: 1,
    },
  })
    .resize(width, height, {
      fit: "fill",
      kernel: "linear",
    })
    .raw()
    .toBuffer();

  return {
    matte,
    dims,
  };
}

function createModnetHairCandidate(
  matte: Buffer,
  width: number,
  height: number,
  face: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    landmarks?: Array<[number, number]> | null;
  },
  structure: string,
  length: string
) {
  const result = Buffer.alloc(width * height, 0);

  const faceWidth = Math.max(1, face.x2 - face.x1);
  const faceHeight = Math.max(1, face.y2 - face.y1);
  const afro = structure === "afro-curls";
  const longHair =
    length === "below-shoulders" ||
    length === "long";

  // MODNet gives the person matte. We use SCRFD only to restrict it
  // to the head/hair neighborhood; the matte itself determines the
  // actual silhouette instead of a geometric ellipse.
  const left = Math.max(
    0,
    Math.floor(face.x1 - faceWidth * (afro ? 1.45 : 1.15))
  );
  const right = Math.min(
    width,
    Math.ceil(face.x2 + faceWidth * (afro ? 1.45 : 1.15))
  );
  const top = Math.max(
    0,
    Math.floor(face.y1 - faceHeight * (afro ? 1.45 : 1.15))
  );
  const bottom = Math.min(
    height,
    Math.ceil(
      face.y2 +
        faceHeight *
          (longHair ? 2.2 : afro ? 0.65 : 0.35)
    )
  );

  const landmarks = face.landmarks;
  let faceCx = (face.x1 + face.x2) / 2;
  let faceCy = (face.y1 + face.y2) / 2;
  let faceRx = faceWidth * 0.58;
  let faceRy = faceHeight * 0.68;

  if (landmarks && landmarks.length >= 5) {
    const [leftEye, rightEye, nose, leftMouth, rightMouth] =
      landmarks;
    faceCx = (leftEye[0] + rightEye[0]) / 2;
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
    faceCy =
      (featureTop + featureBottom) / 2 +
      (featureBottom - featureTop) * 0.10;
    faceRx =
      Math.abs(rightEye[0] - leftEye[0]) *
      (afro ? 0.95 : 0.90);
    faceRy =
      Math.max(1, featureBottom - featureTop) *
      (afro ? 1.25 : 1.18);
  }

  for (let y = top; y < bottom; y++) {
    for (let x = left; x < right; x++) {
      if (matte[y * width + x] < 90) continue;

      const dx = (x - faceCx) / Math.max(1, faceRx);
      const dy = (y - faceCy) / Math.max(1, faceRy);
      const inProtectedFace =
        dx * dx + dy * dy <= 1;

      if (!inProtectedFace) {
        result[y * width + x] = matte[y * width + x];
      }
    }
  }

  return result;
}


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

function createHybridHairMask(
  matte: Buffer,
  skinMask: Buffer | undefined,
  leftEarMask: Buffer | undefined,
  rightEarMask: Buffer | undefined,
  neckMask: Buffer | undefined,
  clothMask: Buffer | undefined,
  width: number,
  height: number,
  face: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    landmarks?: Array<[number, number]> | null;
  },
  structure: string,
  length: string
) {
  const result = Buffer.alloc(width * height, 0);

  const faceWidth = Math.max(1, face.x2 - face.x1);
  const faceHeight = Math.max(1, face.y2 - face.y1);
  const afro = structure === "afro-curls";
  const longHair =
    length === "below-shoulders" || length === "long";

  const left = Math.max(
    0,
    Math.floor(face.x1 - faceWidth * (afro ? 1.45 : 1.15))
  );
  const right = Math.min(
    width,
    Math.ceil(face.x2 + faceWidth * (afro ? 1.45 : 1.15))
  );
  const top = Math.max(
    0,
    Math.floor(face.y1 - faceHeight * (afro ? 1.35 : 1.05))
  );
  // Short male hair must never reach the neck or clothing.
  // For long hair we intentionally allow the editable zone below the face.
  const jawlineY = face.y2;
  const bottom = Math.min(
    height,
    Math.ceil(
      longHair
        ? face.y2 + faceHeight * 1.7
        : afro
          ? face.y2 + faceHeight * 0.08
          : jawlineY
    )
  );

  let faceCx = (face.x1 + face.x2) / 2;
  let faceCy = (face.y1 + face.y2) / 2;
  let faceRx = faceWidth * 0.58;
  let faceRy = faceHeight * 0.68;

  const landmarks = face.landmarks;
  if (landmarks && landmarks.length >= 5) {
    const [leftEye, rightEye, nose, leftMouth, rightMouth] = landmarks;
    const featureTop = Math.min(
      leftEye[1], rightEye[1], nose[1], leftMouth[1], rightMouth[1]
    );
    const featureBottom = Math.max(
      leftEye[1], rightEye[1], nose[1], leftMouth[1], rightMouth[1]
    );
    faceCx = (leftEye[0] + rightEye[0]) / 2;
    faceCy =
      (featureTop + featureBottom) / 2 +
      (featureBottom - featureTop) * 0.10;
    faceRx =
      Math.abs(rightEye[0] - leftEye[0]) * (afro ? 1.02 : 0.96);
    faceRy =
      Math.max(1, featureBottom - featureTop) * (afro ? 1.30 : 1.22);
  }

  const faceProtection = (x: number, y: number) => {
    const dx = (x - faceCx) / Math.max(1, faceRx);
    const dy = (y - faceCy) / Math.max(1, faceRy);
    return dx * dx + dy * dy <= 1;
  };

  for (let y = top; y < bottom; y++) {
    for (let x = left; x < right; x++) {
      const i = y * width + x;

      // MODNet establishes that the pixel belongs to the person.
      if (matte[i] < 110) continue;

      // Existing face parsing is used only as a veto mask.
      if ((skinMask?.[i] ?? 0) >= 128) continue;
      if ((leftEarMask?.[i] ?? 0) >= 128) continue;
      if ((rightEarMask?.[i] ?? 0) >= 128) continue;
      if ((neckMask?.[i] ?? 0) >= 128) continue;
      if ((clothMask?.[i] ?? 0) >= 128) continue;

      // Deterministic face protection wins over every learned mask.
      if (faceProtection(x, y)) continue;

      // Hard anatomical cutoff: for short/medium hair, nothing below
      // the detected face box can become editable. This prevents MODNet
      // person matte from leaking into neck, shirt and shoulders.
      if (!longHair && y >= jawlineY) continue;

      result[i] = matte[i];
    }
  }

  return result;
}

function createSafeGeometricMask(
  width:number,height:number,
  face:{x1:number;y1:number;x2:number;y2:number;confidence:number;landmarks?:Array<[number,number]>|null},
  structure:string,length:string
){
  const alpha=Buffer.alloc(width*height,255);
  const landmarks=face.landmarks;
  if(!landmarks||landmarks.length<5) return {alpha,usedLandmarks:false};

  const [leftEye,rightEye,nose,leftMouth,rightMouth]=landmarks;
  const eyeDistance=Math.max(1,Math.abs(rightEye[0]-leftEye[0]));
  const centerX=(leftEye[0]+rightEye[0])/2;
  const featureTop=Math.min(leftEye[1],rightEye[1],nose[1],leftMouth[1],rightMouth[1]);
  const featureBottom=Math.max(leftEye[1],rightEye[1],nose[1],leftMouth[1],rightMouth[1]);
  const featureHeight=Math.max(1,featureBottom-featureTop);

  const outerTop=featureTop-featureHeight*2.45;
  const outerBottom=featureBottom+featureHeight*0.35;
  const outerCenterY=(outerTop+outerBottom)/2;
  const outerRadiusX=eyeDistance*1.70;
  const outerRadiusY=Math.max(1,(outerBottom-outerTop)/2);

  const estimatedHairlineY=Math.min(face.y1-featureHeight*0.15,featureTop-featureHeight*1.35);
  const protectedFaceBottom=featureBottom+featureHeight*0.55;
  const earY=featureTop+featureHeight*0.50;
  const earRadiusX=eyeDistance*0.25;
  const earRadiusY=featureHeight*0.45;
  const neckCenterY=featureBottom+featureHeight*0.45;
  const neckRadiusX=eyeDistance;
  const neckRadiusY=featureHeight*0.70;

  const insideEllipse=(x:number,y:number,cx:number,cy:number,rx:number,ry:number)=>{
    const dx=(x-cx)/Math.max(1,rx),dy=(y-cy)/Math.max(1,ry);
    return dx*dx+dy*dy<=1;
  };

  const top=Math.max(0,Math.floor(outerTop));
  const bottom=Math.min(height,Math.ceil(outerBottom));

  for(let y=top;y<bottom;y++){
    for(let x=0;x<width;x++){
      if(!insideEllipse(x,y,centerX,outerCenterY,outerRadiusX,outerRadiusY)) continue;
      let protectedFace=false;
      if(y>=estimatedHairlineY&&y<=protectedFaceBottom){
        const t=Math.max(0,Math.min(1,(y-estimatedHairlineY)/Math.max(1,protectedFaceBottom-estimatedHairlineY)));
        protectedFace=Math.abs(x-centerX)<=eyeDistance*(0.72+0.30*t);
      }
      const leftEar=insideEllipse(x,y,centerX-eyeDistance*1.05,earY,earRadiusX,earRadiusY);
      const rightEar=insideEllipse(x,y,centerX+eyeDistance*1.05,earY,earRadiusX,earRadiusY);
      const protectedNeck=insideEllipse(x,y,centerX,neckCenterY,neckRadiusX,neckRadiusY);
      if(protectedFace||leftEar||rightEar||protectedNeck) continue;
      alpha[y*width+x]=0;
    }
  }
  void structure; void length;
  return {alpha,usedLandmarks:true};
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

    let modnetMatte: Buffer | null = null;
    let modnetHairCandidate: Buffer | null = null;
    let modnetError: string | null = null;

    try {
      const modnet = await getModnetMatte(
        sourceBuffer,
        metadata.width,
        metadata.height
      );
      modnetMatte = modnet.matte;

      const faceForModnet = maskResult.diagnostic?.face;
      if (faceForModnet) {
        modnetHairCandidate = createModnetHairCandidate(
          modnetMatte,
          metadata.width,
          metadata.height,
          {
            ...faceForModnet,
            landmarks:
              maskResult.diagnostic?.landmarks || null,
          },
          structure,
          length
        );
      }
    } catch (error) {
      modnetError =
        error instanceof Error ? error.message : String(error);
      console.error("[PROFCOSMO] MODNet diagnostic failed:", error);
    }

    let hybridHairMask: Buffer | null = null;

    const hybridFace = maskResult.diagnostic?.face;
    const classMasks = maskResult.diagnostic?.diagnosticClassMasks;

    if (modnetMatte && hybridFace) {
      hybridHairMask = createHybridHairMask(
        modnetMatte,
        classMasks?.[1],
        classMasks?.[7],
        classMasks?.[8],
        classMasks?.[14],
        classMasks?.[16],
        metadata.width,
        metadata.height,
        {
          ...hybridFace,
          landmarks: maskResult.diagnostic?.landmarks || null,
        },
        structure,
        length
      );
    }

    let mobileHairNetMask: Buffer | null = null;
    let mobileHairNetError: string | null = null;
    let mobileHairNetDims: number[] | null = null;
    let mobileHairNetCrop: {
      left: number;
      top: number;
      right: number;
      bottom: number;
      width: number;
      height: number;
    } | null = null;

    try {
      const faceForMobileHairNet = maskResult.diagnostic?.face;
      if (!faceForMobileHairNet) {
        throw new Error("SCRFD не вернул координаты лица для MobileHairNet.");
      }

      const result = await getMobileHairNetMask(
        sourceBuffer,
        metadata.width,
        metadata.height,
        faceForMobileHairNet
      );
      mobileHairNetMask = result.mask;
      mobileHairNetDims = result.outputDims;
      mobileHairNetCrop = result.crop;
    } catch (error) {
      mobileHairNetError = error instanceof Error ? error.message : String(error);
      console.error("[PROFCOSMO] MobileHairNet diagnostic failed:", error);
    }

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

    let hybridHairPreview: string | null = null;
    let hybridHairCleanMask: string | null = null;

    if (hybridHairMask) {
      const hybridClean = await sharp(hybridHairMask, {
        raw: { width: metadata.width, height: metadata.height, channels: 1 },
      }).png().toBuffer();

      hybridHairCleanMask =
        `data:image/png;base64,${hybridClean.toString("base64")}`;

      const hybridOverlay = await sharp(sourceBuffer)
        .composite([{
          input: await sharp(hybridHairMask, {
            raw: { width: metadata.width, height: metadata.height, channels: 1 },
          }).png().toBuffer(),
          blend: "screen",
        }])
        .jpeg({ quality: 92 })
        .toBuffer();

      hybridHairPreview =
        `data:image/jpeg;base64,${hybridOverlay.toString("base64")}`;
    }

    let mobileHairNetPreview: string | null = null;
    let mobileHairNetCleanMask: string | null = null;

    if (mobileHairNetMask) {
      const clean = await sharp(mobileHairNetMask, {
        raw: { width: metadata.width, height: metadata.height, channels: 1 },
      }).png().toBuffer();
      mobileHairNetCleanMask = `data:image/png;base64,${clean.toString("base64")}`;

      const overlay = await sharp(sourceBuffer).composite([{
        input: await sharp(mobileHairNetMask, {
          raw: { width: metadata.width, height: metadata.height, channels: 1 },
        }).png().toBuffer(),
        blend: "screen",
      }]).jpeg({ quality: 92 }).toBuffer();

      mobileHairNetPreview = `data:image/jpeg;base64,${overlay.toString("base64")}`;
    }

    const diagnosticClassPreviews: Record<string, string> = {};

    let modnetMatteView: string | null = null;
    let modnetHairCandidateView: string | null = null;

    if (modnetMatte) {
      const mattePng = await sharp(modnetMatte, {
        raw: {
          width: metadata.width,
          height: metadata.height,
          channels: 1,
        },
      })
        .png()
        .toBuffer();

      const matteOverlay = await sharp(sourceBuffer)
        .composite([
          {
            input: await sharp(modnetMatte, {
              raw: {
                width: metadata.width,
                height: metadata.height,
                channels: 1,
              },
            })
              .negate()
              .blur(0.3)
              .linear(0.65, 0)
              .png()
              .toBuffer(),
            blend: "screen",
          },
        ])
        .jpeg({ quality: 92 })
        .toBuffer();

      modnetMatteView =
        `data:image/jpeg;base64,${matteOverlay.toString("base64")}`;

      if (modnetHairCandidate) {
        const candidateOverlay = await sharp(sourceBuffer)
          .composite([
            {
              input: await sharp(modnetHairCandidate, {
                raw: {
                  width: metadata.width,
                  height: metadata.height,
                  channels: 1,
                },
              })
                .negate()
                .blur(0.3)
                .linear(0.65, 0)
                .png()
                .toBuffer(),
              blend: "screen",
            },
          ])
          .jpeg({ quality: 92 })
          .toBuffer();

        modnetHairCandidateView =
          `data:image/jpeg;base64,${candidateOverlay.toString("base64")}`;
      }

      void mattePng;
    }



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
      modnetMattePreview: modnetMatteView,
      modnetHairCandidatePreview: modnetHairCandidateView,
      hybridHairPreview,
      hybridHairCleanMask,
      mobileHairNetPreview,
      mobileHairNetCleanMask,
      diagnostic: {

        diagnosticVersion: "scrfd-short-head-geometric-2",
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
        modnet: {
          available: Boolean(modnetMatte),
          error: modnetError,
        },
        hybridHair: {
          available: Boolean(hybridHairMask),
          editablePixels: hybridHairMask
            ? hybridHairMask.reduce((count, value) => count + (value >= 128 ? 1 : 0), 0)
            : 0,
        },
        mobileHairNet: {
          available: Boolean(mobileHairNetMask),
          error: mobileHairNetError,
          outputDims: mobileHairNetDims,
          crop: mobileHairNetCrop,
          editablePixels: mobileHairNetMask
            ? mobileHairNetMask.reduce((count, value) => count + (value >= 128 ? 1 : 0), 0)
            : 0,
        },
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
