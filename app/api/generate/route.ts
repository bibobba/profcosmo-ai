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
Edit this photograph of a real person to visualize a new hairstyle.

IDENTITY PRESERVATION IS THE HIGHEST PRIORITY.

Keep exactly the same person and preserve:
- facial identity;
- face shape;
- eyes;
- eyebrows;
- nose;
- mouth;
- skin tone;
- age;
- facial expression;
- head position;
- body proportions;
- clothing;
- camera angle;
- lighting;
- background.

Do NOT regenerate, beautify, reshape or alter the person's face.

The ONLY major intentional change must be the hairstyle.

Create a realistic professional hairstyle visualization.

Requested hairstyle:
Hair length: ${lengthText[length]}.
Hair structure: ${structureText[structure]}.
Style: ${styleText[style]}.

The new hairstyle must naturally follow the person's existing hairline,
head shape and facial proportions.

Make the hair photorealistic:
- natural hairline;
- realistic individual strands;
- realistic density;
- realistic volume;
- realistic texture;
- natural shadows;
- physically plausible hair.

The final image must look like a real photograph of the SAME PERSON
after a professional haircut and styling.

Do not add accessories.
Do not change clothing.
Do not change the background unnecessarily.
Do not change facial expression.
Do not change the person's identity.

ONLY CHANGE THE HAIR.
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
