"use client";

import { useEffect, useState } from "react";
import { PalettePicker } from "@/components/PalettePicker";
import { removeBackground } from "@imgly/background-removal";

type Option = {
  value: string;
  label: string;
};

type Variant = {
  length: string;
  structure: string;
  femaleForm: string;
  femaleBang: string;
  femaleParting: string;
  femaleVolume: string;
  femaleStyling: string;
  femaleEnds: string;
  maleForm: string;
  maleTemples: string;
};

type ColorSettings = {
  colorDepth: string;
  colorShade: string;
  coloring: string;
  colorCode: string;
};

const lengths: Option[] = [
  { value: "very-short", label: "Очень короткая" },
  { value: "short", label: "Короткая" },
  { value: "medium", label: "Средняя" },
  { value: "below-shoulders", label: "Ниже плеч" },
  { value: "long", label: "Длинная" },
];

const structures: Option[] = [
  { value: "straight", label: "Прямые" },
  { value: "wavy", label: "Волнистые" },
  { value: "curly", label: "Кудрявые" },
  { value: "afro-curls", label: "Афро-кудри" },
];

const femaleLengths: Option[] = [
  { value: "very-short", label: "Очень короткие" },
  { value: "short", label: "Короткие" },
  { value: "medium", label: "Средние" },
  { value: "long", label: "Длинные" },
];

const femaleHaircutsByLength: Record<string, Option[]> = {
  "very-short": [
    { value: "ultra-short", label: "Ультракороткая" },
    { value: "pixie-shaved-temples", label: "Пикси с бритыми висками" },
    { value: "short", label: "Короткая" },
  ],
  short: [
    { value: "pixie", label: "Пикси" },
    { value: "trixie", label: "Трикси" },
    { value: "vixie", label: "Викси" },
    { value: "asym-pixie-bob", label: "Асимметричный пикси-боб" },
    { value: "bixie", label: "Бикси" },
    { value: "bowl-cut", label: "Боул-кат (горшок)" },
  ],
  medium: [
    { value: "shag", label: "Шэг" },
    { value: "blunt-bob", label: "Каре с прямым срезом" },
    { value: "graduated-bob", label: "Градуированный боб" },
    { value: "long-bob", label: "Лонг-боб" },
    { value: "elongated-bob", label: "Удлинённое каре" },
    { value: "shaggy-bob", label: "Шэгги-каре" },
  ],
  long: [
    { value: "mullet", label: "Маллет" },
    { value: "wolf-cut", label: "Вулф-кат" },
    { value: "long-butterfly", label: "Длинная «бабочка»" },
    { value: "long-cascade", label: "Длинный каскад" },
  ],
};

function femaleHaircutOptions(length: string): Option[] {
  return [
    { value: "ai-podbor", label: "AI-подбор" },
    ...(femaleHaircutsByLength[length] || []),
  ];
}

const femaleBangs: Option[] = [
  { value: "none", label: "Без чёлки" },
  { value: "straight", label: "Прямая" },
  { value: "side", label: "Боковая" },
  { value: "long", label: "Длинная" },
  { value: "curtain", label: "Шторка" },
  { value: "short", label: "Короткая" },
];

const femalePartings: Option[] = [
  { value: "center", label: "Центральный" },
  { value: "left", label: "Слева" },
  { value: "right", label: "Справа" },
  { value: "none", label: "Без выраженного пробора" },
];

const volumes: Option[] = [
  { value: "low", label: "Низкий" },
  { value: "natural", label: "Естественный" },
  { value: "medium", label: "Средний" },
  { value: "high", label: "Высокий" },
];

const stylings: Option[] = [
  { value: "natural", label: "Естественная" },
  { value: "smooth", label: "Гладкая" },
  { value: "textured", label: "Текстурная" },
  { value: "voluminous", label: "Объёмная" },
  { value: "messy", label: "Небрежная" },
  { value: "wet", label: "Влажный эффект" },
];

const ends: Option[] = [
  { value: "straight", label: "Прямые" },
  { value: "textured", label: "Текстурированные" },
  { value: "soft", label: "Мягкие" },
];

const maleForms: Option[] = [
  { value: "classic", label: "Классическая" },
  { value: "crop", label: "Crop" },
  { value: "fade", label: "Fade" },
  { value: "taper", label: "Taper" },
  { value: "undercut", label: "Undercut" },
  { value: "textured", label: "Текстурированная" },
  { value: "elongated", label: "Удлинённая" },
];

const temples: Option[] = [
  { value: "slanted", label: "Косые" },
  { value: "straight", label: "Прямые" },
  { value: "skin-fade", label: "Skin fade" },
];

const coloringTechniques: Option[] = [
  { value: "none", label: "Без окрашивания" },
  { value: "solid", label: "Однотонное" },
  { value: "highlighting", label: "Мелирование" },
  { value: "balayage", label: "Balayage" },
  { value: "shatush", label: "Shatush" },
  { value: "airtouch", label: "AirTouch" },
  { value: "ombre", label: "Ombre" },
  { value: "toning", label: "Тонирование" },
  { value: "gray-camouflage", label: "Камуфляж седины" },
  { value: "blond", label: "Блонд" },
];

const allToneLevels: Option[] = Array.from(
  { length: 10 },
  (_, index) => ({
    value: String(index + 1),
    label: `${index + 1} тон`,
  })
);

const blondToneLevels = allToneLevels.filter(
  (option) => Number(option.value) >= 7
);

const shadesByTone: Record<string, Option[]> = {
  "1": [
    { value: "natural", label: "Натуральный" },
    { value: "ash", label: "Пепельный" },
  ],
  "2": [
    { value: "natural", label: "Натуральный" },
    { value: "ash", label: "Пепельный" },
  ],
  "3": [
    { value: "natural", label: "Натуральный" },
    { value: "ash", label: "Пепельный" },
    { value: "beige", label: "Бежевый" },
  ],
  "4": [
    { value: "natural", label: "Натуральный" },
    { value: "ash", label: "Пепельный" },
    { value: "beige", label: "Бежевый" },
    { value: "golden", label: "Золотистый" },
  ],
  "5": [
    { value: "natural", label: "Натуральный" },
    { value: "ash", label: "Пепельный" },
    { value: "beige", label: "Бежевый" },
    { value: "golden", label: "Золотистый" },
    { value: "copper", label: "Медный" },
  ],
  "6": [
    { value: "natural", label: "Натуральный" },
    { value: "ash", label: "Пепельный" },
    { value: "beige", label: "Бежевый" },
    { value: "golden", label: "Золотистый" },
    { value: "copper", label: "Медный" },
    { value: "red", label: "Красный" },
  ],
  "7": [
    { value: "natural", label: "Натуральный" },
    { value: "ash", label: "Пепельный" },
    { value: "beige", label: "Бежевый" },
    { value: "golden", label: "Золотистый" },
    { value: "copper", label: "Медный" },
  ],
  "8": [
    { value: "natural", label: "Натуральный" },
    { value: "ash", label: "Пепельный" },
    { value: "beige", label: "Бежевый" },
    { value: "golden", label: "Золотистый" },
    { value: "pearl", label: "Перламутровый" },
  ],
  "9": [
    { value: "natural", label: "Натуральный" },
    { value: "ash", label: "Пепельный" },
    { value: "beige", label: "Бежевый" },
    { value: "golden", label: "Золотистый" },
    { value: "pearl", label: "Перламутровый" },
  ],
  "10": [
    { value: "natural", label: "Натуральный" },
    { value: "ash", label: "Пепельный" },
    { value: "beige", label: "Бежевый" },
    { value: "pearl", label: "Перламутровый" },
  ],
};

function createDefaultVariant(): Variant {
  return {
    length: "medium",
    structure: "straight",
    femaleForm: "ai-podbor",
    femaleBang: "none",
    femaleParting: "center",
    femaleVolume: "natural",
    femaleStyling: "natural",
    femaleEnds: "straight",
    maleForm: "classic",
    maleTemples: "straight",
  };
}

function createDefaultColor(): ColorSettings {
  return {
    colorDepth: "5",
    colorShade: "natural",
    coloring: "none",
    colorCode: "",
  };
}

function OptionGroup({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="option-group">
      <h3>{title}</h3>

      <div className="options">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`option ${value === option.value ? "option-active" : ""}`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function getVariantSummary(
  variant: Variant,
  gender: "female" | "male"
): string {
  const structure =
    structures.find((item) => item.value === variant.structure)?.label || "";

  if (gender === "female") {
    const length =
      lengths.find((item) => item.value === variant.length)?.label || "";

    const form =
      femaleHaircutOptions(variant.length).find(
        (item) => item.value === variant.femaleForm
      )?.label || "";

    return length + " · " + structure + " · " + form;
  }

  const form =
    maleForms.find((item) => item.value === variant.maleForm)?.label || "";

  return `${form} · ${structure}`;
}

function ColorSettingsBlock({
  color,
  onChange,
}: {
  color: ColorSettings;
  onChange: (changes: Partial<ColorSettings>) => void;
}) {
  const [selectionMode, setSelectionMode] = useState<"simple" | "professional">(
    color.colorCode ? "professional" : "simple"
  );

  const toneOptions =
    color.coloring === "blond" ? blondToneLevels : allToneLevels;

  const availableShades =
    color.colorDepth ? shadesByTone[color.colorDepth] || [] : [];

  function changeSelectionMode(mode: "simple" | "professional") {
    setSelectionMode(mode);

    if (mode === "simple") {
      onChange({ colorCode: "" });
    } else {
      onChange({ colorShade: "", colorCode: "" });
    }
  }

  function changeColoring(value: string) {
    if (value === "none") {
      onChange({
        coloring: value,
        colorDepth: "5",
        colorShade: "natural",
        colorCode: "",
      });
      return;
    }

    if (value === "blond" && Number(color.colorDepth) < 7) {
      onChange({
        coloring: value,
        colorDepth: "7",
        colorShade: "",
        colorCode: "",
      });
      return;
    }

    onChange({
      coloring: value,
      colorShade: "",
      colorCode: "",
    });
  }

  return (
    <>
      <OptionGroup
        title="Техника окрашивания"
        options={coloringTechniques}
        value={color.coloring}
        onChange={changeColoring}
      />

      {color.coloring !== "none" ? (
        <>
          <div className="option-group">
            <h3>Способ выбора цвета</h3>

            <div className="color-mode">
              <button
                type="button"
                className={`color-mode-option ${selectionMode === "simple" ? "color-mode-active" : ""}`}
                onClick={() => changeSelectionMode("simple")}
              >
                <strong>Простой выбор</strong>
                <span>Уровень тона и общее направление цвета</span>
              </button>

              <button
                type="button"
                className={`color-mode-option ${selectionMode === "professional" ? "color-mode-active" : ""}`}
                onClick={() => changeSelectionMode("professional")}
              >
                <strong>Профессиональная палитра</strong>
                <span>Точный выбор оттенка по коду</span>
              </button>
            </div>
          </div>

          {selectionMode === "simple" ? (
            <>
              <OptionGroup
                title="Уровень тона"
                options={toneOptions}
                value={color.colorDepth}
                onChange={(value) =>
                  onChange({
                    colorDepth: value,
                    colorShade: "",
                    colorCode: "",
                  })
                }
              />

              {color.colorDepth ? (
                <OptionGroup
                  title="Оттенок (общее направление)"
                  options={availableShades}
                  value={color.colorShade}
                  onChange={(value) =>
                    onChange({
                      colorShade: value,
                      colorCode: "",
                    })
                  }
                />
              ) : null}
            </>
          ) : (
            <div className="option-group">
              <h3>Профессиональная палитра</h3>
              <p style={{ margin: "-6px 0 12px", color: "#77736c", fontSize: 13 }}>
                Сначала уровень тона, затем точный оттенок по коду.
              </p>
              <PalettePicker
                value={color.colorCode}
                onChange={(entry) =>
                  onChange({
                    colorCode: entry.code,
                    colorDepth: entry.level ? String(entry.level) : color.colorDepth,
                    colorShade: entry.family,
                  })
                }
              />
            </div>
          )}
        </>
      ) : null}
    </>
  );
}

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [gender, setGender] = useState<"female" | "male">("female");
  const [variants, setVariants] = useState<Variant[]>([createDefaultVariant()]);
  const [activeVariant, setActiveVariant] = useState(0);
  const [colorMode, setColorMode] = useState<"shared" | "individual">("shared");
  const [sharedColor, setSharedColor] = useState<ColorSettings>(createDefaultColor());
  const [individualColors, setIndividualColors] = useState<ColorSettings[]>([createDefaultColor()]);
  const [resultImages, setResultImages] = useState<string[]>([]);
  const [streamingImages, setStreamingImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState("");
  const [preparingImage, setPreparingImage] = useState(false);

  const loadingMessages = [
    "Подготавливаем фотографию…",
    "Анализируем параметры…",
    `Создаём ${variants.length} ${variants.length === 1 ? "вариант" : variants.length < 5 ? "варианта" : "вариантов"} прически…`,
    "Сохраняем результаты…",
  ];

  const currentVariant = variants[activeVariant];

  const maleLengthVisible =
    gender === "male" &&
    (currentVariant.maleForm === "undercut" || currentVariant.maleForm === "elongated");

  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(() => {
      setLoadingStep((current) => (current + 1) % loadingMessages.length);
    }, 2200);

    return () => clearInterval(interval);
  }, [loading, loadingMessages.length]);

  useEffect(() => {
    if (individualColors.length === variants.length) return;

    setIndividualColors((current) => {
      const next = [...current];

      while (next.length < variants.length) {
        next.push(createDefaultColor());
      }

      return next.slice(0, variants.length);
    });
  }, [variants.length, individualColors.length]);

  async function handleImage(file: File | null) {
    if (!file) return;

    setPreparingImage(true);
    setError("");
    setResultImages([]);

    try {
      const cutout = await removeBackground(file);
      const bitmap = await createImageBitmap(cutout);
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Не удалось подготовить изображение.");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, bitmap.width, bitmap.height);
      ctx.drawImage(bitmap, 0, 0);
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Не удалось сохранить изображение.")), "image/png")
      );
      const prepared = new File([blob], "profcosmo-prepared.png", { type: "image/png" });
      setImage(prepared);
      setPreview(URL.createObjectURL(prepared));
    } catch (err) {
      console.error(err);
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setError("Не удалось автоматически убрать фон. Используется исходная фотография.");
    } finally {
      setPreparingImage(false);
    }
  }

  function updateVariant(index: number, changes: Partial<Variant>) {
    setVariants((current) =>
      current.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, ...changes } : variant
      )
    );
  }

  function updateIndividualColor(index: number, changes: Partial<ColorSettings>) {
    setIndividualColors((current) =>
      current.map((color, colorIndex) =>
        colorIndex === index ? { ...color, ...changes } : color
      )
    );
  }

  function addVariant() {
    if (variants.length >= 3) return;

    setVariants((current) => [...current, createDefaultVariant()]);
    setIndividualColors((current) => [...current, createDefaultColor()]);
    setActiveVariant(variants.length);
    setError("");
  }

  function removeVariant(index: number) {
    if (variants.length <= 1) return;

    setVariants((current) => current.filter((_, variantIndex) => variantIndex !== index));
    setIndividualColors((current) => current.filter((_, colorIndex) => colorIndex !== index));

    setActiveVariant((current) => {
      if (current > index) return current - 1;
      if (current === index && current >= variants.length - 1) {
        return Math.max(0, current - 1);
      }
      return current;
    });

    setError("");
  }

  function changeGender(nextGender: "female" | "male") {
    setGender(nextGender);
    setVariants([createDefaultVariant()]);
    setIndividualColors([createDefaultColor()]);
    setActiveVariant(0);
    setResultImages([]);
    setError("");
  }

  function handleMaleFormChange(value: string) {
    const changes: Partial<Variant> = { maleForm: value };

    if (value !== "undercut" && value !== "elongated") {
      changes.length = "short";
    }

    updateVariant(activeVariant, changes);
  }

  function generateColorLabel(color: ColorSettings) {
    if (color.coloring === "none") return "Без окрашивания";

    const technique =
      coloringTechniques.find((item) => item.value === color.coloring)?.label || "";

    if (color.colorCode) {
      return `${technique} · ${color.colorCode}`;
    }

    const shade =
      shadesByTone[color.colorDepth]?.find(
        (item) => item.value === color.colorShade
      )?.label || "";

    return `${technique} · ${color.colorDepth} тон · ${shade}`;
  }

  async function generate() {
    if (!image) {
      setError("Сначала загрузите фотографию.");
      return;
    }

    const colors =
      colorMode === "shared"
        ? variants.map(() => sharedColor)
        : individualColors;

    for (const color of colors) {
      if (
        color.coloring !== "none" &&
        !color.colorDepth
      ) {
        setError(
          "Для окрашивания выберите уровень тона."
        );
        return;
      }

      if (
        color.coloring !== "none" &&
        !color.colorCode &&
        !color.colorShade
      ) {
        setError(
          "Выберите оттенок: простой вариант или точный код в профессиональной палитре."
        );
        return;
      }
    }

    setLoading(true);
    setLoadingStep(0);
    setError("");
    setResultImages([]);
    setStreamingImages(
      Array(variants.length).fill("")
    );

    try {
      const formData = new FormData();

      formData.append("image", image);
      formData.append("gender", gender);
      formData.append(
        "variants",
        JSON.stringify(variants)
      );
      formData.append(
        "colorMode",
        colorMode
      );
      formData.append(
        "sharedColorDepth",
        sharedColor.colorDepth
      );
      formData.append(
        "sharedColorShade",
        sharedColor.colorShade
      );
      formData.append(
        "sharedColoring",
        sharedColor.coloring
      );
      formData.append(
        "sharedColorCode",
        sharedColor.colorCode
      );
      formData.append(
        "individualColors",
        JSON.stringify(
          individualColors
        )
      );

      const response = await fetch(
        "/api/generate",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        let message =
          `Не удалось запустить генерацию. Код: ${response.status}`;

        try {
          const data =
            await response.json();
          message =
            data.error || message;
        } catch {}

        throw new Error(message);
      }

      if (!response.body) {
        throw new Error(
          "Сервер не вернул поток генерации."
        );
      }

      const reader =
        response.body.getReader();
      const decoder =
        new TextDecoder();
      let buffer = "";

      const updateStreamingImage = (
        index: number,
        src: string
      ) => {
        setStreamingImages(
          (current) => {
            const next = [...current];
            next[index] = src;
            return next;
          }
        );
      };

      const processEvent = (
        block: string
      ) => {
        const dataLines = block
          .split("\n")
          .filter((line) =>
            line.startsWith("data:")
          )
          .map((line) =>
            line.slice(5).trim()
          );

        if (dataLines.length === 0)
          return;

        const dataText =
          dataLines.join("\n");

        if (dataText === "[DONE]")
          return;

        let event: {
          type?: string;
          index?: number;
          src?: string;
          url?: string;
          error?: string;
        };

        try {
          event = JSON.parse(
            dataText
          );
        } catch {
          return;
        }

        if (
          event.type === "partial" &&
          typeof event.index === "number" &&
          event.src
        ) {
          updateStreamingImage(
            event.index,
            event.src
          );
          return;
        }

        if (
          event.type === "complete" &&
          typeof event.index === "number" &&
          (event.src || event.url)
        ) {
          const resultSrc =
            event.src || event.url!;

          updateStreamingImage(
            event.index,
            resultSrc
          );

          setResultImages(
            (current) => {
              const next = [...current];
              next[event.index!] =
                resultSrc;
              return next;
            }
          );
          return;
        }

        if (
          event.type === "stored" &&
          typeof event.index === "number" &&
          event.url
        ) {
          updateStreamingImage(
            event.index,
            event.url
          );

          setResultImages(
            (current) => {
              const next = [...current];
              next[event.index!] =
                event.url!;
              return next;
            }
          );
          return;
        }

        if (
          event.type ===
            "variant_error" &&
          event.error
        ) {
          setError(
            event.error
          );
        }

        if (
          event.type === "error" &&
          event.error
        ) {
          throw new Error(
            event.error
          );
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

        const blocks =
          buffer.split(
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
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Произошла ошибка при генерации."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <div className="container">
        <header className="header">
          <div>
            <h1>ПРОФКОСМО AI</h1>
            <p>ИИ-подбор прически</p>
          </div>
        </header>

        <section className="card">
          <h2>1. Фотография</h2>
          <label className="upload">
            {preview ? (
              <img src={preview} alt="Загруженная фотография" />
            ) : (
              <div>
                <strong>Загрузить фотографию</strong>
                <span>Лучше использовать фото анфас</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(event) => handleImage(event.target.files?.[0] || null)}
            />
          </label>
        </section>

        <section className="card">
          <h2>2. Параметры прически</h2>

          <OptionGroup
            title="Пол"
            options={[
              { value: "female", label: "Женская" },
              { value: "male", label: "Мужская" },
            ]}
            value={gender}
            onChange={(value) => changeGender(value as "female" | "male")}
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "12px",
              width: "100%",
              marginBottom: "30px",
            }}
          >
            {variants.map((variant, index) => {
              const active = activeVariant === index;

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveVariant(index)}
                  style={{
                    appearance: "none",
                    WebkitAppearance: "none",
                    width: "100%",
                    minWidth: 0,
                    minHeight: "94px",
                    boxSizing: "border-box",
                    display: "block",
                    padding: "16px",
                    border: active ? "2px solid #d46925" : "1px solid #ddd8ce",
                    borderRadius: "14px",
                    background: active ? "#fff0e4" : "#faf9f6",
                    color: "#24231f",
                    textAlign: "left",
                    fontFamily: "Arial, Helvetica, sans-serif",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    boxShadow: "none",
                    margin: 0,
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "15px",
                      lineHeight: "1.2",
                      fontWeight: 700,
                      color: active ? "#d46925" : "#24231f",
                    }}
                  >
                    Вариант {index + 1}
                  </span>

                  <span
                    style={{
                      display: "block",
                      fontSize: "12px",
                      lineHeight: "1.45",
                      color: active ? "#665143" : "#77736c",
                    }}
                  >
                    {getVariantSummary(variant, gender)}
                  </span>
                </button>
              );
            })}

            {variants.length < 3 ? (
              <button
                type="button"
                onClick={addVariant}
                style={{
                  appearance: "none",
                  WebkitAppearance: "none",
                  width: "100%",
                  minWidth: 0,
                  minHeight: "94px",
                  boxSizing: "border-box",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "16px",
                  border: "1px dashed #c9c2b8",
                  borderRadius: "14px",
                  background: "#fff",
                  color: "#77736c",
                  textAlign: "center",
                  fontFamily: "Arial, Helvetica, sans-serif",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  margin: 0,
                }}
              >
                + Добавить вариант
              </button>
            ) : null}
          </div>

          <div className="variant-editor">
            <div className="variant-editor-header">
              <div>
                <h3>Вариант {activeVariant + 1}</h3>
                <p>Настройте параметры именно этого варианта</p>
              </div>

              {variants.length > 1 ? (
                <button
                  type="button"
                  className="variant-remove"
                  onClick={() => removeVariant(activeVariant)}
                >
                  Удалить вариант
                </button>
              ) : null}
            </div>

            {gender === "female" ? (
              <>
                <OptionGroup
                  title="Длина"
                  options={femaleLengths}
                  value={currentVariant.length}
                  onChange={(value) =>
                    updateVariant(activeVariant, {
                      length: value,
                      femaleForm: "ai-podbor",
                    })
                  }
                />

                <OptionGroup
                  title="Стрижка"
                  options={femaleHaircutOptions(currentVariant.length)}
                  value={currentVariant.femaleForm}
                  onChange={(value) =>
                    updateVariant(activeVariant, { femaleForm: value })
                  }
                />

                <OptionGroup
                  title="Структура волос"
                  options={structures}
                  value={currentVariant.structure}
                  onChange={(value) =>
                    updateVariant(activeVariant, { structure: value })
                  }
                />

                <OptionGroup
                  title="Чёлка"
                  options={femaleBangs}
                  value={currentVariant.femaleBang}
                  onChange={(value) =>
                    updateVariant(activeVariant, { femaleBang: value })
                  }
                />

                <OptionGroup
                  title="Пробор"
                  options={femalePartings}
                  value={currentVariant.femaleParting}
                  onChange={(value) =>
                    updateVariant(activeVariant, { femaleParting: value })
                  }
                />

                <OptionGroup
                  title="Объём"
                  options={volumes}
                  value={currentVariant.femaleVolume}
                  onChange={(value) =>
                    updateVariant(activeVariant, { femaleVolume: value })
                  }
                />

                <OptionGroup
                  title="Укладка"
                  options={stylings}
                  value={currentVariant.femaleStyling}
                  onChange={(value) =>
                    updateVariant(activeVariant, { femaleStyling: value })
                  }
                />

                <OptionGroup
                  title="Концы"
                  options={ends}
                  value={currentVariant.femaleEnds}
                  onChange={(value) =>
                    updateVariant(activeVariant, { femaleEnds: value })
                  }
                />
              </>
            ) : (
              <>
                <OptionGroup
                  title="Форма"
                  options={maleForms}
                  value={currentVariant.maleForm}
                  onChange={handleMaleFormChange}
                />

                {maleLengthVisible ? (
                  <OptionGroup
                    title="Длина"
                    options={lengths}
                    value={currentVariant.length}
                    onChange={(value) =>
                      updateVariant(activeVariant, { length: value })
                    }
                  />
                ) : null}

                <OptionGroup
                  title="Структура волос"
                  options={structures}
                  value={currentVariant.structure}
                  onChange={(value) =>
                    updateVariant(activeVariant, { structure: value })
                  }
                />

                <OptionGroup
                  title="Виски"
                  options={temples}
                  value={currentVariant.maleTemples}
                  onChange={(value) =>
                    updateVariant(activeVariant, { maleTemples: value })
                  }
                />
              </>
            )}
          </div>
        </section>

        <section className="card">
          <h2>3. Цвет</h2>

          <div className="color-mode">
            <button
              type="button"
              className={`color-mode-option ${colorMode === "shared" ? "color-mode-active" : ""}`}
              onClick={() => setColorMode("shared")}
            >
              <strong>Один цвет для всех</strong>
              <span>Одинаковое окрашивание для всех вариантов</span>
            </button>

            <button
              type="button"
              className={`color-mode-option ${colorMode === "individual" ? "color-mode-active" : ""}`}
              onClick={() => setColorMode("individual")}
            >
              <strong>Настроить отдельно</strong>
              <span>Свой цвет для каждого варианта</span>
            </button>
          </div>

          {colorMode === "shared" ? (
            <ColorSettingsBlock
              color={sharedColor}
              onChange={(changes) =>
                setSharedColor((current) => ({ ...current, ...changes }))
              }
            />
          ) : (
            <div className="individual-colors">
              {individualColors.map((color, index) => (
                <div
                  key={index}
                  className={`individual-color-card ${activeVariant === index ? "individual-color-active" : ""}`}
                >
                  <button
                    type="button"
                    className="individual-color-header"
                    onClick={() => setActiveVariant(index)}
                  >
                    <strong>Вариант {index + 1}</strong>
                    <span>{generateColorLabel(color)}</span>
                  </button>

                  <ColorSettingsBlock
                    color={color}
                    onChange={(changes) => updateIndividualColor(index, changes)}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card">
          {loading ? (
            <div className="loading">
              <div className="loading-spinner" />
              <strong>{loadingMessages[loadingStep]}</strong>
              <span>Это может занять некоторое время</span>
            </div>
          ) : (
            <button className="generate" type="button" disabled={!image || preparingImage} onClick={generate}>
              Подобрать {variants.length === 1 ? "вариант" : `${variants.length} варианта`}
            </button>
          )}

          {error ? <p className="error">{error}</p> : null}
        </section>

        {streamingImages.some(Boolean) ? (
          <section className="card results">
            <h2>Результаты</h2>
            <div className="results-grid">
              {streamingImages.map((streamSrc, index) => {
                const src = resultImages[index] || streamSrc;
                if (!src) return null;

                const isStored =
                  Boolean(resultImages[index]) &&
                  !resultImages[index].startsWith("data:");

                return (
                  <div
                    className="result"
                    key={"stream-" + index}
                  >
                    <div className="result-number">
                      Вариант {index + 1}
                      {isStored
                        ? " · готово"
                        : " · генерируется"}
                    </div>

                    <div
                      style={{
                        width: "100%",
                        aspectRatio: "2 / 3",
                        overflow: "hidden",
                        borderRadius: 12,
                        background: "#f3f1ed",
                      }}
                    >
                      <img
                        src={src}
                        alt={"Результат варианта " + (index + 1)}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          display: "block",
                        }}
                      />
                    </div>

                    {isStored ? (
                      <a
                        href={resultImages[index]}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          marginTop: 10,
                          padding: "10px 14px",
                          borderRadius: 10,
                          background: "#24231f",
                          color: "#fff",
                          textDecoration: "none",
                          fontWeight: 700,
                          fontSize: 14,
                        }}
                      >
                        Открыть изображение отдельно ↗
                      </a>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
