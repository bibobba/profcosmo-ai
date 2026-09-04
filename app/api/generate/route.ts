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

function lengthText(value: string) {
  const map: Record<string, string> = {
    "very-short": "очень короткая длина, волосы заметно выше ушей или около уровня ушей",
    short: "короткая длина, волосы примерно до уровня ушей или подбородка в зависимости от формы",
    medium: "средняя длина, волосы примерно до подбородка или плеч",
    "below-shoulders":
      "длина ниже плеч, волосы заметно ниже линии плеч",
    long: "длинные волосы, значительно ниже плеч",
  };

  return map[value] || value;
}

function structureText(value: string) {
  const map: Record<string, string> = {
    straight: "прямые волосы без выраженной волны",
    wavy: "волнистые волосы с естественной мягкой волной",
    curly: "кудрявые волосы с выраженными завитками",
    "afro-curls":
      "очень плотные мелкие афро-кудри с естественной спиральной структурой",
  };

  return map[value] || value;
}

function coloringText(value: string) {
  const map: Record<string, string> = {
    none: "без окрашивания, сохранить естественный цвет волос",
    solid: "однотонное окрашивание по всей массе волос",
    highlighting: "мелирование с отдельными более светлыми прядями",
    balayage: "balayage с мягким распределением светлых участков",
    shatush: "shatush с мягким переходом светлых участков",
    airtouch: "AirTouch с естественным осветлением отдельных прядей",
    ombre: "ombre с заметным переходом цвета по длине",
    toning: "тонирование с равномерным изменением оттенка",
    "gray-camouflage":
      "камуфляж седины с естественным смешением седых и окрашенных волос",
    blond: "блондирование с осветлением волос до светлого блонд-уровня",
  };

  return map[value] || value;
}

function shadeText(value: string) {
  const map: Record<string, string> = {
    natural: "натуральный оттенок",
    ash: "пепельный оттенок",
    beige: "бежевый оттенок",
    gold: "золотистый оттенок",
    copper: "медный оттенок",
    red: "красный оттенок",
    pearl: "перламутровый оттенок",
  };

  return map[value] || value;
}

function femaleBangsText(value: string) {
  const map: Record<string, string> = {
    none: "без чёлки",
    straight: "прямая чёлка",
    side: "боковая чёлка",
    long: "длинная чёлка",
    curtain: "чёлка-шторка",
    short: "короткая чёлка",
  };

  return map[value] || value;
}

function partingText(value: string) {
  const map: Record<string, string> = {
    center: "центральный пробор",
    left: "пробор слева",
    right: "пробор справа",
    none: "без выраженного пробора",
  };

  return map[value] || value;
}

function volumeText(value: string) {
  const map: Record<string, string> = {
    low: "низкий объём",
    natural: "естественный объём",
    medium: "средний объём",
    high: "высокий объём",
  };

  return map[value] || value;
}

function stylingText(value: string) {
  const map: Record<string, string> = {
    natural: "естественная укладка",
    smooth: "гладкая укладка",
    textured: "текстурная укладка",
    voluminous: "объёмная укладка",
    messy: "небрежная укладка",
    wet: "влажный эффект",
  };

  return map[value] || value;
}

function endsText(value: string) {
  const map: Record<string, string> = {
    straight: "прямые концы",
    textured: "текстурированные концы",
    soft: "мягкие, естественно лежащие концы",
  };

  return map[value] || value;
}

function maleFormText(value: string) {
  const map: Record<string, string> = {
    classic: "классическая форма",
    crop: "Crop",
    fade: "Fade",
    taper: "Taper",
    undercut: "Undercut",
    textured: "текстурированная форма",
    elongated: "удлинённая форма",
  };

  return map[value] || value;
}

function templesText(value: string) {
  const map: Record<string, string> = {
    slanted: "косые виски",
    straight: "прямые виски",
    "skin-fade": "виски с Skin Fade",
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
  } = params;

  const commonRules = `
EDIT THE PROVIDED PHOTOGRAPH. DO NOT CREATE A DIFFERENT PERSON.

The input photograph is the source of truth for the person's identity and appearance.

STRICT PRESERVATION RULES:
- Preserve the exact person's identity.
- Preserve facial structure, face shape, eyes, eyebrows, nose, lips, jaw, ears and skin.
- Preserve the person's age and natural facial features.
- Preserve head position, camera angle, body position and proportions.
- Preserve clothing.
- Preserve background, lighting, shadows and overall photographic style.
- Do not retouch or beautify the face.
- Do not change makeup.
- Do not change body shape.
- Do not change the composition.
- Do not replace the person with another person.
- Do not add accessories.
- Do not add hats, jewelry or hair accessories unless explicitly requested.
- The ONLY intended modification is the person's hair.

HAIR CONTROL:
The selected hair parameters below are HARD CONSTRAINTS, not suggestions.
Follow ALL selected parameters simultaneously.
Do not invent a different haircut, length, texture, bangs, parting, volume, styling or color.
If two instructions appear similar, satisfy both.
The final result must look like the same photograph after a professional salon hairstyle/color change.

The hair should remain physically realistic and naturally connected to the person's scalp.
Hairline, density and texture should remain believable.
`;

  let hairInstructions = `
GENDER: ${gender === "female" ? "female hairstyle" : "male hairstyle"}

LENGTH:
${lengthText(length)}

HAIR STRUCTURE:
${structureText(structure)}
`;

  if (gender === "female") {
    hairInstructions += `
FEMALE HAIR PARAMETERS:

BANGS:
${femaleBangsText(bangs)}

PARTING:
${partingText(parting)}

VOLUME:
${volumeText(volume)}

STYLING:
${stylingText(styling)}

ENDS:
${endsText(ends)}

IMPORTANT:
Do not introduce a haircut name that was not requested.
The main shape must be determined by the selected length and the selected hair characteristics.
`;
  } else {
    hairInstructions += `
MALE HAIR PARAMETERS:

FORM:
${maleFormText(maleForm)}

TEMPLES:
${templesText(temples)}

IMPORTANT:
For male hairstyles, the selected form is the primary shape.
Length must be respected, especially for Undercut and elongated forms.
Do not add bangs, side part, nape design, volume or styling instructions that were not selected.
`;
  }

  const colorInstructions = `
COLOR PARAMETERS:

TONE LEVEL:
${colorDepth} tone

SHADE:
${shadeText(colorShade)}

COLORING TECHNIQUE:
${coloringText(coloring)}

COLOR RULES:
- Treat the selected tone level as an important professional color constraint.
- Treat the selected shade as an important color constraint.
- Apply the selected coloring technique exactly.
- Do not randomly change the hair to another color.
- Do not make the hair dramatically lighter or darker unless the selected technique explicitly requires it.
- Keep the color natural and salon-realistic.
- Preserve realistic roots, highlights, shadows and hair strand variation appropriate to the selected technique.
`;

  return `
${commonRules}

${hairInstructions}

${colorInstructions}

FINAL QUALITY CHECK:
Before producing the image, verify that the result satisfies every selected hair parameter.

Most importantly:
1. The person must remain the same person.
2. Only the hair should change.
3. Hair length must match the selected length.
4. Hair structure must match the selected structure.
5. Bangs and parting must match exactly.
6. Volume and styling must match exactly.
7. Hair ends must match.
8. Color tone and shade must match.
9. Coloring technique must match.
10. Do not substitute a different hairstyle simply because it looks fashionable.

Produce a photorealistic professional salon visualization based directly on the supplied photograph.
`;
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return Response.json(
        {
          success: false,
          error: "OPENAI_API_KEY не настроен.",
        },
        { status: 500 }
      );
    }

    const formData = await request.formData();

    const image = formData.get("image");

    const gender = String(formData.get("gender") || "");
    const length = String(formData.get("length") || "");
    const structure = String(formData.get("structure") || "");

    const bangs = String(formData.get("bangs") || "");
    const parting = String(formData.get("parting") || "");
    const volume = String(formData.get("volume") || "");
    const styling = String(formData.get("styling") || "");
    const ends = String(formData.get("ends") || "");

    const maleForm = String(formData.get("maleForm") || "");
    const temples = String(formData.get("temples") || "");

    const colorDepth = String(formData.get("colorDepth") || "");
    const colorShade = String(formData.get("colorShade") || "");
    const coloring = String(formData.get("coloring") || "");

    if (!(image instanceof File)) {
      return Response.json(
        {
          success: false,
          error: "Фотография не загружена.",
        },
        { status: 400 }
      );
    }

    if (!VALID_GENDERS.includes(gender)) {
      return Response.json(
        {
          success: false,
          error: "Некорректно выбран пол.",
        },
        { status: 400 }
      );
    }

    if (!VALID_LENGTHS.includes(length)) {
      return Response.json(
        {
          success: false,
          error: "Некорректно выбрана длина.",
        },
        { status: 400 }
      );
    }

    if (!VALID_STRUCTURES.includes(structure)) {
      return Response.json(
        {
          success: false,
          error: "Некорректно выбрана структура волос.",
        },
        { status: 400 }
      );
    }

    if (gender === "female") {
      if (!VALID_FEMALE_BANGS.includes(bangs)) {
        return Response.json(
          {
            success: false,
            error: "Некорректно выбрана чёлка.",
          },
          { status: 400 }
        );
      }

      if (!VALID_PARTINGS.includes(parting)) {
        return Response.json(
          {
            success: false,
            error: "Некорректно выбран пробор.",
          },
          { status: 400 }
        );
      }

      if (!VALID_VOLUMES.includes(volume)) {
        return Response.json(
          {
            success: false,
            error: "Некорректно выбран объём.",
          },
          { status: 400 }
        );
      }

      if (!VALID_STYLINGS.includes(styling)) {
        return Response.json(
          {
            success: false,
            error: "Некорректно выбрана укладка.",
          },
          { status: 400 }
        );
      }

      if (!VALID_ENDS.includes(ends)) {
        return Response.json(
          {
            success: false,
            error: "Некорректно выбраны концы.",
          },
          { status: 400 }
        );
      }
    }

    if (gender === "male") {
      if (!VALID_MALE_FORMS.includes(maleForm)) {
        return Response.json(
          {
            success: false,
            error: "Некорректно выбрана мужская форма.",
          },
          { status: 400 }
        );
      }

      if (!VALID_TEMPLES.includes(temples)) {
        return Response.json(
          {
            success: false,
            error: "Некорректно выбраны виски.",
          },
          { status: 400 }
        );
      }
    }

    if (!colorDepth) {
      return Response.json(
        {
          success: false,
          error: "Не выбран уровень тона.",
        },
        { status: 400 }
      );
    }

    if (!colorShade) {
      return Response.json(
        {
          success: false,
          error: "Не выбран оттенок.",
        },
        { status: 400 }
      );
    }

    if (!VALID_COLORING.includes(coloring)) {
      return Response.json(
        {
          success: false,
          error: "Некорректно выбрана техника окрашивания.",
        },
        { status: 400 }
      );
    }

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
    });

    const imageBlob = new Blob(
      [await image.arrayBuffer()],
      {
        type: image.type || "image/jpeg",
      }
    );

    const body = new FormData();

    body.append("model", "gpt-image-2");
    body.append(
      "image",
      imageBlob,
      image.name || "photo.jpg"
    );
    body.append("prompt", prompt);

    // Один вариант на этапе тестирования.
    body.append("size", "1024x1536");
    body.append("quality", "high");

    // JPEG уменьшает размер ответа по сравнению с PNG.
    body.append("output_format", "jpeg");
    body.append("output_compression", "80");

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

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI API error:", data);

      return Response.json(
        {
          success: false,
          error:
            data?.error?.message ||
            "OpenAI не смог обработать изображение.",
        },
        { status: response.status }
      );
    }

    const base64Image = data?.data?.[0]?.b64_json;

    if (!base64Image) {
      console.error("OpenAI returned no image:", data);

      return Response.json(
        {
          success: false,
          error: "OpenAI не вернул изображение.",
        },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      imageUrls: [
        `data:image/jpeg;base64,${base64Image}`,
      ],
    });
  } catch (error) {
    console.error("Generate route error:", error);

    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Произошла ошибка при генерации.",
      },
      { status: 500 }
    );
  }
}
