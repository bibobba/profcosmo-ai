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

const VALID_FEMALE_FORMS = [
  "ai",
  "blunt",
  "graduated",
  "layers",
  "cascade",
  "asymmetrical",
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
    "very-short":
      "очень короткая длина, волосы заметно выше ушей или около уровня ушей",
    short:
      "короткая длина, волосы примерно до уровня ушей или подбородка в зависимости от формы",
    medium:
      "средняя длина, волосы примерно до подбородка или плеч",
    "below-shoulders":
      "длина ниже плеч, волосы заметно ниже линии плеч",
    long:
      "длинные волосы, значительно ниже плеч",
  };

  return map[value] || value;
}

function structureText(value: string) {
  const map: Record<string, string> = {
    straight:
      "прямые волосы без выраженной волны",
    wavy:
      "волнистые волосы с естественной мягкой волной",
    curly:
      "кудрявые волосы с выраженными завитками",
    "afro-curls":
      "очень плотные мелкие афро-кудри с естественной спиральной структурой",
  };

  return map[value] || value;
}

function femaleFormText(value: string) {
  const map: Record<string, string> = {
    ai:
      "AI-подбор формы: самостоятельно выбери наиболее подходящую профессиональную форму стрижки, учитывая лицо, голову, структуру волос, длину и остальные выбранные параметры",
    blunt:
      "прямой срез: чёткая цельная линия с минимальной градуировкой и слоями",
    graduated:
      "градуированная форма: постепенное изменение длины волос для создания градуированной геометрии",
    layers:
      "слоистая форма: несколько уровней длины с заметной многослойностью",
    cascade:
      "каскадная форма: выраженные переходы длины и каскадное распределение прядей",
    asymmetrical:
      "асимметричная форма: намеренно различающаяся длина или геометрия с одной стороны и другой",
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

function coloringText(value: string) {
  const map: Record<string, string> = {
    none:
      "без окрашивания, сохранить естественный цвет волос",
    solid:
      "однотонное окрашивание по всей массе волос",
    highlighting:
      "мелирование с отдельными более светлыми прядями",
    balayage:
      "Balayage с мягким распределением светлых участков",
    shatush:
      "Shatush с мягким переходом светлых участков",
    airtouch:
      "AirTouch с естественным осветлением отдельных прядей",
    ombre:
      "Ombre с заметным переходом цвета по длине",
    toning:
      "тонирование с равномерным изменением оттенка",
    "gray-camouflage":
      "камуфляж седины с естественным смешением седых и окрашенных волос",
    blond:
      "блондирование с осветлением волос до светлого блонд-уровня",
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

function buildPrompt(params: {
  gender: string;
  length: string;
  structure: string;

  femaleForm: string;
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

    femaleForm,
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
EDIT THE PROVIDED PHOTOGRAPH.

This is a professional hairstyle visualization.
The photograph is the source of truth.

DO NOT CREATE A NEW PERSON.

IDENTITY PRESERVATION — ABSOLUTE PRIORITY:
- Keep exactly the same person.
- Preserve facial identity and facial structure.
- Preserve eyes, eyebrows, nose, lips, jaw, ears and skin.
- Preserve apparent age.
- Preserve head position.
- Preserve camera angle.
- Preserve body position and proportions.
- Preserve clothing.
- Preserve background.
- Preserve lighting.
- Preserve shadows.
- Preserve photographic style.
- Do not beautify the face.
- Do not change makeup.
- Do not alter facial features.
- Do not alter body shape.
- Do not change the composition.
- Do not add accessories.
- Do not add jewelry.
- Do not add hats.
- Do not add hair accessories.

ONLY MODIFY THE HAIR.

HAIR PARAMETERS ARE HARD CONSTRAINTS.

Every selected hair parameter must be respected simultaneously.
Do not replace one requested characteristic with another.
Do not ignore a parameter because another parameter is more visually convenient.

The final image must look like the SAME PERSON in the SAME PHOTOGRAPH after a professional salon hairstyle and/or hair-color change.

The hair must remain physically realistic and naturally attached to the person's scalp.
The hairline must remain believable.
Hair density must remain believable.
Hair texture must remain believable.
`;

  let hairInstructions = `
GENDER:
${gender === "female" ? "female" : "male"}

LENGTH:
${lengthText(length)}

STRUCTURE:
${structureText(structure)}
`;

  if (gender === "female") {
    hairInstructions += `
FEMALE HAIR DESIGN:

FORM OF HAIRCUT:
${femaleFormText(femaleForm)}

The form of the haircut must be constructed according to the selected form above.

If the selected form is AI-podbor:
- You choose the specific haircut geometry yourself.
- Choose the most suitable professional form for this particular person.
- Consider face shape, head shape, hair density, hair structure, selected length and all other selected parameters.
- The specific haircut name is NOT predetermined.
- Do not mention a haircut name in the image.
- Do not invent a form that conflicts with the selected parameters.

If a specific form is selected:
- That form is mandatory.
- Build the haircut geometry around that form.
- Do not replace it with another basic form.

LENGTH HAS HIGH PRIORITY:
The final silhouette must visibly match the selected length.

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

IMPORTANT FEMALE RULES:
- Do not add bangs when "without bangs" is selected.
- Do not add a pronounced parting when "without pronounced parting" is selected.
- Do not create excessive volume when natural or low volume is selected.
- Do not turn straight hair into waves or curls.
- Do not turn the selected length into another length.
`;
  } else {
    hairInstructions += `
MALE HAIR DESIGN:

FORM:
${maleFormText(maleForm)}

TEMPLES:
${templesText(temples)}

IMPORTANT MALE RULES:
- The selected male form is mandatory.
- The selected temple shape is mandatory.
- Respect the selected length.
- Do not add bangs.
- Do not add a side part.
- Do not add a nape design.
- Do not invent additional styling parameters.
`;
  }

  const colorInstructions = `
COLOR DESIGN:

TONE LEVEL:
${colorDepth} tone

SELECTED SHADE:
${shadeText(colorShade)}

COLORING TECHNIQUE:
${coloringText(coloring)}

COLOR RULES:
- The selected tone level is a HARD COLOR CONSTRAINT.
- The selected shade is a HARD COLOR CONSTRAINT.
- The selected coloring technique is a HARD COLOR CONSTRAINT.
- Do not randomly change the hair to another color.
- Do not make the hair dramatically lighter or darker unless the selected technique requires it.
- Keep the result salon-realistic.
- Preserve realistic hair strand variation.
- Preserve realistic highlights and shadows.
- Do not change the skin tone.
- Do not change eyebrows or eyelashes unless this is an unavoidable natural consequence of the selected hair color.
`;

  const finalCheck = `
FINAL INTERNAL CHECK BEFORE GENERATING:

Check ALL of the following:

1. Same person.
2. Same face.
3. Same body.
4. Same clothes.
5. Same background.
6. Same composition.
7. Only hair changed.
8. Correct length.
9. Correct hair structure.
10. Correct haircut form.
11. Correct bangs.
12. Correct parting.
13. Correct volume.
14. Correct styling.
15. Correct ends.
16. Correct tone level.
17. Correct shade.
18. Correct coloring technique.

If any hair parameter conflicts with the generated result, correct the hair before producing the final image.

Do not optimize for fashion.
Do not optimize for creativity.
Optimize for accurate execution of the selected professional parameters.

Produce ONE photorealistic salon visualization.
`;

  return `
${commonRules}

${hairInstructions}

${colorInstructions}

${finalCheck}
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
    const structure = String(
      formData.get("structure") || ""
    );

    const femaleForm = String(
      formData.get("femaleForm") || ""
    );

    const bangs = String(
      formData.get("bangs") || ""
    );

    const parting = String(
      formData.get("parting") || ""
    );

    const volume = String(
      formData.get("volume") || ""
    );

    const styling = String(
      formData.get("styling") || ""
    );

    const ends = String(
      formData.get("ends") || ""
    );

    const maleForm = String(
      formData.get("maleForm") || ""
    );

    const temples = String(
      formData.get("temples") || ""
    );

    const colorDepth = String(
      formData.get("colorDepth") || ""
    );

    const colorShade = String(
      formData.get("colorShade") || ""
    );

    const coloring = String(
      formData.get("coloring") || ""
    );

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
      if (!VALID_FEMALE_FORMS.includes(femaleForm)) {
        return Response.json(
          {
            success: false,
            error: "Некорректно выбрана форма стрижки.",
          },
          { status: 400 }
        );
      }

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

      femaleForm,
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

    console.log("Generating hairstyle with parameters:", {
      gender,
      length,
      structure,
      femaleForm,
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

    body.append("size", "1024x1536");
    body.append("quality", "high");
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

    const base64Image =
      data?.data?.[0]?.b64_json;

    if (!base64Image) {
      console.error(
        "OpenAI returned no image:",
        data
      );

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
    console.error(
      "Generate route error:",
      error
    );

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
