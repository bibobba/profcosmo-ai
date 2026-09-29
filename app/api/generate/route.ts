import { NextResponse } from "next/server";
import { PALETTE } from "@/lib/palette";
import { deflateSync } from "node:zlib";
import sharp from "sharp";
import {
  put,
  issueSignedToken,
  presignUrl,
} from "@vercel/blob";

export const maxDuration = 300;
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
  "ultra-short",
  "pixie-shaved-temples",
  "short",
  "pixie",
  "trixie",
  "vixie",
  "asym-pixie-bob",
  "bixie",
  "bowl-cut",
  "shag",
  "blunt-bob",
  "graduated-bob",
  "long-bob",
  "elongated-bob",
  "shaggy-bob",
  "mullet",
  "wolf-cut",
  "long-butterfly",
  "long-cascade",
];

const FEMALE_HAIRCUTS_BY_LENGTH: Record<string, string[]> = {
  "very-short": [
    "ultra-short",
    "pixie-shaved-temples",
    "short",
  ],
  short: [
    "pixie",
    "trixie",
    "vixie",
    "asym-pixie-bob",
    "bixie",
    "bowl-cut",
  ],
  medium: [
    "shag",
    "blunt-bob",
    "graduated-bob",
    "long-bob",
    "elongated-bob",
    "shaggy-bob",
  ],
  long: [
    "mullet",
    "wolf-cut",
    "long-butterfly",
    "long-cascade",
  ],
};

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
- Choose the most professionally suitable haircut from the selected length category based on the person's face, head shape, natural hair structure and all other parameters.
- The result must still respect every explicit parameter.
- Do not randomly choose an extreme hairstyle.
`;

    case "ultra-short":
      return `
FEMALE ULTRA-SHORT:
- Extremely short feminine haircut.
- Hair is kept very close to the head with a clearly ultra-short silhouette.
- Do not turn it into a bob, pixie with long top, or medium-length haircut.
`;

    case "pixie-shaved-temples":
      return `
FEMALE PIXIE WITH SHAVED TEMPLES:
- Clearly recognizable pixie haircut.
- Temples are visibly shaved or very closely cropped.
- Keep the top and crown longer than the shaved temple area.
- The shaved temple detail must be clearly visible.
`;

    case "short":
      return `
FEMALE SHORT HAIRCUT:
- Clearly short feminine haircut.
- Hair remains above or around the ears and nape rather than becoming a bob.
- Compact, intentionally short silhouette.
`;

    case "pixie":
      return `
FEMALE PIXIE:
- Clearly recognizable classic pixie haircut.
- Short sides and back with a visibly longer top.
- Compact feminine silhouette.
- Do not turn it into a bob or bowl cut.
`;

    case "trixie":
      return `
FEMALE TRIXIE:
- Clearly recognizable modern Trixie haircut: a short pixie-derived silhouette with a deliberately elongated, textured top and/or front.
- Keep the sides and back noticeably shorter than the top/front.
- Do not turn it into a generic bob.
`;

    case "vixie":
      return `
FEMALE VIXIE:
- Clearly recognizable Vixie haircut: a pixie-bob hybrid.
- Shorter cropped areas combined with visibly longer side/front sections.
- Maintain a deliberate transition between pixie and bob proportions.
- Do not make it a standard one-length bob.
`;

    case "asym-pixie-bob":
      return `
FEMALE ASYMMETRICAL PIXIE-BOB:
- Clearly recognizable hybrid of pixie and bob.
- Left and right sides must visibly differ in length or shape.
- One side can be noticeably longer than the other.
- The asymmetry must be intentional and obvious.
`;

    case "bixie":
      return `
FEMALE BIXIE:
- Clearly recognizable bixie: a pixie-bob hybrid between a pixie and a short bob.
- Shorter nape and sides with more length and movement around the crown, sides and front.
- Do not make it a conventional blunt bob.
`;

    case "bowl-cut":
      return `
FEMALE BOWL CUT:
- Clearly recognizable bowl-cut or mushroom silhouette.
- Strong rounded perimeter around the head with a deliberate bowl-like shape.
- Keep the shape compact and graphic.
- Do not turn it into a generic pixie.
`;

    case "shag":
      return `
FEMALE SHAG:
- Clearly recognizable shag haircut.
- Multiple disconnected-looking layers with shorter upper sections and longer textured lower sections.
- Strong texture and intentionally lived-in silhouette.
- Do not make it a simple layered bob.
`;

    case "blunt-bob":
      return `
FEMALE BLUNT BOB:
- Clearly recognizable bob with a clean, strong straight perimeter.
- One dominant length line around the lower edge.
- Dense, controlled ends.
- No pronounced cascade.
`;

    case "graduated-bob":
      return `
FEMALE GRADUATED BOB:
- Clearly recognizable graduated bob.
- Back and nape are shorter and the hair progressively becomes longer toward the front.
- Visible graduated geometry and controlled weight.
- Do not make it a one-length bob.
`;

    case "long-bob":
      return `
FEMALE LONG BOB:
- Clearly recognizable long bob (lob).
- Bob silhouette extending around the shoulders or slightly above or below depending on the selected length.
- Controlled perimeter with more length than a classic bob.
- Do not make it chest-length.
`;

    case "elongated-bob":
      return `
FEMALE ELONGATED BOB:
- Clearly recognizable elongated bob.
- Longer bob proportions than a classic bob, with a controlled perimeter.
- Keep the shape clearly bob-based rather than turning it into a generic long haircut.
`;

    case "shaggy-bob":
      return `
FEMALE SHAGGY BOB:
- Clearly recognizable shaggy bob.
- Bob-based silhouette combined with visible layers, texture and movement.
- More textured and irregular than a blunt bob.
- Do not make it a simple one-length bob.
`;

    case "mullet":
      return `
FEMALE MULLET:
- Clearly recognizable mullet structure.
- Shorter, more layered front and crown with a distinctly longer back section.
- Strong contrast between the shorter front/sides and longer back.
- Do not turn it into a generic shag.
`;

    case "wolf-cut":
      return `
FEMALE WOLF CUT:
- Clearly recognizable wolf cut.
- Short, voluminous, heavily layered crown and front transitioning into noticeably longer, textured lengths.
- Strong choppy layering and a distinct wolf-cut silhouette.
- Do not reduce it to a generic shag or simple layers.
`;

    case "long-butterfly":
      return `
FEMALE LONG BUTTERFLY:
- Clearly recognizable long butterfly haircut.
- Prominent shorter face-framing and crown layers flowing into substantially longer lower lengths.
- Strong airy volume and visible face-framing layers.
- Preserve clearly long overall hair.
`;

    case "long-cascade":
      return `
FEMALE LONG CASCADE:
- Clearly recognizable long cascading haircut.
- Multiple visible layers, with shorter upper and front sections progressively transitioning into much longer lower sections.
- Preserve clearly long overall length.
- Do not turn it into a one-length long haircut.
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
  shade: string,
  colorCode: string
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

  const exactShade = colorCode ? PALETTE.find((item) => item.code === colorCode) : null;

  return `
COLOR:
- EXACT PROFESSIONAL COLOR CODE: ${colorCode || "not selected"}.
- Palette family label: ${exactShade?.family || "not selected"}.
- COLORING TECHNIQUE: ${techniqueDescription}.
- Tone level: ${tone} — ${toneDescription[tone] || "selected tone"}.
- General shade direction: ${shadeDescription[shade] || "selected shade"}.
- The exact code and the supplied palette swatch are the primary color references. Match their visible hue and tonal character as closely as possible.
- Do not replace the selected code with a nearby, more familiar or aesthetically convenient shade.
- The COLOR CODE determines the target tonal character; the COLORING TECHNIQUE determines where and how that color is distributed through the hair.
- For BALAYAGE, the result MUST visibly read as balayage, not as an all-over color:
  1. Preserve a noticeably darker natural-looking root/base area.
  2. Create multiple visible lighter balayage sections through the mid-lengths and lengths, with irregular hand-painted placement rather than uniform bands.
  3. The transition from darker base to lighter sections must be gradual and blended.
  4. Apply the selected professional code (for example 9.22) primarily as the tonal direction of the LIGHTENED balayage sections, not as a flat color covering the entire head.
  5. Keep visible tonal contrast between the base and the lighter sections. Do not make roots, mid-lengths and ends all the same color.
  6. The final image must show dimensional depth and separate lighter strands/sections clearly enough to identify the balayage technique at a glance.
- For SHATUSH, create a soft darker root area and visibly lighter, diffused lengths with no hard horizontal line.
- For HIGHLIGHTING, create multiple distinct lighter strands/sections while preserving the base color between them.
- For AIRTOUCH, create fine, numerous lighter sections with a soft diffused transition while preserving the base.
- For SOLID COLOR and TONING, apply the selected tonal result consistently across the intended hair.
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
  colorCode: string;
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
    colorCode,
  } = params;

  const common = `
TASK:
Edit the provided person's photograph. Change ONLY the hair according to the selected professional parameters.

CRITICAL EDITING RULE:
This is a HAIR-ONLY EDIT, not a portrait regeneration.
The original person must remain the same person.
The face must remain visually and geometrically unchanged.
The hairstyle must be adapted to the existing person — NEVER adapt or redraw the person to fit the hairstyle.

SOURCE IMAGE LOCK — ABSOLUTE PRIORITY:
- Use the uploaded photograph as the exact source for identity, face, body, clothing, pose, framing and scene.
- Preserve the original face exactly: same face shape, facial proportions, forehead, cheekbones, eyes, eyebrows, nose, lips, mouth, teeth, jawline, chin, ears and skin.
- The original face shape MUST NOT change from the source image. Do not make an oval face rounder, longer, narrower, wider, sharper or more angular.
- Do not regenerate, reconstruct, beautify, retouch, smooth, reshape, slim, widen, masculinize, feminize or reinterpret the face.
- Preserve the person's exact expression, apparent age and recognizable identity.
- Preserve facial hair exactly where present. Do not add, remove or redesign beard, moustache or sideburns unless they are part of the selected HAIR region.
- Preserve the original head position, camera angle, perspective, crop, framing and subject scale.
- Preserve the original shoulders, neck, body, clothing, neckline, straps, jewelry and accessories.
- Preserve the original background and every visible scene element.
- Preserve the original lighting, shadows and overall photographic appearance.
- Do not zoom in, zoom out, reframe, extend the canvas or change the aspect/composition.
- Outside the hair region, treat the source pixels as immutable.
- If changing the requested hairstyle would normally require changing the face, DO NOT change the face. Adapt the hairstyle to the existing face instead.
- If any instruction conflicts with preservation of the source person, preservation wins.

HAIR-ONLY EDITING:
- Only the hair may be intentionally modified.
- Change haircut shape, hair length, hair structure/texture, bangs, parting, volume, styling, ends and hair color according to the selected parameters.
- Hair must grow naturally from the existing scalp and existing hairline.
- Keep the person's original hairline and forehead geometry unless the selected bangs naturally cover part of it.
- Do not alter the forehead, temples, ears, cheeks, jaw or chin to make the haircut fit.
- Do not redraw the head.
- Do not create a new person with a similar appearance.
- Do not change the person's ethnicity, age, facial proportions or identity.
- Make the smallest possible image change necessary to achieve the requested hair result.

HARD PARAMETER CONSTRAINTS:
- Every selected UI parameter is a mandatory hard constraint, not a suggestion.
- Do not replace, omit or reinterpret a selected haircut because another style seems more aesthetically natural.
- Do not mix unrelated haircut types.
- Do not let the model's generic hairstyle prior override an explicit UI selection.
- Selected haircut form, length, structure, bangs, parting, volume, styling, ends, temple design, coloring technique, tone and professional shade code must be followed exactly when provided.

FINAL PRIORITY ORDER:
1. Preserve the exact original person, face and composition.
2. Preserve all non-hair content.
3. Apply the selected haircut geometry.
4. Apply the selected hair structure and styling parameters.
5. Apply the selected color technique and exact color.
`;
  const structureDescription =
    getStructureDescription(
      structure
    );

  const colorDescription =
    getColorDescription(
      coloring,
      colorDepth,
      colorShade,
      colorCode
    );

  const femaleParameterRules = `
FEMALE PARAMETER ENFORCEMENT:
- LENGTH: ${getLengthDescription(length, "female")}. This controls the visible overall hair length. Do not make the result shorter or longer.
- HAIR STRUCTURE: ${structureDescription}. Preserve this texture throughout the hairstyle. Do not silently convert wavy hair into straight hair or curls.
- BANGS: ${bangs === "none" ? "NO BANGS. Keep the forehead and front hairline open; do not create a fringe." : bangs === "straight" ? "STRAIGHT BANGS. Create a clearly visible straight-across fringe with a deliberate horizontal lower edge." : bangs === "side" ? "SIDE BANGS. The fringe must sweep clearly to one side." : bangs === "long" ? "LONG BANGS. Create visibly long fringe sections that blend into the front layers." : bangs === "curtain" ? "CURTAIN BANGS. Create a clearly separated center-opening curtain fringe." : "SHORT BANGS. Create a clearly visible short fringe above the eyebrows."}
- PARTING: ${parting === "none" ? "NO VISIBLE PART — HARD REQUIREMENT. There must be NO center part, NO side part and NO deliberate part line anywhere on the crown. Do not create a straight, symmetrical or clearly defined line of exposed scalp. Do not arrange the hair into two balanced sections. The hair should overlap naturally across the crown, with strands crossing over the root area so that the scalp is not visibly divided into left and right sections. The crown must read as naturally unparted hair." : parting === "center" ? "CENTER PART. A clearly visible central part line is required." : parting === "left" ? "LEFT PART. A clearly visible part positioned on the person's left side is required." : "RIGHT PART. A clearly visible part positioned on the person's right side is required."}
- VOLUME: ${volume === "low" ? "LOW VOLUME. Keep the silhouette close to the head." : volume === "natural" ? "NATURAL VOLUME. Keep realistic everyday volume without exaggerated lift." : volume === "medium" ? "MEDIUM VOLUME. Add clearly noticeable but controlled fullness." : "HIGH VOLUME. Create clearly visible substantial fullness and lift."}
- STYLING: ${styling === "natural" ? "NATURAL STYLING. Hair should look naturally arranged, not heavily styled." : styling === "smooth" ? "SMOOTH STYLING. Hair should look deliberately smooth and controlled." : styling === "textured" ? "TEXTURED STYLING. Show deliberate strand separation and texture." : styling === "voluminous" ? "VOLUMINOUS STYLING. Emphasize lift and fullness." : styling === "messy" ? "MESSY STYLING. Create controlled intentionally undone texture." : "WET-EFFECT STYLING. Create a clearly visible wet-look finish."}
- ENDS: ${ends === "straight" ? "STRAIGHT CUT ENDS — HARD REQUIREMENT. Hair may remain wavy through the lengths, but the BOTTOM EDGE of the haircut must form a clean, intentionally straight horizontal perimeter. Do not confuse hair texture with haircut geometry: WAVY refers to the fiber pattern; STRAIGHT ENDS refers to the shape of the lower cut line. The final few centimeters must terminate at a clearly controlled straight-cut line, even if the strands above it are wavy. Do not make the ends feathered, heavily layered, wispy, V-shaped or randomly uneven." : ends === "textured" ? "TEXTURED ENDS. The lower perimeter must visibly show separation and texture." : "SOFT ENDS. The lower perimeter must have a soft, blended finish."}
`;

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
1. EXACTLY the same person as the source image.
2. The face shape and facial geometry are unchanged from the source.
3. Eyes, eyebrows, nose, lips, mouth, jaw, chin, ears, skin and expression are unchanged.
4. The original framing, crop, camera angle, perspective and subject scale are unchanged.
5. Clothing, body, pose, background and lighting are unchanged.
6. Only the hair has been intentionally edited.
3. Male haircut.
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

${femaleParameterRules}

${colorDescription}

FINAL CHECK:
Before producing the image, verify:
1. EXACTLY the same person as the source image; face and identity are preserved.
2. Clothing, body, pose, background and lighting are unchanged.
3. Female haircut.
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
14. Every female parameter in FEMALE PARAMETER ENFORCEMENT is visibly satisfied.
15. When "NO INTENTIONAL PART" is selected, there must be no visible deliberate part line or symmetrical scalp separation at the crown.
16. When "STRAIGHT ENDS" is selected, preserve the selected wavy hair texture but make the lower haircut perimeter visibly straight and controlled.
17. Do not turn the selected coloring technique into a uniform all-over color when a dimensional technique is selected.
18. The exact professional color code must be visibly reflected in the hair.
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
  colorCode?: string;
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
      return "Некорректно выбрана стрижка.";
    }

    if (
      femaleForm !== "ai" &&
      (!FEMALE_HAIRCUTS_BY_LENGTH[length] ||
        !FEMALE_HAIRCUTS_BY_LENGTH[length].includes(
          femaleForm
        ))
    ) {
      return "Выбранная стрижка не соответствует выбранной длине.";
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

  const colorCode = String(color.colorCode || "");

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

  if (colorCode) {
    const paletteEntry = PALETTE.find((item) => item.code === colorCode);
    if (!paletteEntry) return "Выбранный код оттенка отсутствует в палитре.";
    if (paletteEntry.level && Number(colorDepth) !== paletteEntry.level) {
      return "Уровень тона не соответствует выбранному коду палитры.";
    }
  } else if (!isValid(colorShade, VALID_SHADES)) {
    return "Выберите оттенок или точный код профессиональной палитры.";
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

async function streamOneVariant(params: {
  apiKey: string;
  image: File;
  prompt: string;
  paletteReference?: File | null;
  gender: string;
  length: string;
  onPartial: (base64Image: string) => void;
}) {
  const {
    apiKey,
    image,
    prompt,
    paletteReference,
    gender,
    length,
    onPartial,
  } = params;

  const source = await prepareSourceImage(image);
  const hairMask = await createHairMask(
    source.width,
    source.height,
    gender,
    length
  );

  const openAIForm = new FormData();

  openAIForm.append("model", "gpt-image-2");
  openAIForm.append(
    "image[]",
    source.file,
    source.file.name
  );
  openAIForm.append(
    "mask",
    new File(
      [hairMask],
      "hair-mask.png",
      { type: "image/png" }
    ),
    "hair-mask.png"
  );

  if (paletteReference) {
    openAIForm.append(
      "image[]",
      paletteReference,
      paletteReference.name
    );
  }

  openAIForm.append("prompt", prompt);
  openAIForm.append("size", source.size);
  openAIForm.append("quality", "high");
  openAIForm.append("output_format", "jpeg");
  openAIForm.append("output_compression", "95");
  openAIForm.append("stream", "true");
  openAIForm.append("partial_images", "1");

  console.log("[PROFCOSMO] OpenAI request starting");

  const response = await fetch(
    OPENAI_API_URL,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: openAIForm,
    }
  );

  console.log("[PROFCOSMO] OpenAI headers received", {
    status: response.status,
    contentType: response.headers.get("content-type"),
  });

  if (!response.ok) {
    const text = await response.text();
    let data: any;

    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }

    throw new Error(
      data?.error?.message ||
        "Ошибка OpenAI Image API."
    );
  }

  if (!response.body) {
    throw new Error(
      "OpenAI не вернул поток генерации."
    );
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let finalBase64 = "";

  const processEvent = (block: string) => {
    const dataLines = block
      .split("\n")
      .filter((line) =>
        line.startsWith("data:")
      )
      .map((line) =>
        line.slice(5).trim()
      );

    if (dataLines.length === 0) return;

    const dataText = dataLines.join("\n");
    if (dataText === "[DONE]") return;

    let event: any;

    try {
      event = JSON.parse(dataText);
    } catch {
      return;
    }

    if (
      event?.type ===
        "image_edit.partial_image" &&
      typeof event.b64_json === "string"
    ) {
      console.log("[PROFCOSMO] partial image received", {
        partialIndex: event.partial_image_index,
        bytesBase64: event.b64_json.length,
      });
      onPartial(event.b64_json);
    }

    if (
      event?.type ===
        "image_edit.completed" &&
      typeof event.b64_json === "string"
    ) {
      console.log("[PROFCOSMO] final image received", {
        bytesBase64: event.b64_json.length,
      });
      finalBase64 = event.b64_json;
    }
  };

  while (true) {
    const { value, done } =
      await reader.read();

    if (done) break;

    buffer += decoder.decode(
      value,
      { stream: true }
    );

    const blocks = buffer.split(
      /\r?\n\r?\n/
    );

    buffer =
      blocks.pop() || "";

    for (const block of blocks) {
      processEvent(block);
    }
  }

  buffer += decoder.decode();

  if (buffer.trim()) {
    processEvent(buffer);
  }

  if (!finalBase64) {
    throw new Error(
      "OpenAI не вернул финальное изображение."
    );
  }

  return finalBase64;
}

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  return { r: parseInt(clean.slice(0, 2), 16), g: parseInt(clean.slice(2, 4), 16), b: parseInt(clean.slice(4, 6), 16) };
}

function crc32(buffer: Buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Buffer) {
  const typeBuffer = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4); length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function createPaletteReference(hex: string, code: string) {
  const { r, g, b } = hexToRgb(hex);
  const width = 512, height = 512;
  const row = Buffer.alloc(1 + width * 4); row[0] = 0;
  for (let x = 0; x < width; x++) { const o = 1 + x * 4; row[o] = r; row[o + 1] = g; row[o + 2] = b; row[o + 3] = 255; }
  const raw = Buffer.concat(Array.from({ length: height }, () => row));
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4); ihdr[8] = 8; ihdr[9] = 6;
  const png = Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), pngChunk("IHDR", ihdr), pngChunk("IDAT", deflateSync(raw, { level: 9 })), pngChunk("IEND", Buffer.alloc(0))]);
  return new File([png], "palette-" + code.replaceAll("/", "_") + ".png", { type: "image/png" });
}

/* =========================================================
   HAIR-ONLY MASK
   ========================================================= */

function roundTo16(value: number) {
  return Math.max(16, Math.round(value / 16) * 16);
}

function getOutputSize(width: number, height: number) {
  const ratio = width / height;

  if (ratio >= 0.9 && ratio <= 1.1) {
    return "1024x1024";
  }

  if (ratio < 0.9) {
    const outWidth = 1024;
    const outHeight = Math.min(
      1536,
      Math.max(
        1024,
        roundTo16(outWidth / ratio)
      )
    );
    return `${outWidth}x${outHeight}`;
  }

  const outHeight = 1024;
  const outWidth = Math.min(
    1536,
    Math.max(
      1024,
      roundTo16(outHeight * ratio)
    )
  );
  return `${outWidth}x${outHeight}`;
}

async function prepareSourceImage(image: File) {
  const inputBuffer = Buffer.from(
    await image.arrayBuffer()
  );

  const pipeline = sharp(inputBuffer)
    .rotate();

  const metadata = await pipeline.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error(
      "Не удалось определить размеры исходной фотографии."
    );
  }

  const normalized = await pipeline
    .png()
    .toBuffer();

  return {
    file: new File(
      [normalized],
      "source.png",
      { type: "image/png" }
    ),
    width: metadata.width,
    height: metadata.height,
    size: getOutputSize(
      metadata.width,
      metadata.height
    ),
  };
}

/*
 * The mask is deliberately conservative:
 * - white/opaque = area where hair may be edited;
 * - transparent = area that should remain protected.
 *
 * It is guidance, not a pixel-perfect segmentation. OpenAI explicitly
 * documents that masks guide the edit but may not be followed exactly.
 * The prompt therefore keeps the same absolute non-hair preservation rule.
 */
async function createHairMask(
  width: number,
  height: number,
  gender: string,
  length: string
) {
  const portrait = height >= width;
  const longHair =
    length === "below-shoulders" ||
    length === "long";

  const faceCx = 50;
  const faceCy = portrait ? 43 : 46;
  const faceRx = portrait ? 20 : 23;
  const faceRy = portrait ? 23 : 25;

  const headCx = 50;
  const headCy = portrait ? 29 : 30;
  const headRx = portrait ? 39 : 43;
  const headRy = portrait ? 31 : 34;

  const lowerY = longHair
    ? (portrait ? 78 : 82)
    : (portrait ? 61 : 63);

  const sideRx = portrait ? 44 : 47;

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg"
     width="${width}" height="${height}"
     viewBox="0 0 ${width} ${height}">
  <defs>
    <mask id="hair">
      <rect width="100%" height="100%" fill="black"/>
      <ellipse
        cx="${headCx}%"
        cy="${headCy}%"
        rx="${headRx}%"
        ry="${headRy}%"
        fill="white"/>
      <ellipse
        cx="12%"
        cy="44%"
        rx="${sideRx / 2}%"
        ry="${longHair ? 34 : 23}%"
        fill="white"/>
      <ellipse
        cx="88%"
        cy="44%"
        rx="${sideRx / 2}%"
        ry="${longHair ? 34 : 23}%"
        fill="white"/>
      ${longHair ? `
      <rect
        x="5%"
        y="${portrait ? 52 : 55}%"
        width="90%"
        height="${Math.max(10, lowerY - (portrait ? 52 : 55))}%"
        fill="white"/>
      ` : ""}
      <ellipse
        cx="${faceCx}%"
        cy="${faceCy}%"
        rx="${faceRx}%"
        ry="${faceRy}%"
        fill="black"/>
    </mask>
  </defs>
  <rect
    width="100%"
    height="100%"
    fill="white"
    mask="url(#hair)"
    opacity="1"/>
</svg>`;

  return sharp(Buffer.from(svg))
    .png()
    .toBuffer();
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

      colorCode:
        String(
          formData.get(
            "sharedColorCode"
          ) || ""
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

    console.log("[PROFCOSMO] request accepted", {
      variants: variants.length,
      colorMode,
    });

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

          const colorCode = String(selectedColor?.colorCode || "");
          const paletteEntry = colorCode ? PALETTE.find((item) => item.code === colorCode) : null;
          const paletteReference = paletteEntry ? createPaletteReference(paletteEntry.hex, paletteEntry.code) : null;

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
              colorCode,
            });

          return {
            index,
            prompt,
            paletteReference,
            gender,
            length,
          };
        }
      );

    /* -----------------------------------------------------
       STREAM ALL VARIANTS
    ----------------------------------------------------- */

    const encoder =
      new TextEncoder();

    const stream =
      new ReadableStream({
        start(controller) {
          const send = (payload: any) => {
            console.log("[PROFCOSMO] SSE -> browser", {
              type: payload?.type,
              index: payload?.index,
            });
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify(payload)}\n\n`
              )
            );
          };

          void (async () => {
            try {
              send({
                type: "started",
                count: jobs.length,
              });

              // Force the first SSE chunk through proxies/buffers immediately.
              controller.enqueue(
                encoder.encode(" ".repeat(2048) + "\n\n")
              );

              // Generate variants one-by-one. This avoids sending several
              // long image-edit streams through the same invocation at once and
              // lets the first result reach the browser as soon as it is ready.
              for (const job of jobs) {
                try {
                  const finalBase64 =
                    await streamOneVariant({
                      apiKey,
                      image,
                      prompt: job.prompt,
                      paletteReference:
                        job.paletteReference,
                      gender,
                      length: job.length,
                      onPartial: (partialBase64) => {
                        send({
                          type: "partial",
                          index: job.index,
                          src:
                            `data:image/jpeg;base64,${partialBase64}`,
                        });
                      },
                    });

                  // Store the final image first, then send only its URL to the browser.
                  // This avoids pushing a large Base64 JPEG through SSE, which is fragile
                  // on slow or unstable connections.
                  try {
                    const url =
                      await createSignedBlobUrl(
                        finalBase64,
                        job.index + 1
                      );

                    send({
                      type: "stored",
                      index: job.index,
                      url,
                    });
                  } catch (storageError) {
                    console.error(
                      "Blob storage error:",
                      storageError
                    );
                  }
                } catch (error) {
                  send({
                    type: "variant_error",
                    index: job.index,
                    error:
                      error instanceof Error
                        ? error.message
                        : "Ошибка генерации варианта.",
                  });
                }
              }

              send({
                type: "done",
              });
            } catch (error) {
              send({
                type: "error",
                error:
                  error instanceof Error
                    ? error.message
                    : "Неизвестная ошибка сервера.",
              });
            } finally {
              controller.close();
            }
          })();
        },
      });

    return new Response(stream, {
      headers: {
        "Content-Type":
          "text/event-stream; charset=utf-8",
        "Cache-Control":
          "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
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
