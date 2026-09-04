import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const VALID_GENDERS = ["female", "male"];

const VALID_LENGTHS = [
  "very-short",
  "short",
  "medium",
  "below-shoulders",
  "long",
];

const VALID_STRUCTURES = [
  "straight",
  "wavy",
  "curly",
  "afro-curls",
];

const VALID_FEMALE_BANGS = [
  "none",
  "straight",
  "side",
  "long",
  "curtain",
  "short",
];

const VALID_PARTINGS = [
  "center",
  "left",
  "right",
  "none",
];

const VALID_VOLUMES = [
  "low",
  "natural",
  "medium",
  "high",
];

const VALID_STYLINGS = [
  "natural",
  "smooth",
  "textured",
  "voluminous",
  "messy",
  "wet",
];

const VALID_ENDS = [
  "straight",
  "textured",
  "soft",
];

const VALID_MALE_FORMS = [
  "classic",
  "crop",
  "fade",
  "taper",
  "undercut",
  "textured",
  "elongated",
];

const VALID_TEMPLES = [
  "slanted",
  "straight",
  "skin-fade",
];

const VALID_COLORING = [
  "none",
  "solid",
  "highlighting",
  "balayage",
  "shatush",
  "airtouch",
  "ombre",
  "toning",
  "gray-camouflage",
  "blond",
];

function isValid(value: string, list: string[]) {
  return list.includes(value);
}

function getValue(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function getLengthDescription(length: string) {
  const map: Record<string, string> = {
    "very-short": "very short hair",
    short: "short hair",
    medium: "medium-length hair",
    "below-shoulders": "hair below the shoulders",
    long: "long hair",
  };

  return map[length] || length;
}

function getStructureDescription(structure: string) {
  const map: Record<string, string> = {
    straight: "straight hair",
    wavy: "wavy hair",
    curly: "curly hair",
    "afro-curls": "afro-textured curls",
  };

  return map[structure] || structure;
}

function getColoringDescription(coloring: string) {
  const map: Record<string, string> = {
    none: "no hair coloring; preserve the selected/current hair color",
    solid: "solid single-tone coloring",
    highlighting: "highlighting",
    balayage: "balayage",
    shatush: "shatush",
    airtouch: "AirTouch",
    ombre: "ombre",
    toning: "toning",
    "gray-camouflage": "gray hair camouflage",
    blond: "professional blonding",
  };

  return map[coloring] || coloring;
}

function buildPrompt({
  gender,
  length,
  structure,
  bangs,
  parting,
  volume,
  styling,
  ends,
  maleForm,
  temples,
  colorDepth,
  colorShade,
  coloring,
  variant,
}: {
  gender: string;
  length: string;
  structure: string;
  bangs: string;
  parting: string;
  volume: string;
  styling: string;
  ends: string;
  maleForm: string;
  temples: string;
  colorDepth: string;
  colorShade: string;
  coloring: string;
  variant: number;
}) {
  const genderDescription =
    gender === "female"
      ? "female"
      : "male";

  const lengthDescription = getLengthDescription(length);
  const structureDescription =
    getStructureDescription(structure);

  const variantInstructions = [
    "Create the most natural and conservative interpretation of the requested hairstyle.",
    "Create a second interpretation with a slightly different haircut shape while preserving the requested length category and color.",
    "Create a third interpretation with another professional variation while preserving the requested length category, hair structure and color.",
  ];

  let prompt = `
EDIT THE PROVIDED PHOTO.

This is a professional hairstyle consultation image.

The person in the source image MUST remain the same person.

CRITICAL IDENTITY PRESERVATION:
- Preserve the exact identity of the person.
- Preserve facial geometry.
- Preserve eyes, nose, mouth, jaw, cheekbones and skin texture.
- Do not change age.
- Do not change gender.
- Do not beautify or reconstruct the face.
- Do not create a different person.
- Do not alter facial expression unless absolutely necessary.
- Preserve the original body, shoulders, clothing and background whenever possible.

The primary task is to modify HAIR ONLY.

CLIENT:
Gender: ${genderDescription}

HAIR LENGTH:
${lengthDescription}

HAIR STRUCTURE:
${structureDescription}

COLOR:
Professional hair color level: ${colorDepth}.
Selected shade: ${colorShade}.
Coloring technique: ${getColoringDescription(coloring)}.
`;

  if (gender === "female") {
    prompt += `
FEMALE HAIRSTYLE PARAMETERS:

Bangs: ${bangs}
Parting: ${parting}
Volume: ${volume}
Styling: ${styling}
Ends: ${ends}

Use these parameters as professional constraints.

Do not replace the requested hairstyle with a random popular haircut.
The requested hair length is one of the primary characteristics.

The result should look physically realistic and professionally achievable by a hairdresser.
`;
  }

  if (gender === "male") {
    prompt += `
MALE HAIRSTYLE PARAMETERS:

Form: ${maleForm}
Temples: ${temples}

`;

    if (maleForm === "undercut" || maleForm === "elongated") {
      prompt += `
The selected length is especially important for this male form:
${lengthDescription}
`;
    } else {
      prompt += `
Do not introduce an unrelated long/short length change.
Preserve the natural proportions of the selected male form.
`;
    }

    prompt += `
Do not add bangs, side parting, styling controls, volume controls or nape controls.
`;
  }

  if (coloring === "none") {
    prompt += `
IMPORTANT COLOR RULE:
"No coloring" means DO NOT recolor the hair.
Preserve the person's original hair color as closely as possible.
The selected tone/shade should be interpreted as the current/reference color rather than an instruction to recolor.
`;
  } else {
    prompt += `
COLOR RULE:
The selected color level, shade and coloring technique are important.
Apply them professionally and realistically.
Do not invent a completely different color.
Do not change skin tone or facial features because of the hair color.
`;
  }

  prompt += `
VARIANT:
${variantInstructions[variant - 1]}

The three generated images will be shown together as professional hairstyle alternatives.

Prioritize:
1. Identity preservation.
2. Correct hair length.
3. Correct hair structure.
4. Correct selected color.
5. Correct professional hairstyle parameters.
6. Photorealistic integration.

Do not change anything unrelated to the requested hair transformation.
`;

  return prompt.trim();
}

function extractUrl(output: unknown): string | null {
  if (!output) return null;

  if (typeof output === "string") {
    return output;
  }

  if (
    typeof output === "object" &&
    output !== null &&
    "url" in output &&
    typeof (output as { url?: unknown }).url === "function"
  ) {
    const result = (output as { url: () => unknown }).url();

    if (typeof result === "string") {
      return result;
    }
  }

  if (Array.isArray(output)) {
    for (const item of output) {
      const url = extractUrl(item);

      if (url) {
        return url;
      }
    }
  }

  return null;
}

export async function POST(request: Request) {
  try {
    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json(
        {
          success: false,
          error: "REPLICATE_API_TOKEN не настроен.",
        },
        { status: 500 }
      );
    }

    const formData = await request.formData();

    const image = formData.get("image");

    if (!(image instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: "Фотография не загружена.",
        },
        { status: 400 }
      );
    }

    const gender = getValue(formData, "gender");
    const length = getValue(formData, "length");
    const structure = getValue(formData, "structure");

    const bangs = getValue(formData, "bangs");
    const parting = getValue(formData, "parting");
    const volume = getValue(formData, "volume");
    const styling = getValue(formData, "styling");
    const ends = getValue(formData, "ends");

    const maleForm = getValue(formData, "maleForm");
    const temples = getValue(formData, "temples");

    const colorDepth = getValue(formData, "colorDepth");
    const colorShade = getValue(formData, "colorShade");
    const coloring = getValue(formData, "coloring");

    const variantsRaw = getValue(formData, "variants");
    const variants = Math.min(
      Math.max(Number(variantsRaw) || 3, 1),
      3
    );

    if (!isValid(gender, VALID_GENDERS)) {
      return NextResponse.json(
        {
          success: false,
          error: "Выберите корректный пол.",
        },
        { status: 400 }
      );
    }

    if (!isValid(length, VALID_LENGTHS)) {
      return NextResponse.json(
        {
          success: false,
          error: "Выберите корректную длину.",
        },
        { status: 400 }
      );
    }

    if (!isValid(structure, VALID_STRUCTURES)) {
      return NextResponse.json(
        {
          success: false,
          error: "Выберите корректную структуру волос.",
        },
        { status: 400 }
      );
    }

    if (!colorDepth || !/^(10|[1-9])$/.test(colorDepth)) {
      return NextResponse.json(
        {
          success: false,
          error: "Выберите корректный уровень тона.",
        },
        { status: 400 }
      );
    }

    if (!colorShade) {
      return NextResponse.json(
        {
          success: false,
          error: "Выберите оттенок.",
        },
        { status: 400 }
      );
    }

    if (!isValid(coloring, VALID_COLORING)) {
      return NextResponse.json(
        {
          success: false,
          error: "Выберите корректную технику окрашивания.",
        },
        { status: 400 }
      );
    }

    if (gender === "female") {
      if (!isValid(bangs, VALID_FEMALE_BANGS)) {
        return NextResponse.json(
          {
            success: false,
            error: "Выберите корректную чёлку.",
          },
          { status: 400 }
        );
      }

      if (!isValid(parting, VALID_PARTINGS)) {
        return NextResponse.json(
          {
            success: false,
            error: "Выберите корректный пробор.",
          },
          { status: 400 }
        );
      }

      if (!isValid(volume, VALID_VOLUMES)) {
        return NextResponse.json(
          {
            success: false,
            error: "Выберите корректный объём.",
          },
          { status: 400 }
        );
      }

      if (!isValid(styling, VALID_STYLINGS)) {
        return NextResponse.json(
          {
            success: false,
            error: "Выберите корректную укладку.",
          },
          { status: 400 }
        );
      }

      if (!isValid(ends, VALID_ENDS)) {
        return NextResponse.json(
          {
            success: false,
            error: "Выберите корректные концы.",
          },
          { status: 400 }
        );
      }
    }

    if (gender === "male") {
      if (!isValid(maleForm, VALID_MALE_FORMS)) {
        return NextResponse.json(
          {
            success: false,
            error: "Выберите корректную мужскую форму.",
          },
          { status: 400 }
        );
      }

      if (!isValid(temples, VALID_TEMPLES)) {
        return NextResponse.json(
          {
            success: false,
            error: "Выберите корректный вариант висков.",
          },
          { status: 400 }
        );
      }
    }

    const bytes = await image.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    const mimeType = image.type || "image/jpeg";

    const inputImage = `data:${mimeType};base64,${base64}`;

    const imageUrls: string[] = [];

    for (let variant = 1; variant <= variants; variant++) {
      const prompt = buildPrompt({
        gender,
        length,
        structure,
        bangs,
        parting,
        volume,
        styling,
        ends,
        maleForm,
        temples,
        colorDepth,
        colorShade,
        coloring,
        variant,
      });

      const output = await replicate.run(
        "black-forest-labs/flux-kontext-pro",
        {
          input: {
            prompt,
            input_image: inputImage,
            aspect_ratio: "match_input_image",
            output_format: "jpg",
            safety_tolerance: 2,
            prompt_upsampling: false,
          },
        }
      );

      const url = extractUrl(output);

      if (url) {
        imageUrls.push(url);
      }
    }

    if (!imageUrls.length) {
      return NextResponse.json(
        {
          success: false,
          error: "AI не вернул изображения.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      imageUrls,
    });
  } catch (error) {
    console.error("Generation error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Ошибка генерации.",
      },
      { status: 500 }
    );
  }
}
