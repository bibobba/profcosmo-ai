import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";

export const maxDuration = 60;

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const allowed = {
  gender: ["male", "female"],

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
    const length = formData.get("length");
    const structure = formData.get("structure");
    const bangs = formData.get("bangs");
    const parting = formData.get("parting");
    const volume = formData.get("volume");
    const styling = formData.get("styling");

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

    if (
      typeof gender !== "string" ||
      typeof length !== "string" ||
      typeof structure !== "string" ||
      typeof bangs !== "string" ||
      typeof parting !== "string" ||
      typeof volume !== "string" ||
      typeof styling !== "string" ||
      typeof colorDepth !== "string" ||
      typeof colorTone !== "string" ||
      typeof colorIntensity !== "string" ||
      typeof coloring !== "string" ||
      typeof roots !== "string"
    ) {
      return NextResponse.json(
        { error: "Не все параметры заполнены" },
        { status: 400 }
      );
    }

    if (
      !allowed.gender.includes(gender) ||
      !allowed.length.includes(length) ||
      !allowed.structure.includes(structure) ||
      !allowed.bangs.includes(bangs) ||
      !allowed.parting.includes(parting) ||
      !allowed.volume.includes(volume) ||
      !allowed.styling.includes(styling) ||
      !allowed.colorDepth.includes(colorDepth) ||
      !allowed.colorTone.includes(colorTone) ||
      !allowed.colorIntensity.includes(colorIntensity) ||
      !allowed.coloring.includes(coloring) ||
      !allowed.roots.includes(roots)
    ) {
      return NextResponse.json(
        { error: "Выберите корректные параметры" },
        { status: 400 }
      );
    }

    const imageBuffer = Buffer.from(await image.arrayBuffer());
    const base64 = imageBuffer.toString("base64");
    const inputImage = `data:${image.type};base64,${base64}`;

    const genderText: Record<string, string> = {
      male: "male person / man",
      female: "female person / woman",
    };

    const lengthText: Record<string, string> = {
      "very-short": "very short",
      short: "short",
      medium: "medium length",
      "below-shoulders": "below the shoulders",
      long: "long",
    };

    const structureText: Record<string, string> = {
      straight: "straight",
      wavy: "wavy",
      curly: "curly",
      "very-curly": "very curly",
    };

    const bangsText: Record<string, string> = {
      none: "no bangs",
      straight: "straight bangs",
      side: "side-swept bangs",
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
      low: "minimal volume",
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

    const colorToneText: Record<string, string> = {
      natural: "natural",
      ash: "ash",
      beige: "beige",
      gold: "golden",
      copper: "copper",
      red: "red",
      violet: "violet",
      pearl: "pearl",
    };

    const colorIntensityText: Record<string, string> = {
      pastel: "pastel",
      soft: "soft",
      medium: "medium",
      rich: "rich",
    };

    const coloringText: Record<string, string> = {
      solid: "solid color",
      highlighting: "highlighting",
      balayage: "balayage",
      shatush: "shatush",
      airtouch: "AirTouch",
      ombre: "ombre",
      toning: "toning",
    };

    const rootsText: Record<string, string> = {
      same: "roots matching the lengths",
      natural: "natural roots",
      dark: "darker roots",
      stretch: "soft root color transition",
    };

    const prompt = `
EDIT THE PROVIDED PHOTO.

DO NOT CREATE A NEW PERSON.

This is a professional hairstyle and hair-color visualization.

The person MUST remain the exact same person as in the input photograph.

CLIENT:
Gender: ${genderText[gender]}

IDENTITY PRESERVATION IS THE HIGHEST PRIORITY.

Preserve exactly:
- facial identity;
- face shape;
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

DO NOT regenerate the face.

DO NOT beautify the face.

DO NOT alter facial features.

DO NOT change facial proportions.

DO NOT change age.

DO NOT change body proportions.

DO NOT change clothing.

DO NOT change the background.

DO NOT change the person's sex or gender.

If the input person is male, the result MUST remain male.

If the input person is female, the result MUST remain female.

ONLY MODIFY THE HAIR.

HAIRSTYLE SPECIFICATION:

Gender:
${genderText[gender]}

Length:
${lengthText[length]}

Hair structure:
${structureText[structure]}

Bangs:
${bangsText[bangs]}

Parting:
${partingText[parting]}

Volume:
${volumeText[volume]}

Styling:
${stylingText[styling]}

HAIR COLOR SPECIFICATION:

Depth of tone / UGT:
Level ${colorDepth} on the professional 1–10 hair color depth scale.

Color direction:
${colorToneText[colorTone]}

Color intensity:
${colorIntensityText[colorIntensity]}

Coloring technique:
${coloringText[coloring]}

Roots:
${rootsText[roots]}

The hairstyle and color must look professionally executed.

The hair must:
- follow the existing hairline;
- follow the existing head shape;
- have realistic density;
- have realistic individual strands;
- have realistic texture;
- have realistic volume;
- have realistic shadows;
- have natural transitions;
- look like real human hair.

The result must look like the SAME PERSON
in the SAME PHOTOGRAPH
after a professional haircut, styling and hair-color service.

THE ONLY INTENTIONAL CHANGES ARE:
1. hairstyle;
2. hair color.

EVERYTHING ELSE MUST REMAIN UNCHANGED.

DO NOT CHANGE IDENTITY.
DO NOT CHANGE FACE.
DO NOT CHANGE SEX.
DO NOT CHANGE GENDER.
DO NOT CHANGE BODY.
DO NOT CHANGE CLOTHING.
DO NOT CHANGE BACKGROUND.

HAIR ONLY.
`;

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
