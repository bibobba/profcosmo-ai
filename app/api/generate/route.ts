import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";

export const maxDuration = 60;

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const allowed = {
  gender: ["male", "female"],

  cut: [
    "classic",
    "crop",
    "fade",
    "taper",
    "undercut",
    "textured",
    "bob",
    "long-bob",
    "square",
    "pixie",
    "cascade",
    "shag",
    "layered",
    "straight-cut",
  ],

  length: [
    "very-short",
    "short",
    "medium",
    "below-shoulders",
    "long",
  ],

  structure: [
    "straight",
    "wavy",
    "curly",
    "very-curly",
  ],

  bangs: [
    "none",
    "straight",
    "side",
    "long",
    "curtain",
    "short",
  ],

  parting: [
    "none",
    "center",
    "left",
    "right",
    "side",
  ],

  volume: [
    "low",
    "natural",
    "medium",
    "high",
  ],

  styling: [
    "natural",
    "smooth",
    "textured",
    "voluminous",
    "messy",
    "wet",
  ],

  temples: [
    "natural",
    "short",
    "fade",
    "skin-fade",
  ],

  nape: [
    "natural",
    "short",
    "taper",
    "fade",
  ],

  layers: [
    "none",
    "soft",
    "medium",
    "pronounced",
  ],

  ends: [
    "straight",
    "textured",
    "soft",
  ],

  colorDepth: [
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
  ],

  colorTone: [
    "natural",
    "ash",
    "beige",
    "gold",
    "copper",
    "red",
    "violet",
    "pearl",
  ],

  colorIntensity: [
    "pastel",
    "soft",
    "medium",
    "rich",
  ],

  coloring: [
    "none",
    "solid",
    "highlighting",
    "balayage",
    "shatush",
    "airtouch",
    "ombre",
    "toning",
  ],

  roots: [
    "same",
    "natural",
    "dark",
    "stretch",
  ],
};

export async function POST(request: NextRequest) {
  try {
    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json(
        { error: "REPLICATE_API_TOKEN не настроен" },
        { status: 500 }
      );
    }

    const formData = await request.formData();

    const image = formData.get("image");

    const gender = formData.get("gender");
    const cut = formData.get("cut");
    const length = formData.get("length");
    const structure = formData.get("structure");
    const bangs = formData.get("bangs");
    const parting = formData.get("parting");
    const volume = formData.get("volume");
    const styling = formData.get("styling");

    const temples = formData.get("temples");
    const nape = formData.get("nape");

    const layers = formData.get("layers");
    const ends = formData.get("ends");

    const colorDepth = formData.get("colorDepth");
    const colorTone = formData.get("colorTone");
    const colorIntensity = formData.get("colorIntensity");
    const coloring = formData.get("coloring");
    const roots = formData.get("roots");

    if (!(image instanceof File)) {
      return NextResponse.json(
        { error: "Загрузите фотографию" },
        { status: 400 }
      );
    }

    if (!image.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Можно загрузить только изображение" },
        { status: 400 }
      );
    }

    if (image.size > 8 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Максимальный размер фотографии — 8 МБ" },
        { status: 400 }
      );
    }

    const values = {
      gender,
      cut,
      length,
      structure,
      bangs,
      parting,
      volume,
      styling,
      temples,
      nape,
      layers,
      ends,
      colorDepth,
      colorTone,
      colorIntensity,
      coloring,
      roots,
    };

    for (const [key, value] of Object.entries(values)) {
      if (typeof value !== "string") {
        return NextResponse.json(
          { error: `Не выбран параметр: ${key}` },
          { status: 400 }
        );
      }
    }

    if (
      !allowed.gender.includes(gender as string) ||
      !allowed.cut.includes(cut as string) ||
      !allowed.length.includes(length as string) ||
      !allowed.structure.includes(structure as string) ||
      !allowed.bangs.includes(bangs as string) ||
      !allowed.parting.includes(parting as string) ||
      !allowed.volume.includes(volume as string) ||
      !allowed.styling.includes(styling as string) ||
      !allowed.temples.includes(temples as string) ||
      !allowed.nape.includes(nape as string) ||
      !allowed.layers.includes(layers as string) ||
      !allowed.ends.includes(ends as string) ||
      !allowed.colorDepth.includes(colorDepth as string) ||
      !allowed.colorTone.includes(colorTone as string) ||
      !allowed.colorIntensity.includes(colorIntensity as string) ||
      !allowed.coloring.includes(coloring as string) ||
      !allowed.roots.includes(roots as string)
    ) {
      return NextResponse.json(
        { error: "Выберите корректные параметры" },
        { status: 400 }
      );
    }

    const genderText: Record<string, string> = {
      male: "MAN / MALE CLIENT",
      female: "WOMAN / FEMALE CLIENT",
    };

    const cutText: Record<string, string> = {
      classic: "classic professional haircut",
      crop: "textured crop haircut",
      fade: "fade haircut",
      taper: "taper haircut",
      undercut: "undercut haircut",
      textured: "textured haircut",

      bob: "bob haircut",
      "long-bob": "long bob haircut",
      square: "classic square bob",
      pixie: "pixie haircut",
      cascade: "layered cascade haircut",
      shag: "shag haircut",
      layered: "layered haircut",
      "straight-cut": "straight blunt haircut",
    };

    const lengthText: Record<string, string> = {
      "very-short": "very short",
      short: "short",
      medium: "medium length",
      "below-shoulders": "below shoulder length",
      long: "long",
    };

    const structureText: Record<string, string> = {
      straight: "straight hair",
      wavy: "wavy hair",
      curly: "curly hair",
      "very-curly": "very curly hair",
    };

    const bangsText: Record<string, string> = {
      none: "no bangs",
      straight: "straight bangs",
      side: "side swept bangs",
      long: "long bangs",
      curtain: "curtain bangs",
      short: "short bangs",
    };

    const partingText: Record<string, string> = {
      none: "no defined parting",
      center: "center part",
      left: "left side part",
      right: "right side part",
      side: "side part",
    };

    const volumeText: Record<string, string> = {
      low: "low volume",
      natural: "natural volume",
      medium: "medium volume",
      high: "high volume",
    };

    const stylingText: Record<string, string> = {
      natural: "natural styling",
      smooth: "smooth styling",
      textured: "textured styling",
      voluminous: "voluminous styling",
      messy: "messy effortless styling",
      wet: "wet look styling",
    };

    const templesText: Record<string, string> = {
      natural: "natural temples",
      short: "short temples",
      fade: "fade at the temples",
      "skin-fade": "skin fade at the temples",
    };

    const napeText: Record<string, string> = {
      natural: "natural nape",
      short: "short nape",
      taper: "tapered nape",
      fade: "fade at the nape",
    };

    const layersText: Record<string, string> = {
      none: "no layers",
      soft: "soft layers",
      medium: "medium layers",
      pronounced: "pronounced layers",
    };

    const endsText: Record<string, string> = {
      straight: "straight blunt ends",
      textured: "textured ends",
      soft: "soft natural ends",
    };

    const colorToneText: Record<string, string> = {
      natural: "natural tone",
      ash: "ash tone",
      beige: "beige tone",
      gold: "golden tone",
      copper: "copper tone",
      red: "red tone",
      violet: "violet tone",
      pearl: "pearl tone",
    };

    const colorIntensityText: Record<string, string> = {
      pastel: "pastel intensity",
      soft: "soft intensity",
      medium: "medium intensity",
      rich: "rich saturated intensity",
    };

    const coloringText: Record<string, string> = {
      none: "NO COLORING — preserve the original hair color",
      solid: "solid color",
      highlighting: "highlighting",
      balayage: "balayage",
      shatush: "shatush",
      airtouch: "AirTouch",
      ombre: "ombre",
      toning: "professional toning",
    };

    const rootsText: Record<string, string> = {
      same: "roots matching the lengths",
      natural: "natural roots",
      dark: "darker roots",
      stretch: "soft root transition",
    };

    const isColorChange =
      coloring !== "none" || colorTone !== "natural";

    const prompt = `
EDIT THE PROVIDED PHOTOGRAPH.

DO NOT GENERATE A NEW PERSON.

THIS IS A PROFESSIONAL HAIRCUT AND HAIR COLOR VISUALIZATION.

The client is:
${genderText[gender as string]}

IDENTITY PRESERVATION IS THE HIGHEST PRIORITY.

The exact same person must remain in the final image.

PRESERVE EXACTLY:
- identity;
- face;
- facial structure;
- eyes;
- eyebrows;
- nose;
- lips;
- jaw;
- ears;
- skin;
- skin tone;
- age;
- body;
- neck;
- shoulders;
- clothing;
- pose;
- head position;
- camera angle;
- framing;
- lighting;
- background.

DO NOT REGENERATE THE FACE.

DO NOT BEAUTIFY THE FACE.

DO NOT ALTER FACIAL FEATURES.

DO NOT CHANGE AGE.

DO NOT CHANGE BODY.

DO NOT CHANGE CLOTHING.

DO NOT CHANGE BACKGROUND.

DO NOT CHANGE SEX OR GENDER.

A MAN MUST REMAIN A MAN.
A WOMAN MUST REMAIN A WOMAN.

ONLY MODIFY THE HAIR.

================================
PROFESSIONAL HAIRCUT SPECIFICATION
================================

CLIENT:
${genderText[gender as string]}

HAIRCUT FORM:
${cutText[cut as string]}

LENGTH:
${lengthText[length as string]}

HAIR STRUCTURE:
${structureText[structure as string]}

BANGS:
${bangsText[bangs as string]}

PARTING:
${partingText[parting as string]}

VOLUME:
${volumeText[volume as string]}

STYLING:
${stylingText[styling as string]}

${
  gender === "male"
    ? `
MEN'S TECHNICAL DETAILS:

TEMPLES:
${templesText[temples as string]}

NAPE:
${napeText[nape as string]}
`
    : `
WOMEN'S TECHNICAL DETAILS:

LAYERS:
${layersText[layers as string]}

ENDS:
${endsText[ends as string]}
`
}

================================
HAIR COLOR SPECIFICATION
================================

${
  isColorChange
    ? `
COLORING IS REQUESTED.

DEPTH OF TONE / UGT:
Level ${colorDepth} on the professional 1–10 hair depth scale.

COLOR DIRECTION:
${colorToneText[colorTone as string]}

COLOR INTENSITY:
${colorIntensityText[colorIntensity as string]}

COLORING TECHNIQUE:
${coloringText[coloring as string]}

ROOTS:
${rootsText[roots as string]}
`
    : `
NO COLORING IS REQUESTED.

PRESERVE THE ORIGINAL HAIR COLOR.

DO NOT CHANGE THE HAIR COLOR.

DO NOT APPLY A NEW COLOR.

The selected UGT value is only a reference and must NOT cause recoloring.
`
}

================================
REALISM
================================

The hairstyle must look physically realistic.

Hair must:
- follow the existing hairline;
- follow the existing head shape;
- connect naturally to the scalp;
- have realistic density;
- have realistic individual strands;
- have realistic texture;
- have realistic volume;
- have realistic shadows;
- have natural transitions;
- look professionally cut and styled.

The result must look like:

THE SAME PERSON
IN THE SAME PHOTOGRAPH
AFTER A PROFESSIONAL HAIRCUT AND, IF REQUESTED, COLORING SERVICE.

THE ONLY INTENTIONAL CHANGE IS THE HAIR.

DO NOT CHANGE IDENTITY.
DO NOT CHANGE FACE.
DO NOT CHANGE SEX.
DO NOT CHANGE GENDER.
DO NOT CHANGE BODY.
DO NOT CHANGE CLOTHING.
DO NOT CHANGE BACKGROUND.

HAIR ONLY.
`;

    const imageBuffer = Buffer.from(await image.arrayBuffer());
    const base64 = imageBuffer.toString("base64");
    const inputImage = `data:${image.type};base64,${base64}`;

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

    const imageUrl =
      output &&
      typeof output === "object" &&
      "url" in output &&
      typeof output.url === "function"
        ? output.url()
        : null;

    if (!imageUrl) {
      console.error("Unexpected Replicate output:", output);

      return NextResponse.json(
        { error: "AI не вернул изображение" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      imageUrl,
    });
  } catch (error) {
    console.error("Generation error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Ошибка генерации изображения",
      },
      { status: 500 }
    );
  }
}
