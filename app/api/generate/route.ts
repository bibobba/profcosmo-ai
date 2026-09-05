import { NextResponse } from "next/server";

const OPENAI_API_URL =
  "https://api.openai.com/v1/images/edits";

const VALID_GENDERS = [
  "female",
  "male",
];

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
  "straight-cut",
  "blunt",
  "graduated",
  "layers",
  "cascade",
  "asymmetrical",
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

const VALID_BANGS = [
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

const VALID_TONES = [
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
];

const VALID_SHADES = [
  "natural",
  "ash",
  "beige",
  "gold",
  "copper",
  "red",
  "pearl",
];

function isValid(
  value: string,
  values: string[]
) {
  return values.includes(value);
}

function normalizeFemaleForm(
  value: string
) {
  if (value === "blunt") {
    return "straight-cut";
  }

  return value;
}

function getLengthDescription(
  length: string,
  gender: string
) {
  if (gender === "male") {
    switch (length) {
      case "very-short":
        return "very short, approximately 1–2 cm";

      case "short":
        return "short, approximately 2–5 cm";

      case "medium":
        return "medium, approximately 5–10 cm";

      case "below-shoulders":
        return "long hair extending below the shoulders";

      case "long":
        return "long, approximately shoulder-length or slightly below; NOT waist-length and NOT chest-length";

      default:
        return "short";
    }
  }

  switch (length) {
    case "very-short":
      return "very short";

    case "short":
      return "short";

    case "medium":
      return "medium";

    case "below-shoulders":
      return "below the shoulders";

    case "long":
      return "long";

    default:
      return "medium";
  }
}

function getStructureDescription(
  structure: string
) {
  switch (structure) {
    case "straight":
      return "straight hair";

    case "wavy":
      return "wavy hair with visible natural waves";

    case "curly":
      return "curly hair with defined curls";

    case "afro-curls":
      return "tight afro-textured curls";

    default:
      return "natural hair texture";
  }
}

function getMaleFormDescription(
  form: string,
  length: string,
  temples: string
) {
  const lengthDescription =
    getLengthDescription(
      length,
      "male"
    );

  let formDescription = "";

  switch (form) {
    case "classic":
      formDescription = `
MALE CLASSIC HAIRCUT:
- Professional traditional men's haircut.
- Clean, balanced silhouette.
- Shorter sides and back.
- Moderate length on top.
- Natural masculine proportions.
- No dramatic long hair.
- No disconnected undercut.
- No feminine styling.
`;
      break;

    case "crop":
      formDescription = `
MALE CROP:
- Clearly recognizable men's crop haircut.
- Short sides and back.
- Compact top.
- Short textured top.
- Forward-oriented fringe/top.
- Strong compact silhouette.
- Do not create long hair.
- Do not create a pompadour.
- Do not create an undercut.
`;
      break;

    case "fade":
      formDescription = `
MALE FADE:
- Clearly recognizable professional fade haircut.
- Sides and back progressively transition from very short near the lower area to longer hair toward the top.
- The transition must be visibly gradual and blended.
- Top remains clearly longer than the faded sides.
- Clean professional barber geometry.
- Do not make the entire haircut uniformly short.
- Do not create an undercut.
`;
      break;

    case "taper":
      formDescription = `
MALE TAPER:
- Professional taper haircut.
- Gradual reduction of length around temples and neckline.
- The transition is concentrated around the edges.
- More hair remains on the sides than in a skin fade.
- Top remains clearly longer.
- Natural masculine silhouette.
- Do not turn it into a full skin fade.
- Do not create an undercut.
`;
      break;

    case "undercut":
      formDescription = `
MALE UNDERCUT:
- Clearly recognizable men's undercut.
- The sides and back are significantly shorter than the top.
- Strong visible disconnection between the short sides/back and longer top.
- The top must remain substantially longer than the sides.
- The long section is concentrated on the top and upper back, following a masculine undercut structure.
- Do NOT turn the hairstyle into generic long hair.
- Do NOT create hair hanging to the chest or waist.
- Do NOT make it look feminine.
- Even when the selected length is "long", keep the result recognizably masculine and undercut-shaped.
- Preserve a strong disconnected undercut silhouette.
`;
      break;

    case "textured":
      formDescription = `
MALE TEXTURED HAIRCUT:
- Professional men's textured haircut.
- Visible texture and separation between strands.
- Natural irregularity on the top.
- Short-to-medium masculine sides.
- Controlled texture, not messy random hair.
- No long feminine silhouette.
- No undercut unless explicitly requested.
`;
      break;

    case "elongated":
      formDescription = `
MALE ELONGATED HAIRCUT:
- Clearly recognizable elongated men's haircut.
- Longer top and back while maintaining a masculine men's haircut structure.
- The hair should look intentionally grown out and elongated.
- Preserve masculine proportions around the face and temples.
- The selected length must visibly affect the overall silhouette.
- "Long" means approximately shoulder-length or slightly below at maximum.
- NEVER create waist-length hair.
- NEVER create hair extending dramatically onto the chest.
- NEVER turn the result into a feminine long hairstyle.
`;
      break;

    default:
      formDescription = `
Professional men's haircut with a natural masculine silhouette.
`;
  }

  let templesDescription = "";

  switch (temples) {
    case "slanted":
      templesDescription = `
TEMPLES:
- Slanted men's temple shape.
- The temple line should visibly angle naturally.
`;
      break;

    case "straight":
      templesDescription = `
TEMPLES:
- Straight men's temple shape.
- Clean vertical/straight temple line.
`;
      break;

    case "skin-fade":
      templesDescription = `
TEMPLES:
- Skin fade at the temples.
- Very short to skin-level transition around the temple area.
- Clean professional barber finish.
- Clearly visible fade around the temples.
`;
      break;

    default:
      templesDescription = "";
  }

  return `
${formDescription}

SELECTED LENGTH:
${lengthDescription}

${templesDescription}
`;
}

function getFemaleFormDescription(
  form: string
) {
  switch (form) {
    case "ai":
      return `
FEMALE AI-PICK:
- Choose the most professionally suitable haircut shape based on the person's face, head shape, natural hair structure, selected length and all other parameters.
- The result must still respect every explicit parameter.
- Do not randomly choose an extreme hairstyle.
`;

    case "straight-cut":
      return `
FEMALE STRAIGHT CUT:
- Clean, clearly defined one-length perimeter.
- Strong straight cutting line.
- Dense, controlled lower edge.
- No visible cascade.
- No obvious layers.
- Do not turn this into a graduated bob.
`;

    case "graduated":
      return `
FEMALE GRADUATED HAIRCUT:
- Visible progressive change in length and weight.
- Professional graduated geometry.
- Clear difference between shorter and longer sections.
- Controlled shape around the head.
`;

    case "layers":
      return `
FEMALE LAYERED HAIRCUT:
- Multiple clearly distinguishable length levels.
- Upper/internal sections must be shorter than the lower sections.
- Visible layering throughout the shape.
- Do NOT make the result look like a one-length bob.
- Do NOT make it look like a simple blunt cut.
`;

    case "cascade":
      return `
FEMALE CASCADE:
- Clearly pronounced cascading structure.
- Shorter upper and front sections progressively transition into longer lower sections.
- Multiple visible length levels.
- Strong layered cascade silhouette.
- Do NOT create a one-length haircut.
`;

    case "asymmetrical":
      return `
FEMALE ASYMMETRICAL HAIRCUT:
- Left and right sides must visibly differ in length or shape.
- Professional intentional asymmetry.
- The asymmetry must be obvious enough to recognize.
`;

    default:
      return "";
  }
}

function getColorDescription(
  coloring: string,
  tone: string,
  shade: string
) {
  if (coloring === "none") {
    return `
COLOR:
- No coloring.
- Preserve the person's existing natural hair color as closely as possible.
- Do not intentionally lighten or darken the hair.
- Do not introduce copper, red, blonde or other artificial tones.
`;
  }

  const toneDescription: Record<
    string,
    string
  > = {
    "1": "deepest black",
    "2": "very dark brown",
    "3": "dark brown",
    "4": "medium dark brown",
    "5": "medium brown",
    "6": "light brown / dark blonde",
    "7": "medium blonde",
    "8": "light blonde",
    "9": "very light blonde",
    "10": "extremely light blonde",
  };

  const shadeDescription: Record<
    string,
    string
  > = {
    natural:
      "natural neutral tone",
    ash:
      "cool ash tone without strong warmth",
    beige:
      "neutral beige tone",
    gold:
      "warm golden tone",
    copper:
      "clearly visible copper tone",
    red:
      "clearly visible red tone",
    pearl:
      "cool pearlescent tone",
  };

  let techniqueDescription = "";

  switch (coloring) {
    case "solid":
      techniqueDescription =
        "uniform solid color throughout the hair";

      break;

    case "highlighting":
      techniqueDescription =
        "professional highlighting with lighter selected strands";

      break;

    case "balayage":
      techniqueDescription =
        "professional balayage with hand-painted dimensional lightening";

      break;

    case "shatush":
      techniqueDescription =
        "professional shatush with soft natural-looking lightening";

      break;

    case "airtouch":
      techniqueDescription =
        "professional AirTouch-style dimensional lightening";

      break;

    case "ombre":
      techniqueDescription =
        "professional ombre with a controlled transition from darker roots to lighter lengths";

      break;

    case "toning":
      techniqueDescription =
        "professional toning applied consistently to the existing hair";

      break;

    case "gray-camouflage":
      techniqueDescription =
        "professional gray camouflage with natural-looking coverage";

      break;

    case "blond":
      techniqueDescription =
        "professional blonde result at the selected tone level";

      break;

    default:
      techniqueDescription =
        "professional hair coloring";
  }

  return `
COLOR:
- Coloring technique: ${techniqueDescription}.
- Tone level: ${tone} — ${toneDescription[tone] || "selected tone"}.
- Shade: ${shadeDescription[shade] || "selected shade"}.
- The selected tone and shade must be visibly reflected in the hair.
- Keep the color realistic and professionally achievable.
- Do not change skin tone.
- Do not change eyebrows unless absolutely necessary for a realistic result.
`;
}

function buildPrompt(params: {
  gender: string;
  length: string;
  structure: string;
  femaleForm: string;
  maleForm: string;
  bangs: string;
  parting: string;
  volume: string;
  styling: string;
  ends: string;
  temples: string;
  coloring: string;
  colorDepth: string;
  colorShade: string;
}) {
  const {
    gender,
    length,
    structure,
    femaleForm,
    maleForm,
    bangs,
    parting,
    volume,
    styling,
    ends,
    temples,
    coloring,
    colorDepth,
    colorShade,
  } = params;

  const common = `
TASK:
Edit the provided person's photograph and change ONLY the hairstyle and hair color according to the selected professional parameters.

IDENTITY PRESERVATION:
- Keep exactly the same person.
- Preserve facial identity.
- Preserve face shape.
- Preserve eyes, nose, mouth, jawline and skin appearance.
- Preserve body, pose, clothing, hands and accessories.
- Preserve camera angle.
- Preserve lighting.
- Preserve background.
- Do not beautify or redesign the person.
- Do not change facial proportions.

HAIR EDITING:
- Change the hair realistically as if the person actually received this haircut and/or color.
- Hair must grow naturally from the scalp.
- Preserve realistic hairline and natural density.
- Maintain realistic individual strands and texture.
- The haircut must have professional barber/stylist geometry.
- Do not add hair to the face.
- Do not modify the ears, forehead or facial features except where naturally covered by the new hairstyle.

VERY IMPORTANT:
The selected haircut form is a hard constraint.
The selected length is a hard constraint when provided.
The selected hair structure is a hard constraint.
The selected color parameters are hard constraints.

Do not substitute a visually similar but different haircut.
Do not mix several haircut types.
Do not invent an unrelated hairstyle.
`;

  const structureDescription =
    getStructureDescription(
      structure
    );

  const colorDescription =
    getColorDescription(
      coloring,
      colorDepth,
      colorShade
    );

  if (gender === "male") {
    return `
${common}

GENDER:
- Male.

HAIR STRUCTURE:
- ${structureDescription}.

${getMaleFormDescription(
  maleForm,
  length,
  temples
)}

MALE HAIRSTYLE RULES:
- The result must remain clearly masculine.
- Do not create feminine long-hair styling.
- Do not add bangs as a separate women's hairstyle.
- Do not introduce a side part unless it naturally belongs to the selected male form.
- Do not invent volume or styling requirements that were not selected.

${colorDescription}

FINAL CHECK:
Before producing the image, verify:
1. Same person.
2. Male haircut.
3. Correct selected form: ${maleForm}.
4. Correct selected structure: ${structure}.
5. Correct selected temple design: ${temples}.
6. Correct selected length where applicable: ${length}.
7. Correct selected coloring: ${coloring}.
8. If coloring is not "none", correct tone ${colorDepth} and shade ${colorShade}.
9. No unrelated hairstyle.
10. No chest-length or waist-length hair unless explicitly requested by the selected parameters.
`;
  }

  return `
${common}

GENDER:
- Female.

HAIR STRUCTURE:
- ${structureDescription}.

SELECTED LENGTH:
- ${getLengthDescription(
    length,
    "female"
  )}.

${getFemaleFormDescription(
    femaleForm
  )}

BANGS:
- ${bangs}.

PARTING:
- ${parting}.

VOLUME:
- ${volume}.

STYLING:
- ${styling}.

ENDS:
- ${ends}.

${colorDescription}

FINAL CHECK:
Before producing the image, verify:
1. Same person.
2. Female haircut.
3. Correct selected haircut form: ${femaleForm}.
4. Correct selected length: ${length}.
5. Correct selected hair structure: ${structure}.
6. Correct bangs: ${bangs}.
7. Correct parting: ${parting}.
8. Correct volume: ${volume}.
9. Correct styling: ${styling}.
10. Correct ends: ${ends}.
11. Correct coloring: ${coloring}.
12. If coloring is not "none", correct tone ${colorDepth} and shade ${colorShade}.
13. No unrelated haircut.
`;
}

export async function POST(
  request: Request
) {
  try {
    const apiKey =
      process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            "OPENAI_API_KEY не настроен на сервере.",
        },
        { status: 500 }
      );
    }

    const formData =
      await request.formData();

    const image =
      formData.get("image");

    if (!(image instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Фотография не была загружена.",
        },
        { status: 400 }
      );
    }

    if (
      !image.type.startsWith(
        "image/"
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Можно загрузить только изображение.",
        },
        { status: 400 }
      );
    }

    const gender =
      String(
        formData.get("gender") ||
          ""
      );

    const length =
      String(
        formData.get("length") ||
          "short"
      );

    const structure =
      String(
        formData.get("structure") ||
          ""
      );

    const rawFemaleForm =
      String(
        formData.get(
          "femaleForm"
        ) ||
          formData.get(
            "haircutForm"
          ) ||
          ""
      );

    const femaleForm =
      normalizeFemaleForm(
        rawFemaleForm
      );

    const maleForm =
      String(
        formData.get(
          "maleForm"
        ) || ""
      );

    const bangs =
      String(
        formData.get("bangs") ||
          "none"
      );

    const parting =
      String(
        formData.get(
          "parting"
        ) || "none"
      );

    const volume =
      String(
        formData.get("volume") ||
          "natural"
      );

    const styling =
      String(
        formData.get(
          "styling"
        ) || "natural"
      );

    const ends =
      String(
        formData.get("ends") ||
          "straight"
      );

    const temples =
      String(
        formData.get(
          "temples"
        ) || "straight"
      );

    const coloring =
      String(
        formData.get(
          "coloring"
        ) || "none"
      );

    const colorDepth =
      String(
        formData.get(
          "colorDepth"
        ) || ""
      );

    const colorShade =
      String(
        formData.get(
          "colorShade"
        ) || ""
      );

    if (
      !isValid(
        gender,
        VALID_GENDERS
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Некорректно выбран пол.",
        },
        { status: 400 }
      );
    }

    if (
      !isValid(
        length,
        VALID_LENGTHS
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Некорректно выбрана длина.",
        },
        { status: 400 }
      );
    }

    if (
      !isValid(
        structure,
        VALID_STRUCTURES
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Некорректно выбрана структура волос.",
        },
        { status: 400 }
      );
    }

    if (gender === "female") {
      if (
        !isValid(
          femaleForm,
          VALID_FEMALE_FORMS
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Некорректно выбрана форма женской стрижки.",
          },
          { status: 400 }
        );
      }

      if (
        !isValid(
          bangs,
          VALID_BANGS
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Некорректно выбрана чёлка.",
          },
          { status: 400 }
        );
      }

      if (
        !isValid(
          parting,
          VALID_PARTINGS
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Некорректно выбран пробор.",
          },
          { status: 400 }
        );
      }

      if (
        !isValid(
          volume,
          VALID_VOLUMES
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Некорректно выбран объём.",
          },
          { status: 400 }
        );
      }

      if (
        !isValid(
          styling,
          VALID_STYLINGS
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Некорректно выбрана укладка.",
          },
          { status: 400 }
        );
      }

      if (
        !isValid(
          ends,
          VALID_ENDS
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Некорректно выбраны концы.",
          },
          { status: 400 }
        );
      }
    }

    if (gender === "male") {
      if (
        !isValid(
          maleForm,
          VALID_MALE_FORMS
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Некорректно выбрана мужская форма.",
          },
          { status: 400 }
        );
      }

      if (
        !isValid(
          temples,
          VALID_TEMPLES
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Некорректно выбраны виски.",
          },
          { status: 400 }
        );
      }

      if (
        maleForm !==
          "undercut" &&
        maleForm !==
          "elongated"
      ) {
        // Для остальных мужских форм
        // длина не используется.
      }
    }

    if (
      !isValid(
        coloring,
        VALID_COLORING
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Некорректно выбрана техника окрашивания.",
        },
        { status: 400 }
      );
    }

    // Если окрашивания нет,
    // цветовые параметры не требуются.
    if (coloring !== "none") {
      if (
        !isValid(
          colorDepth,
          VALID_TONES
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Выберите корректный уровень тона.",
          },
          { status: 400 }
        );
      }

      if (
        !isValid(
          colorShade,
          VALID_SHADES
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Выберите корректный оттенок.",
          },
          { status: 400 }
        );
      }
    }

    const prompt =
      buildPrompt({
        gender,
        length,
        structure,
        femaleForm,
        maleForm,
        bangs,
        parting,
        volume,
        styling,
        ends,
        temples,
        coloring,
        colorDepth,
        colorShade,
      });

    /*
     * Пока генерируем один результат.
     *
     * Это намеренно:
     * текущий endpoint возвращает base64,
     * поэтому 3 больших изображения могут
     * превысить лимит ответа Vercel.
     *
     * Три варианта вернём после подключения
     * нормального хранения изображений.
     */

    const openAIForm =
      new FormData();

    openAIForm.append(
      "model",
      "gpt-image-2"
    );

    openAIForm.append(
      "image",
      image,
      image.name
    );

    openAIForm.append(
      "prompt",
      prompt
    );

    openAIForm.append(
      "size",
      "1024x1536"
    );

    openAIForm.append(
      "quality",
      "high"
    );

    openAIForm.append(
      "output_format",
      "jpeg"
    );

    openAIForm.append(
      "output_compression",
      "80"
    );

    const openAIResponse =
      await fetch(
        OPENAI_API_URL,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
          body: openAIForm,
        }
      );

    const responseText =
      await openAIResponse.text();

    let responseData: any;

    try {
      responseData =
        JSON.parse(
          responseText
        );
    } catch {
      return NextResponse.json(
        {
          success: false,
          error:
            "OpenAI вернул некорректный ответ.",
        },
        { status: 502 }
      );
    }

    if (
      !openAIResponse.ok
    ) {
      const message =
        responseData?.error
          ?.message ||
        "Ошибка OpenAI Image API.";

      return NextResponse.json(
        {
          success: false,
          error: message,
        },
        {
          status:
            openAIResponse.status >=
              400 &&
            openAIResponse.status <
              600
              ? openAIResponse.status
              : 502,
        }
      );
    }

    const base64Image =
      responseData?.data?.[0]
        ?.b64_json;

    if (!base64Image) {
      return NextResponse.json(
        {
          success: false,
          error:
            "OpenAI не вернул изображение.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      imageUrl: `data:image/jpeg;base64,${base64Image}`,
      imageUrls: [
        `data:image/jpeg;base64,${base64Image}`,
      ],
    });
  } catch (error) {
    console.error(
      "Generation error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Неизвестная ошибка сервера.",
      },
      { status: 500 }
    );
  }
}
