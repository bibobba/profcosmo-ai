import { NextResponse } from "next/server";
import { put, issueSignedToken, presignUrl } from "@vercel/blob";

const OPENAI_EDIT_URL = "https://api.openai.com/v1/images/edits";

const ALLOWED_GENDERS = ["female", "male"] as const;

const FEMALE_LENGTHS = [
  "very-short",
  "short",
  "medium",
  "below-shoulders",
  "long",
] as const;

const STRUCTURES = [
  "straight",
  "wavy",
  "curly",
  "afro-curls",
] as const;

const FEMALE_FORMS = [
  "ai-podbor",
  "straight-cut",
  "graduated",
  "layers",
  "cascade",
  "asymmetrical",
] as const;

const FEMALE_BANGS = [
  "none",
  "straight",
  "side",
  "long",
  "curtain",
  "short",
] as const;

const FEMALE_PARTINGS = [
  "center",
  "left",
  "right",
  "none",
] as const;

const FEMALE_VOLUMES = [
  "low",
  "natural",
  "medium",
  "high",
] as const;

const FEMALE_STYLINGS = [
  "natural",
  "smooth",
  "textured",
  "voluminous",
  "messy",
  "wet",
] as const;

const FEMALE_ENDS = [
  "straight",
  "textured",
  "soft",
] as const;

const MALE_FORMS = [
  "classic",
  "crop",
  "fade",
  "taper",
  "undercut",
  "textured",
  "elongated",
] as const;

const MALE_TEMPLES = [
  "slanted",
  "straight",
  "skin-fade",
] as const;

const COLORING = [
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
] as const;

const COLOR_DEPTHS = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
] as const;

const COLOR_SHADES = [
  "natural",
  "ash",
  "beige",
  "golden",
  "copper",
  "red",
  "chocolate",
  "violet",
] as const;

type Gender = (typeof ALLOWED_GENDERS)[number];

type Variant = {
  length: string;
  structure: string;

  femaleForm: string;
  femaleBang: string;
  femaleParting: string;
  femaleVolume: string;
  femaleStyling: string;
  femaleEnds: string;

  maleForm: string;
  maleTemples: string;
};

type ColorSettings = {
  colorDepth: string;
  colorShade: string;
  coloring: string;
};

function isAllowed(
  value: string,
  values: readonly string[]
): boolean {
  return values.includes(value);
}

function normalizeFemaleForm(value: string): string {
  if (value === "blunt") {
    return "straight-cut";
  }

  return value;
}

function getLengthDescription(
  gender: Gender,
  length: string,
  maleForm: string
): string {
  if (gender === "male") {
    if (maleForm === "undercut") {
      return "medium length on top with clearly shorter sides and back";
    }

    if (maleForm === "elongated") {
      return "elongated medium-to-long hair";
    }

    return "short men's haircut length";
  }

  switch (length) {
    case "very-short":
      return "very short hair";
    case "short":
      return "short hair";
    case "medium":
      return "medium-length hair around the shoulders";
    case "below-shoulders":
      return "hair extending below the shoulders";
    case "long":
      return "long hair";
    default:
      return "the selected hair length";
  }
}

function getStructureDescription(structure: string): string {
  switch (structure) {
    case "straight":
      return "naturally straight hair";
    case "wavy":
      return "naturally wavy hair";
    case "curly":
      return "naturally curly hair";
    case "afro-curls":
      return "tight afro-textured curls";
    default:
      return "the selected hair structure";
  }
}

function getFemaleFormDescription(form: string): string {
  switch (form) {
    case "ai-podbor":
      return "choose and realize a professionally suitable haircut shape while respecting the selected parameters";
    case "straight-cut":
      return "a clean straight-cut shape with a strong horizontal perimeter";
    case "graduated":
      return "a graduated haircut with controlled graduation and weight distribution";
    case "layers":
      return "a layered haircut with clearly structured layers";
    case "cascade":
      return "a cascade haircut with visible graduated layers and movement";
    case "asymmetrical":
      return "an asymmetrical haircut with deliberately uneven sides or perimeter";
    default:
      return "the selected haircut form";
  }
}

function getBangDescription(bang: string): string {
  switch (bang) {
    case "none":
      return "no bangs";
    case "straight":
      return "straight full bangs";
    case "side":
      return "side-swept bangs";
    case "long":
      return "long bangs";
    case "curtain":
      return "curtain bangs parted in the center";
    case "short":
      return "short bangs";
    default:
      return "the selected bang option";
  }
}

function getPartingDescription(parting: string): string {
  switch (parting) {
    case "center":
      return "a clearly visible center parting";
    case "left":
      return "a clearly visible left side parting";
    case "right":
      return "a clearly visible right side parting";
    case "none":
      return "no pronounced parting";
    default:
      return "the selected parting";
  }
}

function getVolumeDescription(volume: string): string {
  switch (volume) {
    case "low":
      return "low controlled volume";
    case "natural":
      return "natural realistic volume";
    case "medium":
      return "medium volume";
    case "high":
      return "high voluminous hair";
    default:
      return "the selected volume";
  }
}

function getStylingDescription(styling: string): string {
  switch (styling) {
    case "natural":
      return "natural everyday styling";
    case "smooth":
      return "smooth polished styling";
    case "textured":
      return "defined textured styling";
    case "voluminous":
      return "voluminous styling";
    case "messy":
      return "intentionally messy effortless styling";
    case "wet":
      return "wet-look styling";
    default:
      return "the selected styling";
  }
}

function getEndsDescription(ends: string): string {
  switch (ends) {
    case "straight":
      return "clean straight ends";
    case "textured":
      return "textured ends";
    case "soft":
      return "soft natural ends";
    default:
      return "the selected ends";
  }
}

function getMaleFormDescription(form: string): string {
  switch (form) {
    case "classic":
      return "a classic men's haircut with a clean balanced silhouette";
    case "crop":
      return "a modern crop haircut with a short textured top";
    case "fade":
      return "a fade haircut with progressively shorter sides and back";
    case "taper":
      return "a taper haircut with a gradual reduction around the temples and neckline";
    case "undercut":
      return "an undercut with clearly separated longer top and significantly shorter sides and back";
    case "textured":
      return "a textured men's haircut with visible separation and movement";
    case "elongated":
      return "an elongated men's haircut with noticeably longer hair";
    default:
      return "the selected men's haircut form";
  }
}

function getTemplesDescription(temples: string): string {
  switch (temples) {
    case "slanted":
      return "slanted temples";
    case "straight":
      return "straight temples";
    case "skin-fade":
      return "skin fade at the temples";
    default:
      return "the selected temple shape";
  }
}

function getColorDescription(
  color: ColorSettings,
  gender: Gender
): string {
  const depth = Number(color.colorDepth);

  if (color.coloring === "none") {
    return "preserve the person's current natural hair color as realistically as possible";
  }

  if (color.coloring === "blond") {
    const safeDepth = Math.min(10, Math.max(7, depth));

    return `blond hair at tone level ${safeDepth}, ${color.colorShade} undertone, professionally realistic salon blond`;
  }

  const depthDescription = `tone level ${depth}`;

  let technique = "";

  switch (color.coloring) {
    case "solid":
      technique = "uniform solid color";
      break;
    case "highlighting":
      technique = "professional highlighting";
      break;
    case "balayage":
      technique = "balayage coloring with natural dimensional transitions";
      break;
    case "shatush":
      technique = "shatush coloring with soft blended transitions";
      break;
    case "airtouch":
      technique = "Airtouch coloring with soft diffused transitions";
      break;
    case "ombre":
      technique = "ombre coloring with a gradual transition";
      break;
    case "toning":
      technique = "professional hair toning";
      break;
    case "gray-camouflage":
      technique = "subtle professional gray camouflage";
      break;
    default:
      technique = "professional hair coloring";
  }

  return `${technique}, ${depthDescription}, ${color.colorShade} shade`;
}

function buildPrompt(
  gender: Gender,
  variant: Variant,
  color: ColorSettings
): string {
  const length = getLengthDescription(
    gender,
    variant.length,
    variant.maleForm
  );

  const structure = getStructureDescription(variant.structure);

  const colorDescription = getColorDescription(color, gender);

  if (gender === "female") {
    const form = getFemaleFormDescription(
      normalizeFemaleForm(variant.femaleForm)
    );

    const bangs = getBangDescription(variant.femaleBang);
    const parting = getPartingDescription(variant.femaleParting);
    const volume = getVolumeDescription(variant.femaleVolume);
    const styling = getStylingDescription(variant.femaleStyling);
    const ends = getEndsDescription(variant.femaleEnds);

    return `
Edit the provided person's photo.

IMPORTANT:
Preserve the person's identity exactly.
Preserve facial structure, facial proportions, eyes, nose, lips, skin texture, age, expression and overall appearance.
Do not beautify or alter the face.
Do not change the body, clothing, background or camera angle unless absolutely necessary to integrate the hair.
The result must clearly look like the same real person.

HAIR TRANSFORMATION:
Create a professional female hairstyle based strictly on these parameters:

Length: ${length}.
Hair structure: ${structure}.
Haircut form: ${form}.
Bangs: ${bangs}.
Parting: ${parting}.
Volume: ${volume}.
Styling: ${styling}.
Ends: ${ends}.
Color: ${colorDescription}.

Do not invent a different haircut.
Do not substitute another hairstyle.
Do not add or remove bangs unless specified.
Do not change the selected hair length.
Do not change the selected hair structure.

The hairstyle must look physically realistic, professionally cut and naturally integrated with the person's head, face and existing hair.

Photorealistic result.
Natural hair strands.
Realistic density.
Realistic roots and hairline.
Professional salon-quality result.
`.trim();
  }

  const form = getMaleFormDescription(variant.maleForm);
  const temples = getTemplesDescription(variant.maleTemples);

  return `
Edit the provided person's photo.

IMPORTANT:
Preserve the person's identity exactly.
Preserve facial structure, facial proportions, eyes, nose, lips, skin texture, age, expression and overall appearance.
Do not beautify or alter the face.
Do not change the body, clothing, background or camera angle unless absolutely necessary to integrate the hair.
The result must clearly look like the same real person.

HAIR TRANSFORMATION:
Create a professional men's hairstyle based strictly on these parameters:

Haircut form: ${form}.
Hair length: ${length}.
Hair structure: ${structure}.
Temples: ${temples}.
Color: ${colorDescription}.

Do not invent a different haircut.
Do not substitute another hairstyle.
Do not change the selected haircut form.
Do not change the selected hair structure.

The hairstyle must look physically realistic, professionally cut and naturally integrated with the person's head, face and existing hair.

Photorealistic result.
Natural hair strands.
Realistic density.
Realistic roots and hairline.
Professional salon-quality result.
`.trim();
}

async function createSignedBlobUrl(
  pathname: string
): Promise<string> {
  const token = await issueSignedToken({
    pathname,
    onRequest: {
      method: "GET",
    },
  });

  return presignUrl(token, {
    pathname,
    operation: "download",
    access: "private",
    validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });
}

async function generateOneVariant(
  imageFile: File,
  prompt: string,
  index: number
): Promise<string> {
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!openaiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const formData = new FormData();

  formData.append("model", "gpt-image-2");
  formData.append("prompt", prompt);
  formData.append("size", "1024x1536");
  formData.append("quality", "high");
  formData.append("output_format", "jpeg");
  formData.append("output_compression", "85");
  formData.append("image", imageFile);

  const response = await fetch(OPENAI_EDIT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `OpenAI error for variant ${index + 1}: ${response.status} ${errorText}`
    );
  }

  const data = await response.json();

  const imageBase64 = data?.data?.[0]?.b64_json;

  if (!imageBase64) {
    throw new Error(
      `OpenAI returned no image for variant ${index + 1}`
    );
  }

  const imageBuffer = Buffer.from(imageBase64, "base64");

  const blob = await put(
    `generated/variant-${Date.now()}-${index + 1}.jpg`,
    imageBuffer,
    {
      access: "private",
      contentType: "image/jpeg",
      addRandomSuffix: true,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }
  );

  return createSignedBlobUrl(blob.pathname);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const image = formData.get("image");

    if (!(image instanceof File)) {
      return NextResponse.json(
        { error: "Фотография не загружена" },
        { status: 400 }
      );
    }

    const genderValue = formData.get("gender");

    if (
      typeof genderValue !== "string" ||
      !isAllowed(genderValue, ALLOWED_GENDERS)
    ) {
      return NextResponse.json(
        { error: "Некорректно указан пол" },
        { status: 400 }
      );
    }

    const gender = genderValue as Gender;

    const rawVariants = formData.get("variants");

    if (typeof rawVariants !== "string") {
      return NextResponse.json(
        { error: "Параметры вариантов не переданы" },
        { status: 400 }
      );
    }

    let variants: Variant[];

    try {
      variants = JSON.parse(rawVariants);
    } catch {
      return NextResponse.json(
        { error: "Некорректный формат вариантов" },
        { status: 400 }
      );
    }

    if (
      !Array.isArray(variants) ||
      variants.length < 1 ||
      variants.length > 3
    ) {
      return NextResponse.json(
        {
          error: "Количество вариантов должно быть от 1 до 3",
        },
        { status: 400 }
      );
    }

    const colorModeValue = formData.get("colorMode");

    if (
      colorModeValue !== "shared" &&
      colorModeValue !== "individual"
    ) {
      return NextResponse.json(
        { error: "Некорректный режим цвета" },
        { status: 400 }
      );
    }

    const colorMode =
      colorModeValue as "shared" | "individual";

    const sharedColor: ColorSettings = {
      colorDepth: String(
        formData.get("sharedColorDepth") || "5"
      ),
      colorShade: String(
        formData.get("sharedColorShade") || "natural"
      ),
      coloring: String(
        formData.get("sharedColoring") || "none"
      ),
    };

    if (
      !isAllowed(sharedColor.colorDepth, COLOR_DEPTHS) ||
      !isAllowed(sharedColor.colorShade, COLOR_SHADES) ||
      !isAllowed(sharedColor.coloring, COLORING)
    ) {
      return NextResponse.json(
        {
          error: "Некорректные общие параметры цвета",
        },
        { status: 400 }
      );
    }

    let individualColors: ColorSettings[] = [];

    if (colorMode === "individual") {
      const rawIndividualColors =
        formData.get("individualColors");

      if (typeof rawIndividualColors !== "string") {
        return NextResponse.json(
          {
            error:
              "Индивидуальные параметры цвета не переданы",
          },
          { status: 400 }
        );
      }

      try {
        individualColors = JSON.parse(
          rawIndividualColors
        );
      } catch {
        return NextResponse.json(
          {
            error:
              "Некорректный формат индивидуальных цветов",
          },
          { status: 400 }
        );
      }

      if (
        !Array.isArray(individualColors) ||
        individualColors.length !== variants.length
      ) {
        return NextResponse.json(
          {
            error:
              "Количество индивидуальных цветов должно совпадать с количеством вариантов",
          },
          { status: 400 }
        );
      }

      for (const color of individualColors) {
        if (
          !color ||
          !isAllowed(
            String(color.colorDepth),
            COLOR_DEPTHS
          ) ||
          !isAllowed(
            String(color.colorShade),
            COLOR_SHADES
          ) ||
          !isAllowed(
            String(color.coloring),
            COLORING
          )
        ) {
          return NextResponse.json(
            {
              error:
                "Некорректные индивидуальные параметры цвета",
            },
            { status: 400 }
          );
        }
      }
    } else {
      individualColors = variants.map(() => sharedColor);
    }

    for (const variant of variants) {
      if (
        typeof variant !== "object" ||
        !isAllowed(
          String(variant.structure),
          STRUCTURES
        )
      ) {
        return NextResponse.json(
          {
            error: "Некорректная структура волос",
          },
          { status: 400 }
        );
      }

      if (gender === "female") {
        if (
          !isAllowed(
            String(variant.length),
            FEMALE_LENGTHS
          ) ||
          !isAllowed(
            normalizeFemaleForm(
              String(variant.femaleForm)
            ),
            FEMALE_FORMS
          ) ||
          !isAllowed(
            String(variant.femaleBang),
            FEMALE_BANGS
          ) ||
          !isAllowed(
            String(variant.femaleParting),
            FEMALE_PARTINGS
          ) ||
          !isAllowed(
            String(variant.femaleVolume),
            FEMALE_VOLUMES
          ) ||
          !isAllowed(
            String(variant.femaleStyling),
            FEMALE_STYLINGS
          ) ||
          !isAllowed(
            String(variant.femaleEnds),
            FEMALE_ENDS
          )
        ) {
          return NextResponse.json(
            {
              error:
                "Некорректные параметры женской прически",
            },
            { status: 400 }
          );
        }
      }

      if (gender === "male") {
        if (
          !isAllowed(
            String(variant.maleForm),
            MALE_FORMS
          ) ||
          !isAllowed(
            String(variant.maleTemples),
            MALE_TEMPLES
          )
        ) {
          return NextResponse.json(
            {
              error:
                "Некорректные параметры мужской прически",
            },
            { status: 400 }
          );
        }

        if (
          variant.maleForm !== "undercut" &&
          variant.maleForm !== "elongated"
        ) {
          variant.length = "short";
        }
      }
    }

    const prompts = variants.map((variant, index) =>
      buildPrompt(
        gender,
        variant,
        individualColors[index]
      )
    );

    const results = await Promise.all(
      prompts.map((prompt, index) =>
        generateOneVariant(
          image,
          prompt,
          index
        )
      )
    );

    return NextResponse.json({
      success: true,
      results,
      count: results.length,
    });
  } catch (error) {
    console.error("Generation error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Неизвестная ошибка генерации";

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 500,
      }
    );
  }
}
