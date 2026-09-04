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
      "очень короткая длина: волосы значительно выше плеч, короткий силуэт",
    short:
      "короткая длина: волосы примерно от уровня ушей до подбородка",
    medium:
      "средняя длина: волосы примерно от подбородка до уровня плеч",
    "below-shoulders":
      "длина ниже плеч: волосы заметно ниже линии плеч",
    long:
      "длинные волосы: волосы значительно ниже плеч",
  };

  return map[value] || value;
}

function structureText(value: string) {
  const map: Record<string, string> = {
    straight:
      "прямые волосы без выраженной естественной волны",
    wavy:
      "волнистые волосы с мягкой естественной волной",
    curly:
      "кудрявые волосы с выраженными завитками",
    "afro-curls":
      "очень плотные мелкие афро-кудри с выраженной спиральной структурой",
  };

  return map[value] || value;
}

function femaleFormText(value: string) {
  const map: Record<string, string> = {
    ai: `
AI-ПОДБОР ФОРМЫ.

Самостоятельно выбери конкретную профессиональную форму стрижки для этого человека.

Учитывай:
- форму лица;
- форму головы;
- пропорции;
- густоту волос;
- естественную структуру волос;
- выбранную длину;
- выбранный пробор;
- объём;
- укладку;
- концы.

Форма должна выглядеть как осознанное решение профессионального парикмахера.

НЕ выбирай форму случайно.
НЕ меняй выбранную длину.
НЕ нарушай остальные параметры.

Конкретное название стрижки пользователю не задано — поэтому ты самостоятельно определяешь геометрию формы.
`,

    blunt: `
ПРЯМОЙ СРЕЗ.

Создай цельную, чёткую геометрическую форму с выраженной линией нижнего среза.

Нижняя линия волос должна быть визуально ровной и плотной.
Не добавляй выраженные слои.
Не создавай каскад.
Не делай заметную разницу между уровнями длины.

Главный визуальный признак — единая плотная линия среза.
`,

    graduated: `
ГРАДУИРОВАННАЯ ФОРМА.

Создай форму, в которой длина волос постепенно изменяется между зонами.

Должен быть заметен профессиональный переход длины.
Форма должна иметь внутреннюю градуировку и изменение веса волос.

Не делай простой ровный blunt-срез.
Не превращай форму в полностью одноуровневое каре.
Градуировка должна быть видна по силуэту и распределению массы волос.
`,

    layers: `
СЛОИСТАЯ ФОРМА.

Создай стрижку с несколькими различимыми уровнями длины.

Верхние и внутренние слои должны быть короче нижних.
Должна быть заметная разница между уровнями волос.
Слои должны создавать движение и изменение силуэта.

Волосы НЕ должны выглядеть как единая цельная масса одной длины.

КРИТИЧЕСКИ ВАЖНО:
- не делать обычный blunt bob;
- не делать одноуровневое каре;
- не делать ровный цельный срез;
- не скрывать слои полностью;
- сохранить несколько визуально различимых уровней длины.

При этом общая длина должна соответствовать выбранной пользователем длине.
`,

    cascade: `
КАСКАДНАЯ ФОРМА.

Создай выраженную каскадную структуру волос с последовательными переходами длины.

Передние и верхние зоны должны иметь более короткие уровни.
Нижние зоны должны оставаться длиннее.
Переходы между уровнями должны формировать выраженный каскадный силуэт.

КРИТИЧЕСКИ ВАЖНО:
- не делать одноуровневую стрижку;
- не делать простой blunt bob;
- не делать обычное каре;
- создать заметную многоуровневую структуру;
- сохранить выбранную общую длину.
`,

    asymmetrical: `
АССИМЕТРИЧНАЯ ФОРМА.

Создай намеренно асимметричную геометрию стрижки.

Левая и правая стороны должны визуально отличаться по длине или форме.
Асимметрия должна быть осознанной и профессиональной, а не случайной ошибкой.

Не делай симметричное каре.
Не делай одинаковую длину с обеих сторон.

Общая длина всё равно должна соответствовать выбранному параметру длины.
`,
  };

  return map[value] || value;
}

function femaleBangsText(value: string) {
  const map: Record<string, string> = {
    none: "без чёлки: волосы не должны образовывать отдельную чёлку на лбу",
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
    straight: "прямые, чёткие концы",
    textured: "текстурированные концы",
    soft: "мягкие естественные концы",
  };

  return map[value] || value;
}

function maleFormText(value: string) {
  const map: Record<string, string> = {
    classic: "классическая мужская форма",
    crop: "Crop",
    fade: "Fade",
    taper: "Taper",
    undercut: "Undercut",
    textured: "текстурированная мужская форма",
    elongated: "удлинённая мужская форма",
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
      "мелирование с отдельными светлыми прядями",
    balayage:
      "Balayage с мягким распределением светлых участков",
    shatush:
      "Shatush с мягким переходом светлых участков",
    airtouch:
      "AirTouch с естественным осветлением отдельных прядей",
    ombre:
      "Ombre с переходом цвета по длине",
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

The provided photograph is the source of truth.

DO NOT CREATE A NEW PERSON.

IDENTITY PRESERVATION IS EXTREMELY IMPORTANT.

Keep:
- exactly the same person;
- the same face;
- the same facial proportions;
- the same eyes;
- the same eyebrows;
- the same nose;
- the same lips;
- the same jaw;
- the same ears;
- the same apparent age;
- the same skin;
- the same head position;
- the same camera angle;
- the same body;
- the same clothing;
- the same background;
- the same lighting;
- the same composition.

Do not beautify the face.
Do not modify facial features.
Do not modify the body.
Do not modify the clothing.
Do not modify the background.

ONLY MODIFY THE HAIR.

The result must look like a realistic photograph of the SAME PERSON after visiting a professional hair salon.

The hair must remain naturally attached to the scalp.
The hairline must remain realistic.
Hair density must remain realistic.
Individual strands must look natural.
The result must be photorealistic.

HAIR PARAMETERS ARE HARD CONSTRAINTS.

All selected parameters must be respected simultaneously.

Do not ignore a selected parameter.
Do not replace one selected parameter with another.
Do not prioritize creativity over the selected professional parameters.
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
FEMALE HAIR DESIGN

FORM OF HAIRCUT:
${femaleFormText(femaleForm)}

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

FEMALE PARAMETER PRIORITIES:

1. Overall length must visibly match the selected length.
2. The selected haircut form must be visibly expressed.
3. Hair structure must match the selected structure.
4. Bangs must match exactly.
5. Parting must match exactly.
6. Volume must match.
7. Styling must match.
8. Ends must match.

Do not let the selected styling hide the haircut geometry.

Do not let the selected volume change the actual haircut length.

Do not let the selected hair structure change the selected haircut form.

If "without bangs" is selected, absolutely do not create bangs.

If "without pronounced parting" is selected, do not create a strong visible parting.
`;
  } else {
    hairInstructions += `
MALE HAIR DESIGN

FORM:
${maleFormText(maleForm)}

TEMPLES:
${templesText(temples)}

The selected male form is mandatory.

The selected temple design is mandatory.

The selected length is mandatory.

Do not add bangs.
Do not add a side part.
Do not add a nape design.
Do not invent additional haircut parameters.
`;
  }

  const colorInstructions = `
COLOR DESIGN

TONE LEVEL:
${colorDepth} tone

SHADE:
${shadeText(colorShade)}

COLORING TECHNIQUE:
${coloringText(coloring)}

COLOR IS A HARD CONSTRAINT.

The final hair color must visibly correspond to the selected tone level and shade.

Do not randomly change the hair color.

Do not change the skin tone.

Do not change the eyebrows or eyelashes simply to make the result more dramatic.

Keep realistic natural variation in individual hair strands.

The coloring technique must be visually consistent with the selected technique.

If "without coloring" is selected, preserve the person's natural hair color as closely as possible.
`;

  const finalCheck = `
FINAL QUALITY CONTROL

Before producing the image, internally verify:

IDENTITY:
- same person;
- same face;
- same body;
- same clothing;
- same background;
- same composition.

HAIR:
- correct length;
- correct structure;
- correct haircut form;
- correct bangs;
- correct parting;
- correct volume;
- correct styling;
- correct ends.

COLOR:
- correct tone level;
- correct shade;
- correct coloring technique.

MOST IMPORTANT:

The generated hairstyle must visibly communicate the selected haircut form.

For example:

If the form is LAYERS:
the image must visibly contain multiple levels of hair length.
It must NOT look like a simple one-length bob.

If the form is CASCADE:
the image must visibly contain a cascade of different lengths.
It must NOT look like a simple bob.

If the form is GRADUATED:
the image must visibly contain a gradual change in length and weight.

If the form is ASYMMETRICAL:
the left and right sides must visibly differ.

If the form is BLUNT:
the lower edge must be visibly clean, dense and predominantly one length.

If the form is AI-PODBOR:
choose the most professionally suitable haircut geometry for this person while respecting every other selected parameter.

Do not make the result generic.

Do not make the result identical to the original hairstyle when the selected parameters require a visible haircut change.

Produce ONE photorealistic final hairstyle visualization.
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

    const gender = String(
      formData.get("gender") || ""
    );

    const length = String(
      formData.get("length") || ""
    );

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

    console.log(
      "Generating hairstyle with parameters:",
      {
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
      }
    );

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
      console.error(
        "OpenAI API error:",
        data
      );

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
