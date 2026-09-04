import { NextResponse } from "next/server";

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

function getValue(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function isValid(value: string, values: string[]) {
  return values.includes(value);
}

function lengthText(value: string) {
  const map: Record<string, string> = {
    "very-short": "very short",
    short: "short",
    medium: "medium length",
    "below-shoulders": "below the shoulders",
    long: "long",
  };

  return map[value] || value;
}

function structureText(value: string) {
  const map: Record<string, string> = {
    straight: "straight",
    wavy: "wavy",
    curly: "curly",
    "afro-curls": "afro-textured curly",
  };

  return map[value] || value;
}

function coloringText(value: string) {
  const map: Record<string, string> = {
    none: "no coloring",
    solid: "solid coloring",
    highlighting: "highlighting",
    balayage: "balayage",
    shatush: "shatush",
    airtouch: "AirTouch",
    ombre: "ombre",
    toning: "toning",
    "gray-camouflage": "gray hair camouflage",
    blond: "professional blonding",
  };

  return map[value] || value;
}

function shadeText(value: string) {
  const map: Record<string, string> = {
    natural: "natural",
    ash: "ash",
    beige: "beige",
    gold: "golden",
    copper: "copper",
    red: "red",
    pearl: "pearl",
  };

  return map[value] || value;
}

function buildPrompt(params: {
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
  const {
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
  } = params;

  let prompt = `
Edit this exact photograph of a real person.

PRIMARY OBJECTIVE:
Change the person's hairstyle and hair color according to the requested professional parameters.

IDENTITY PRESERVATION IS CRITICAL:
- Keep exactly the same person.
- Preserve the original face.
- Preserve facial proportions.
- Preserve eyes, eyebrows, nose, lips, teeth, jawline, cheekbones and skin.
- Do not change age.
- Do not change gender.
- Do not beautify the person.
- Do not create a new person.
- Do not alter facial expression.
- Preserve the original body, neck, shoulders, clothing and background.
- Do not change the camera angle or composition.

ONLY THE HAIR SHOULD BE SIGNIFICANTLY MODIFIED.

HAIR PARAMETERS:

Gender: ${gender}

Requested hair length:
${lengthText(length)}

Requested hair structure:
${structureText(structure)}

COLOR:
Level of tone: ${colorDepth}
Selected shade: ${shadeText(colorShade)}
Coloring technique: ${coloringText(coloring)}
`;

  if (gender === "female") {
    prompt += `
FEMALE HAIRSTYLE:

Bangs: ${bangs}
Parting: ${parting}
Volume: ${volume}
Styling: ${styling}
Ends: ${ends}

These parameters are mandatory constraints.
`;
  }

  if (gender === "male") {
    prompt += `
MALE HAIRSTYLE:

Form: ${maleForm}
Temples: ${temples}

`;

    if (
      maleForm === "undercut" ||
      maleForm === "elongated"
    ) {
      prompt += `
For this form, the requested hair length is mandatory:
${lengthText(length)}
`;
    }
  }

  if (coloring === "none") {
    prompt += `
COLOR RESTRICTION:

No coloring is requested.

Do not artificially recolor the hair.
Preserve the person's existing hair color.
`;
  } else {
    prompt += `
COLOR RESTRICTION:

The requested tone level, shade and coloring technique must be clearly visible,
professional and realistic.

Do not invent a different color.
Do not alter the person's skin color.
`;
  }

  const variants = [
    `
VARIANT 1:
Create the most conservative professional interpretation.
Prioritize natural proportions and realistic hair geometry.
`,
    `
VARIANT 2:
Create a second professional interpretation.
Keep the same requested color, tone, structure and overall length category,
but use a somewhat different haircut shape.
`,
    `
VARIANT 3:
Create a third professional interpretation.
Keep the same requested color, tone, structure and overall length category,
but provide another plausible professional hairstyle variation.
`,
  ];

  prompt += variants[variant - 1];

  prompt += `
IMPORTANT:

Do not randomly choose a fashionable hairstyle.

Follow the requested parameters.

The result must look like a realistic photograph of the SAME PERSON
after visiting a professional hairdresser.

The hair must be physically believable:
realistic hairline, realistic strands, realistic volume,
realistic connection between hair and face.

Do not modify non-hair parts of the photograph.
`;

  return prompt.trim();
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "OPENAI_API_KEY не настроен в Vercel.",
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
          error: "Некорректно выбран пол.",
        },
        { status: 400 }
      );
    }

    if (!isValid(length, VALID_LENGTHS)) {
      return NextResponse.json(
        {
          success: false,
          error: "Некорректно выбрана длина.",
        },
        { status: 400 }
      );
    }

    if (!isValid(structure, VALID_STRUCTURES)) {
      return NextResponse.json(
        {
          success: false,
          error: "Некорректно выбрана структура волос.",
        },
        { status: 400 }
      );
    }

    if (!/^(10|[1-9])$/.test(colorDepth)) {
      return NextResponse.json(
        {
          success: false,
          error: "Некорректно выбран уровень тона.",
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
          error: "Некорректно выбрана техника окрашивания.",
        },
        { status: 400 }
      );
    }

    if (gender === "female") {
      if (!isValid(bangs, VALID_FEMALE_BANGS)) {
        return NextResponse.json(
          {
            success: false,
            error: "Некорректно выбрана чёлка.",
          },
          { status: 400 }
        );
      }

      if (!isValid(parting, VALID_PARTINGS)) {
        return NextResponse.json(
          {
            success: false,
            error: "Некорректно выбран пробор.",
          },
          { status: 400 }
        );
      }

      if (!isValid(volume, VALID_VOLUMES)) {
        return NextResponse.json(
          {
            success: false,
            error: "Некорректно выбран объём.",
          },
          { status: 400 }
        );
      }

      if (!isValid(styling, VALID_STYLINGS)) {
        return NextResponse.json(
          {
            success: false,
            error: "Некорректно выбрана укладка.",
          },
          { status: 400 }
        );
      }

      if (!isValid(ends, VALID_ENDS)) {
        return NextResponse.json(
          {
            success: false,
            error: "Некорректно выбраны концы.",
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
            error: "Некорректно выбрана мужская форма.",
          },
          { status: 400 }
        );
      }

      if (!isValid(temples, VALID_TEMPLES)) {
        return NextResponse.json(
          {
            success: false,
            error: "Некорректно выбраны виски.",
          },
          { status: 400 }
        );
      }
    }

    /*
     * GPT Image API принимает изображение как multipart/form-data.
     * Мы передаём исходный файл напрямую.
     */
    const imageBuffer = Buffer.from(
      await image.arrayBuffer()
    );

    const imageBlob = new Blob(
      [imageBuffer],
      {
        type: image.type || "image/jpeg",
      }
    );

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

      const body = new FormData();

      body.append("model", "gpt-image-2");
      body.append("image", imageBlob, image.name || "photo.jpg");
      body.append("prompt", prompt);
      body.append("size", "auto");
      body.append("quality", "high");
      body.append("output_format", "jpeg");

      const response = await fetch(
        "https://api.openai.com/v1/images/edits",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
          body,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        console.error(
          "OpenAI image API error:",
          response.status,
          errorText
        );

        return NextResponse.json(
          {
            success: false,
            error: `OpenAI API error ${response.status}: ${errorText}`,
          },
          { status: response.status }
        );
      }

      const data = await response.json();

      const base64Image =
        data?.data?.[0]?.b64_json;

      if (!base64Image) {
        console.error(
          "OpenAI response without image:",
          data
        );

        continue;
      }

      imageUrls.push(
        `data:image/jpeg;base64,${base64Image}`
      );
    }

    if (!imageUrls.length) {
      return NextResponse.json(
        {
          success: false,
          error: "OpenAI не вернул изображения.",
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
            : "Ошибка генерации изображения.",
      },
      { status: 500 }
    );
  }
}
