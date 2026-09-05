import { NextResponse } from "next/server";
import {
  put,
  issueSignedToken,
  presignUrl,
} from "@vercel/blob";

export const maxDuration = 300;

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

/* =========================================================
   NORMALIZATION
   ========================================================= */

function normalizeFemaleForm(
  value: string
) {
  if (
    value === "ai-podbor" ||
    value === "ai"
  ) {
    return "ai";
  }

  if (value === "blunt") {
    return "straight-cut";
  }

  return value;
}

function normalizeShade(
  value: string
) {
  if (value === "golden") {
    return "gold";
  }

  return value;
}

/* =========================================================
   DESCRIPTIONS
   ========================================================= */

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
        return "long, approximately shoulder-length or slightly below; NOT chest-length and NOT waist-length";

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

/* =========================================================
   MALE HAIRCUT
   ========================================================= */

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
- Clearly recognizable professional men's crop haircut.
- Short sides and back.
- Compact top.
- Short textured top.
- Forward-oriented compact fringe/top.
- Strong compact masculine silhouette.
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
- The transition must be visibly gradual and blended across the sides and back.
- Top remains clearly longer than the faded sides.
- Clean professional barber geometry.
- Do not make the entire haircut uniformly short.
- Do not create an undercut.
`;
      break;

    case "taper":
      formDescription = `
MALE TAPER:
- Clearly recognizable professional men's taper haircut.
- The main taper is concentrated around the temples, sideburns and neckline.
- The sides are NOT fully faded from bottom to top.
- Keep significantly more hair on the side panels than in a traditional full fade.
- The transition should remain subtle and controlled outside the edge areas.
- The top remains clearly longer than the sides.
- Preserve a natural masculine silhouette.
- Do NOT turn this into a standard FADE.
- Do NOT create a full skin fade across the entire side.
- Do NOT shave the entire side panel down to skin.
- Do NOT create an undercut.
- The visual silhouette must remain recognizably different from a full FADE.
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
- Controlled texture, not random messy hair.
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
PROFESSIONAL MEN'S HAIRCUT.
`;
  }

  const templesDescription =
    (() => {
      switch (temples) {
        case "slanted":
          return `
TEMPLE DESIGN:
- Slanted men's temple design.
- The sideburn/temple line must visibly follow an intentional diagonal angle.
`;

        case "straight":
          return `
TEMPLE DESIGN:
- Straight men's temple design.
- Clean straight vertical sideburn/temple line.
`;

        case "skin-fade":
          return `
TEMPLE DESIGN — SKIN FADE:
- Apply a skin-level fade specifically around the temple and sideburn area.
- The temple area may reach skin level.
- Keep the skin fade localized to the temple/sideburn zone.
- Do NOT automatically extend the skin fade across the entire side panel.
- If the selected haircut is TAPER, preserve the TAPER structure everywhere outside the temple/sideburn zone.
- If the selected haircut is FADE, integrate the skin fade naturally into the overall fade.
`;

        default:
          return "";
      }
    })();

  return `
${formDescription}

SELECTED LENGTH:
- ${lengthDescription}.

${templesDescription}
`;
}

/* =========================================================
   FEMALE HAIRCUT
   ========================================================= */

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

/* =========================================================
   COLOR
   ========================================================= */

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
        "professional blonde transformation with controlled lightening to the selected level followed by the selected tonal direction";
      break;

    default:
      techniqueDescription =
        "professional hair coloring";
  }

  return `
COLOR:
- Coloring technique: ${techniqueDescription}.
- Tone level: ${tone} — ${
    toneDescription[tone] ||
    "selected tone"
  }.
- Shade: ${
    shadeDescription[shade] ||
    "selected shade"
  }.
- The selected tone and shade must be visibly reflected in the hair.
- Keep the color realistic and professionally achievable.
- Do not change skin tone.
- Do not change eyebrows unless absolutely necessary for a realistic result.

${
  coloring === "blond"
    ? `
BLOND MODE:
- This is a blonde transformation, not simply a color filter.
- Hair must visibly become blonde at the selected level.
- Level 7 = medium blonde.
- Level 8 = light blonde.
- Level 9 = very light blonde.
- Level 10 = extremely light blonde.
- The selected shade controls the tonal direction after lightening.
- Do not leave the hair dark brown.
- Do not interpret the blonde level as the original hair color.
`
    : ""
}
`;
}

/* =========================================================
   PROMPT
   ========================================================= */

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

SOURCE IMAGE:
- Treat the uploaded photograph as the primary identity and composition reference.
- Perform a targeted hairstyle/hair-color edit rather than recreating a different person or scene.

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
- Preserve realistic hairline and natural density.
- Do not redraw the entire head or face when a localized hair edit is sufficient.

HARD CONSTRAINTS:
- The selected haircut form is mandatory.
- The selected length is mandatory when provided.
- The selected hair structure is mandatory.
- The selected bangs/parting/volume/styling/ends are mandatory for female results.
- The selected temple design is mandatory for male results.
- The selected color parameters are mandatory.

Do not substitute a visually similar but different haircut.
Do not mix several haircut types.
Do not invent an unrelated hairstyle.
Do not change clothing, pose, background or lighting.
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

MALE PARAMETER PRIORITY:
1. Selected male haircut form.
2. Selected temple design.
3. Selected length when applicable.
4. Selected hair structure.
5. Selected color.

IMPORTANT TAPER RULE:
If the selected form is TAPER and the temple design is SKIN FADE:
- Keep the overall haircut a TAPER.
- Keep the skin fade localized around the temples and sideburns.
- Do NOT convert the entire side into a full FADE.
- Do NOT create a high skin fade across the entire side and back.
- Side panels must retain visible hair.
- The result must visibly differ from a standard FADE.

MALE HAIRSTYLE RULES:
- The result must remain clearly masculine.
- Do not create feminine long-hair styling.
- Do not add women's bangs configuration.
- Do not invent a dramatic side part.
- Do not invent styling requirements that were not selected.
- Do not change the person's clothing or pose.

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
10. No chest-length or waist-length hair unless explicitly requested.
11. If TAPER + SKIN FADE is selected, the result must NOT become a full FADE.
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

/* =========================================================
   VALIDATION
   ========================================================= */

type VariantInput = {
  length?: string;
  structure?: string;

  femaleForm?: string;
  femaleBang?: string;
  femaleParting?: string;
  femaleVolume?: string;
  femaleStyling?: string;
  femaleEnds?: string;

  maleForm?: string;
  maleTemples?: string;
};

type ColorInput = {
  colorDepth?: string;
  colorShade?: string;
  coloring?: string;
};

function validateVariant(
  variant: VariantInput,
  gender: string
) {
  const length =
    String(
      variant.length || "medium"
    );

  const structure =
    String(
      variant.structure || ""
    );

  if (
    !isValid(
      length,
      VALID_LENGTHS
    )
  ) {
    return "Некорректно выбрана длина.";
  }

  if (
    !isValid(
      structure,
      VALID_STRUCTURES
    )
  ) {
    return "Некорректно выбрана структура волос.";
  }

  if (gender === "female") {
    const femaleForm =
      normalizeFemaleForm(
        String(
          variant.femaleForm ||
            "ai"
        )
      );

    const bangs =
      String(
        variant.femaleBang ||
          "none"
      );

    const parting =
      String(
        variant.femaleParting ||
          "center"
      );

    const volume =
      String(
        variant.femaleVolume ||
          "natural"
      );

    const styling =
      String(
        variant.femaleStyling ||
          "natural"
      );

    const ends =
      String(
        variant.femaleEnds ||
          "straight"
      );

    if (
      !isValid(
        femaleForm,
        VALID_FEMALE_FORMS
      )
    ) {
      return "Некорректно выбрана форма женской стрижки.";
    }

    if (
      !isValid(
        bangs,
        VALID_BANGS
      )
    ) {
      return "Некорректно выбрана чёлка.";
    }

    if (
      !isValid(
        parting,
        VALID_PARTINGS
      )
    ) {
      return "Некорректно выбран пробор.";
    }

    if (
      !isValid(
        volume,
        VALID_VOLUMES
      )
    ) {
      return "Некорректно выбран объём.";
    }

    if (
      !isValid(
        styling,
        VALID_STYLINGS
      )
    ) {
      return "Некорректно выбрана укладка.";
    }

    if (
      !isValid(
        ends,
        VALID_ENDS
      )
    ) {
      return "Некорректно выбраны концы.";
    }

    return null;
  }

  const maleForm =
    String(
      variant.maleForm ||
        "classic"
    );

  const temples =
    String(
      variant.maleTemples ||
        "straight"
    );

  if (
    !isValid(
      maleForm,
      VALID_MALE_FORMS
    )
  ) {
    return "Некорректно выбрана мужская форма.";
  }

  if (
    !isValid(
      temples,
      VALID_TEMPLES
    )
  ) {
    return "Некорректно выбраны виски.";
  }

  return null;
}

function validateColor(
  color: ColorInput
) {
  const coloring =
    String(
      color.coloring ||
        "none"
    );

  const colorDepth =
    String(
      color.colorDepth ||
        ""
    );

  const colorShade =
    normalizeShade(
      String(
        color.colorShade ||
          ""
      )
    );

  if (
    !isValid(
      coloring,
      VALID_COLORING
    )
  ) {
    return "Некорректно выбрана техника окрашивания.";
  }

  if (coloring === "none") {
    return null;
  }

  if (
    !isValid(
      colorDepth,
      VALID_TONES
    )
  ) {
    return "Выберите корректный уровень тона.";
  }

  if (
    !isValid(
      colorShade,
      VALID_SHADES
    )
  ) {
    return "Выберите корректный оттенок.";
  }

  if (
    coloring === "blond" &&
    Number(colorDepth) < 7
  ) {
    return "Для режима «Блонд» уровень тона должен быть от 7 до 10.";
  }

  return null;
}

/* =========================================================
   OPENAI
   ========================================================= */

async function generateOneVariant(params: {
  apiKey: string;
  image: File;
  prompt: string;
}) {
  const {
    apiKey,
    image,
    prompt,
  } = params;

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
    "95"
  );

  const response =
    await fetch(
      OPENAI_API_URL,
      {
        method: "POST",
        headers: {
          Authorization:
            `Bearer ${apiKey}`,
        },
        body: openAIForm,
      }
    );

  const text =
    await response.text();

  let data: any;

  try {
    data =
      JSON.parse(text);
  } catch {
    throw new Error(
      "OpenAI вернул некорректный ответ."
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.error?.message ||
        "Ошибка OpenAI Image API."
    );
  }

  const base64Image =
    data?.data?.[0]?.b64_json;

  if (
    typeof base64Image !==
      "string" ||
    base64Image.length === 0
  ) {
    throw new Error(
      "OpenAI не вернул изображение."
    );
  }

  return base64Image;
}

/* =========================================================
   VERCEL BLOB
   ========================================================= */

async function createSignedBlobUrl(
  base64Image: string,
  index: number
) {
  const imageBuffer =
    Buffer.from(
      base64Image,
      "base64"
    );

  const pathname =
    `generated/profcosmo-${Date.now()}-${index}.jpg`;

  const blob =
    await put(
      pathname,
      imageBuffer,
      {
        access: "private",
        contentType:
          "image/jpeg",
        addRandomSuffix: true,
      }
    );

  const token =
    await issueSignedToken({
      operations: ["get"],
    });

  const signed =
    await presignUrl(
      token,
      {
        pathname:
          blob.pathname,
        operation: "get",
        access: "private",
        validUntil:
          Date.now() +
          24 * 60 * 60 * 1000,
      }
    );

  return signed.presignedUrl;
}

/* =========================================================
   POST
   ========================================================= */

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
        {
          status: 500,
        }
      );
    }

    const formData =
      await request.formData();

    /* -----------------------------------------------------
       IMAGE
    ----------------------------------------------------- */

    const image =
      formData.get("image");

    if (!(image instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Фотография не была загружена.",
        },
        {
          status: 400,
        }
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
        {
          status: 400,
        }
      );
    }

    /* -----------------------------------------------------
       GENDER
    ----------------------------------------------------- */

    const gender =
      String(
        formData.get(
          "gender"
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
        {
          status: 400,
        }
      );
    }

    /* -----------------------------------------------------
       VARIANTS
    ----------------------------------------------------- */

    const rawVariants =
      String(
        formData.get(
          "variants"
        ) || ""
      );

    if (!rawVariants) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Параметры вариантов не переданы.",
        },
        {
          status: 400,
        }
      );
    }

    let variants: VariantInput[];

    try {
      variants =
        JSON.parse(
          rawVariants
        );
    } catch {
      return NextResponse.json(
        {
          success: false,
          error:
            "Не удалось прочитать параметры вариантов.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Array.isArray(
        variants
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Некорректный формат вариантов.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      variants.length < 1 ||
      variants.length > 3
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Можно создать от 1 до 3 вариантов.",
        },
        {
          status: 400,
        }
      );
    }

    /* -----------------------------------------------------
       COLOR MODE
    ----------------------------------------------------- */

    const colorMode =
      String(
        formData.get(
          "colorMode"
        ) || "shared"
      );

    if (
      colorMode !==
        "shared" &&
      colorMode !==
        "individual"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Некорректный режим выбора цвета.",
        },
        {
          status: 400,
        }
      );
    }

    /* -----------------------------------------------------
       SHARED COLOR
    ----------------------------------------------------- */

    const sharedColor: ColorInput = {
      colorDepth:
        String(
          formData.get(
            "sharedColorDepth"
          ) || ""
        ),

      colorShade:
        normalizeShade(
          String(
            formData.get(
              "sharedColorShade"
            ) || ""
          )
        ),

      coloring:
        String(
          formData.get(
            "sharedColoring"
          ) || "none"
        ),
    };

    /* -----------------------------------------------------
       INDIVIDUAL COLORS
    ----------------------------------------------------- */

    const rawIndividualColors =
      String(
        formData.get(
          "individualColors"
        ) || "[]"
      );

    let individualColors: ColorInput[];

    try {
      individualColors =
        JSON.parse(
          rawIndividualColors
        );
    } catch {
      return NextResponse.json(
        {
          success: false,
          error:
            "Не удалось прочитать индивидуальные настройки цвета.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Array.isArray(
        individualColors
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Некорректный формат индивидуальных цветов.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      colorMode ===
        "individual" &&
      individualColors.length !==
        variants.length
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Количество цветовых настроек не совпадает с количеством вариантов.",
        },
        {
          status: 400,
        }
      );
    }

    /* -----------------------------------------------------
       VALIDATE SHARED COLOR
    ----------------------------------------------------- */

    if (
      colorMode ===
      "shared"
    ) {
      const colorError =
        validateColor(
          sharedColor
        );

      if (colorError) {
        return NextResponse.json(
          {
            success: false,
            error:
              colorError,
          },
          {
            status: 400,
          }
        );
      }
    }

    /* -----------------------------------------------------
       VALIDATE INDIVIDUAL COLORS
    ----------------------------------------------------- */

    if (
      colorMode ===
      "individual"
    ) {
      for (
        let index = 0;
        index <
          individualColors.length;
        index++
      ) {
        const colorError =
          validateColor(
            individualColors[index]
          );

        if (colorError) {
          return NextResponse.json(
            {
              success: false,
              error:
                `Вариант ${
                  index + 1
                }: ${colorError}`,
            },
            {
              status: 400,
            }
          );
        }
      }
    }

    /* -----------------------------------------------------
       VALIDATE VARIANTS
    ----------------------------------------------------- */

    for (
      let index = 0;
      index <
        variants.length;
      index++
    ) {
      const variantError =
        validateVariant(
          variants[index],
          gender
        );

      if (variantError) {
        return NextResponse.json(
          {
            success: false,
            error:
              `Вариант ${
                index + 1
              }: ${variantError}`,
          },
          {
            status: 400,
          }
        );
      }
    }

    /* -----------------------------------------------------
       BUILD PARAMETERS
    ----------------------------------------------------- */

    const jobs =
      variants.map(
        (
          variant,
          index
        ) => {
          const length =
            String(
              variant.length ||
                "medium"
            );

          const structure =
            String(
              variant.structure ||
                ""
            );

          const femaleForm =
            normalizeFemaleForm(
              String(
                variant.femaleForm ||
                  "ai"
              )
            );

          const femaleBang =
            String(
              variant.femaleBang ||
                "none"
            );

          const femaleParting =
            String(
              variant.femaleParting ||
                "center"
            );

          const femaleVolume =
            String(
              variant.femaleVolume ||
                "natural"
            );

          const femaleStyling =
            String(
              variant.femaleStyling ||
                "natural"
            );

          const femaleEnds =
            String(
              variant.femaleEnds ||
                "straight"
            );

          const maleForm =
            String(
              variant.maleForm ||
                "classic"
            );

          const maleTemples =
            String(
              variant.maleTemples ||
                "straight"
            );

          const selectedColor =
            colorMode ===
            "shared"
              ? sharedColor
              : individualColors[
                  index
                ];

          const coloring =
            String(
              selectedColor?.coloring ||
                "none"
            );

          const colorDepth =
            String(
              selectedColor?.colorDepth ||
                ""
            );

          const colorShade =
            normalizeShade(
              String(
                selectedColor?.colorShade ||
                  ""
              )
            );

          const prompt =
            buildPrompt({
              gender,
              length,
              structure,
              femaleForm,
              maleForm,
              bangs:
                femaleBang,
              parting:
                femaleParting,
              volume:
                femaleVolume,
              styling:
                femaleStyling,
              ends:
                femaleEnds,
              temples:
                maleTemples,
              coloring,
              colorDepth,
              colorShade,
            });

          return {
            index,
            prompt,
          };
        }
      );

    /* -----------------------------------------------------
       GENERATE ALL VARIANTS IN PARALLEL
    ----------------------------------------------------- */

    const generatedImages =
      await Promise.all(
        jobs.map(
          async (job) => {
            const base64Image =
              await generateOneVariant(
                {
                  apiKey,
                  image,
                  prompt:
                    job.prompt,
                }
              );

            return {
              index:
                job.index,
              base64Image,
            };
          }
        )
      );

    /* -----------------------------------------------------
       SAVE ALL IMAGES TO PRIVATE BLOB
    ----------------------------------------------------- */

    const imageUrls =
      await Promise.all(
        generatedImages.map(
          async (
            item
          ) => {
            const url =
              await createSignedBlobUrl(
                item.base64Image,
                item.index + 1
              );

            return {
              index:
                item.index,
              url,
            };
          }
        )
      );

    imageUrls.sort(
      (a, b) =>
        a.index - b.index
    );

    const results =
      imageUrls.map(
        (item) =>
          item.url
      );

    if (
      results.length ===
      0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Не удалось сохранить результаты изображений.",
        },
        {
          status: 502,
        }
      );
    }

    return NextResponse.json({
      success: true,
      count:
        results.length,
      results,
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
      {
        status: 500,
      }
    );
  }
}
