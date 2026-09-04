import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";

export const maxDuration = 60;

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const allowed = {
  gender: ["male", "female"],
  length: ["short", "medium", "long"],
  structure: ["straight", "wavy", "curly"],
  style: ["classic", "modern", "trendy"],
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
    const style = formData.get("style");

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
      typeof style !== "string" ||
      !allowed.gender.includes(gender) ||
      !allowed.length.includes(length) ||
      !allowed.structure.includes(structure) ||
      !allowed.style.includes(style)
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
      male: "MALE PERSON / MAN",
      female: "FEMALE PERSON / WOMAN",
    };

    const lengthText: Record<string, string> = {
      short: "short",
      medium: "medium-length",
      long: "long",
    };

    const structureText: Record<string, string> = {
      straight: "straight",
      wavy: "wavy",
      curly: "curly",
    };

    const styleText: Record<string, string> = {
      classic: "classic professional",
      modern: "modern contemporary",
      trendy: "fashion-forward trendy",
    };

    const prompt = `
EDIT THE PROVIDED PHOTO.
DO NOT CREATE A NEW PERSON.

THIS IS A PROFESSIONAL HAIRSTYLE VISUALIZATION.

The selected client gender is:
${genderText[gender]}

THIS GENDER MUST NOT CHANGE.

If the input is a man, the output MUST remain a MAN.
If the input is a woman, the output MUST remain a WOMAN.

DO NOT CHANGE THE PERSON'S SEX.
DO NOT CHANGE THE PERSON'S GENDER PRESENTATION.
DO NOT FEMINIZE A MAN.
DO NOT MASCULINIZE A WOMAN.

IDENTITY PRESERVATION IS THE HIGHEST PRIORITY.

Keep the EXACT SAME PERSON from the input photograph.

PRESERVE:
- same identity;
- same face;
- same facial structure;
- same eyes;
- same eyebrows;
- same nose;
- same mouth;
- same lips;
- same jaw;
- same ears;
- same skin;
- same skin tone;
- same age;
- same body;
- same neck;
- same shoulders;
- same clothing;
- same pose;
- same head position;
- same camera angle;
- same framing;
- same lighting;
- same background.

DO NOT REGENERATE THE FACE.

DO NOT BEAUTIFY THE PERSON.

DO NOT ALTER THE FACE.

DO NOT CHANGE FACIAL PROPORTIONS.

DO NOT CHANGE THE PERSON'S AGE.

DO NOT CHANGE THE PERSON'S BODY.

DO NOT CHANGE THE CLOTHING.

DO NOT CHANGE THE BACKGROUND.

ONLY EDIT THE HAIR.

REQUESTED HAIRSTYLE:

Gender:
${genderText[gender]}

Hair length:
${lengthText[length]}

Hair structure:
${structureText[structure]}

Hair style:
${styleText[style]}

The new hairstyle must be appropriate for the selected gender.

The new hair must:
- follow the existing head shape;
- follow the existing hairline;
- connect naturally to the existing hair;
- have realistic density;
- have realistic volume;
- have realistic strands;
- have realistic shadows;
- look like real human hair;
- look professionally cut and styled.

The result must look like the SAME PERSON
in the SAME PHOTOGRAPH
after receiving a professional haircut.

THE ONLY INTENTIONAL CHANGE IS THE HAIRSTYLE.

CRITICAL:
DO NOT TURN A MAN INTO A WOMAN.
DO NOT TURN A WOMAN INTO A MAN.
DO NOT CHANGE SEX.
DO NOT CHANGE GENDER.
DO NOT CHANGE IDENTITY.
DO NOT CHANGE FACE.

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
