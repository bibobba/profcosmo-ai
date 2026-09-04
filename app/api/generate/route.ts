import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";

export const maxDuration = 60;

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const allowed = {
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
      typeof length !== "string" ||
      typeof structure !== "string" ||
      typeof style !== "string" ||
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

    const lengthText: Record<string, string> = {
      short: "short professional haircut",
      medium: "medium-length professional hairstyle",
      long: "long professional hairstyle",
    };

    const structureText: Record<string, string> = {
      straight: "straight hair",
      wavy: "wavy hair",
      curly: "curly hair",
    };

    const styleText: Record<string, string> = {
      classic: "classic professional style",
      modern: "modern contemporary style",
      trendy: "fashion-forward trendy style",
    };

    const prompt = `
EDIT THE PROVIDED PHOTO.
DO NOT GENERATE A NEW PERSON.

THIS IS A HAIR-ONLY EDIT.

The person in the input image MUST remain the exact same person.

PRESERVE THE ORIGINAL PERSON EXACTLY:
- same biological sex
- same gender presentation
- same face
- same facial identity
- same facial proportions
- same eyes
- same eyebrows
- same nose
- same lips
- same jaw
- same ears
- same skin tone
- same age
- same body
- same neck
- same shoulders
- same clothing
- same pose
- same head position
- same camera angle
- same framing
- same lighting
- same background
- same photograph composition

DO NOT TURN THE PERSON INTO A DIFFERENT PERSON.

DO NOT CHANGE THE PERSON'S SEX OR GENDER.

DO NOT FEMINIZE A MALE PERSON.
DO NOT MASCULINIZE A FEMALE PERSON.

DO NOT BEAUTIFY THE FACE.
DO NOT MODIFY THE FACE.
DO NOT REGENERATE THE FACE.
DO NOT CHANGE FACIAL FEATURES.

The original face must remain visually identical to the input photograph.

ONLY CHANGE THE HAIR.

Requested hairstyle:

Length: ${lengthText[length]}
Hair texture: ${structureText[structure]}
Style: ${styleText[style]}

The new hairstyle must:
- grow naturally from the existing hairline;
- follow the existing head shape;
- match the person's existing hair color unless necessary;
- have realistic density;
- have realistic individual strands;
- have realistic shadows;
- have realistic volume;
- look physically plausible;
- look like professionally cut and styled real hair.

The final result must look like:
THE SAME ORIGINAL PHOTOGRAPH
OF THE SAME PERSON
AFTER A PROFESSIONAL HAIRCUT.

The hairstyle is the ONLY intentional change.

NO changes to the face.
NO changes to the body.
NO changes to clothing.
NO changes to pose.
NO changes to background.
NO changes to lighting.
NO changes to identity.
NO changes to sex or gender.

HAIR ONLY.
`;

    const output = await replicate.run(
      "black-forest-labs/flux-kontext-max",
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
