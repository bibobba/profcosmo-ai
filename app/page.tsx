"use client";

import { useEffect, useState } from "react";

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

const femaleForms: Option[] = [
  { value: "ai-podbor", label: "AI-подбор" },
  { value: "straight-cut", label: "Прямой срез" },
  { value: "graduated", label: "Градуированная" },
  { value: "layers", label: "Слои" },
  { value: "cascade", label: "Каскадная" },
  { value: "asymmetrical", label: "Асимметричная" },
];

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
            className={`option ${
              value === option.value
                ? "option-active"
                : ""
            }`}
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
    structures.find(
      (item) => item.value === variant.structure
    )?.label || "";

  if (gender === "female") {
    const length =
      lengths.find(
        (item) => item.value === variant.length
      )?.label || "";

    const form =
      femaleForms.find(
        (item) => item.value === variant.femaleForm
      )?.label || "";

    return `${length} · ${structure} · ${form}`;
  }

  const form =
    maleForms.find(
      (item) => item.value === variant.maleForm
    )?.label || "";

  return `${form} · ${structure}`;
}

function ColorSettingsBlock({
  color,
  onChange,
}: {
  color: ColorSettings;
  onChange: (changes: Partial<ColorSettings>) => void;
}) {
  const toneOptions =
    color.coloring === "blond"
      ? blondToneLevels
      : allToneLevels;

  const availableShades =
    color.colorDepth
      ? shadesByTone[color.colorDepth] || []
      : [];

  function changeColoring(value: string) {
    if (value === "none") {
      onChange({
        coloring: value,
        colorDepth: "5",
        colorShade: "natural",
      });
      return;
    }

    if (
      value === "blond" &&
      Number(color.colorDepth) < 7
    ) {
      onChange({
        coloring: value,
        colorDepth: "7",
        colorShade: "",
      });
      return;
    }

    onChange({
      coloring: value,
      colorShade: "",
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
          <OptionGroup
            title="Уровень тона"
            options={toneOptions}
            value={color.colorDepth}
            onChange={(value) =>
              onChange({
                colorDepth: value,
                colorShade: "",
              })
            }
          />

          {color.colorDepth ? (
            <OptionGroup
              title="Оттенок"
              options={availableShades}
              value={color.colorShade}
              onChange={(value) =>
                onChange({
                  colorShade: value,
                })
              }
            />
          ) : null}
        </>
      ) : null}
    </>
  );
}

export default function Home() {
  const [image, setImage] =
    useState<File | null>(null);

  const [preview, setPreview] =
    useState("");

  const [gender, setGender] =
    useState<"female" | "male">("female");

  const [variants, setVariants] =
    useState<Variant[]>([
      createDefaultVariant(),
    ]);

  const [activeVariant, setActiveVariant] =
    useState(0);

  const [colorMode, setColorMode] =
    useState<"shared" | "individual">(
      "shared"
    );

  const [sharedColor, setSharedColor] =
    useState<ColorSettings>(
      createDefaultColor()
    );

  const [individualColors, setIndividualColors] =
    useState<ColorSettings[]>([
      createDefaultColor(),
    ]);

  const [resultImages, setResultImages] =
    useState<string[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [loadingStep, setLoadingStep] =
    useState(0);

  const [error, setError] =
    useState("");

  const loadingMessages = [
    "Подготавливаем фотографию…",
    "Анализируем параметры…",
    `Создаём ${variants.length} ${
      variants.length === 1
        ? "вариант"
        : variants.length < 5
        ? "варианта"
        : "вариантов"
    } прически…`,
    "Сохраняем результаты…",
  ];

  const currentVariant =
    variants[activeVariant];

  const maleLengthVisible =
    gender === "male" &&
    (currentVariant.maleForm ===
      "undercut" ||
      currentVariant.maleForm ===
        "elongated");

  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(() => {
      setLoadingStep(
        (current) =>
          (current + 1) %
          loadingMessages.length
      );
    }, 2200);

    return () => clearInterval(interval);
  }, [loading, loadingMessages.length]);

  useEffect(() => {
    if (
      individualColors.length ===
      variants.length
    ) {
      return;
    }

    setIndividualColors((current) => {
      const next = [...current];

      while (
        next.length < variants.length
      ) {
        next.push(createDefaultColor());
      }

      return next.slice(
        0,
        variants.length
      );
    });
  }, [variants.length, individualColors.length]);

  function handleImage(file: File | null) {
    if (!file) return;

    setImage(file);
    setPreview(
      URL.createObjectURL(file)
    );
    setResultImages([]);
    setError("");
  }

  function updateVariant(
    index: number,
    changes: Partial<Variant>
  ) {
    setVariants((current) =>
      current.map(
        (variant, variantIndex) =>
          variantIndex === index
            ? {
                ...variant,
                ...changes,
              }
            : variant
      )
    );
  }

  function updateIndividualColor(
    index: number,
    changes: Partial<ColorSettings>
  ) {
    setIndividualColors((current) =>
      current.map(
        (color, colorIndex) =>
          colorIndex === index
            ? {
                ...color,
                ...changes,
              }
            : color
      )
    );
  }

  function addVariant() {
    if (variants.length >= 3) {
      return;
    }

    setVariants((current) => [
      ...current,
      createDefaultVariant(),
    ]);

    setIndividualColors(
      (current) => [
        ...current,
        createDefaultColor(),
      ]
    );

    setActiveVariant(
      variants.length
    );

    setError("");
  }

  function removeVariant(
    index: number
  ) {
    if (variants.length <= 1) {
      return;
    }

    setVariants((current) =>
      current.filter(
        (_, variantIndex) =>
          variantIndex !== index
      )
    );

    setIndividualColors((current) =>
      current.filter(
        (_, colorIndex) =>
          colorIndex !== index
      )
    );

    setActiveVariant((current) => {
      if (current > index) {
        return current - 1;
      }

      if (
        current === index &&
        current >= variants.length - 1
      ) {
        return Math.max(
          0,
          current - 1
        );
      }

      return current;
    });

    setError("");
  }

  function changeGender(
    nextGender: "female" | "male"
  ) {
    setGender(nextGender);
    setVariants([
      createDefaultVariant(),
    ]);
    setIndividualColors([
      createDefaultColor(),
    ]);
    setActiveVariant(0);
    setResultImages([]);
    setError("");
  }

  function handleMaleFormChange(
    value: string
  ) {
    const changes: Partial<Variant> = {
      maleForm: value,
    };

    if (
      value !== "undercut" &&
      value !== "elongated"
    ) {
      changes.length = "short";
    }

    updateVariant(
      activeVariant,
      changes
    );
  }

  function generateColorLabel(
    color: ColorSettings
  ) {
    if (color.coloring === "none") {
      return "Без окрашивания";
    }

    const technique =
      coloringTechniques.find(
        (item) =>
          item.value ===
          color.coloring
      )?.label || "";

    const shade =
      shadesByTone[
        color.colorDepth
      ]?.find(
        (item) =>
          item.value ===
          color.colorShade
      )?.label || "";

    return `${technique} · ${color.colorDepth} тон · ${shade}`;
  }

  async function generate() {
    if (!image) {
      setError(
        "Сначала загрузите фотографию."
      );
      return;
    }

    const colors =
      colorMode === "shared"
        ? variants.map(
            () => sharedColor
          )
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
        !color.colorShade
      ) {
        setError(
          "Для окрашивания выберите оттенок."
        );
        return;
      }
    }

    setLoading(true);
    setLoadingStep(0);
    setError("");
    setResultImages([]);

    try {
      const formData =
        new FormData();

      formData.append(
        "image",
        image
      );

      formData.append(
        "gender",
        gender
      );

      formData.append(
        "variants",
        JSON.stringify(
          variants
        )
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
        "individualColors",
        JSON.stringify(
          individualColors
        )
      );

      const response =
        await fetch(
          "/api/generate",
          {
            method: "POST",
            body: formData,
          }
        );

      let data: {
        success?: boolean;
        results?: string[];
        count?: number;
        error?: string;
      };

      try {
        data =
          await response.json();
      } catch {
        throw new Error(
          `Сервер вернул некорректный ответ. Код: ${response.status}`
        );
      }

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.error ||
            `Не удалось создать варианты прически. Код: ${response.status}`
        );
      }

      if (
        !Array.isArray(
          data.results
        ) ||
        data.results.length === 0
      ) {
        throw new Error(
          "AI не вернул изображения."
        );
      }

      setResultImages(
        data.results
      );
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
            <h1>
              ПРОФКОСМО AI
            </h1>

            <p>
              ИИ-подбор прически
            </p>
          </div>
        </header>

        <section className="card">
          <h2>
            1. Фотография
          </h2>

          <label className="upload">
            {preview ? (
              <img
                src={preview}
                alt="Загруженная фотография"
              />
            ) : (
              <div>
                <strong>
                  Загрузить фотографию
                </strong>

                <span>
                  Лучше использовать фото анфас
                </span>
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={(event) =>
                handleImage(
                  event.target.files?.[0] ||
                    null
                )
              }
            />
          </label>
        </section>

        <section className="card">
          <h2>
            2. Параметры прически
          </h2>

          <OptionGroup
            title="Пол"
            options={[
              {
                value: "female",
                label: "Женская",
              },
              {
                value: "male",
                label: "Мужская",
              },
            ]}
            value={gender}
            onChange={(value) =>
              changeGender(
                value as
                  | "female"
                  | "male"
              )
            }
          />

          <div className="variant-selector">
            {variants.map(
              (
                variant,
                index
              ) => (
                <button
                  key={index}
                  type="button"
                  className={`variant-card ${
                    activeVariant ===
                    index
                      ? "variant-card-active"
                      : ""
                  }`}
                  onClick={() =>
                    setActiveVariant(
                      index
                    )
                  }
                >
                  <span className="variant-card-title">
                    Вариант {index + 1}
                  </span>

                  <span className="variant-card-summary">
                    {getVariantSummary(
                      variant,
                      gender
                    )}
                  </span>
                </button>
              )
            )}

            {variants.length < 3 ? (
              <button
                type="button"
                className="variant-add"
                onClick={
                  addVariant
                }
              >
                + Добавить вариант
              </button>
            ) : null}
          </div>

          <div className="variant-editor">
            <div className="variant-editor-header">
              <div>
                <h3>
                  Вариант{" "}
                  {activeVariant + 1}
                </h3>

                <p>
                  Настройте параметры именно
                  этого варианта
                </p>
              </div>

              {variants.length >
              1 ? (
                <button
                  type="button"
                  className="variant-remove"
                  onClick={() =>
                    removeVariant(
                      activeVariant
                    )
                  }
                >
                  Удалить вариант
                </button>
              ) : null}
            </div>

            {gender === "female" ? (
              <>
                <OptionGroup
                  title="Длина"
                  options={lengths}
                  value={
                    currentVariant.length
                  }
                  onChange={(value) =>
                    updateVariant(
                      activeVariant,
                      {
                        length:
                          value,
                      }
                    )
                  }
                />

                <OptionGroup
                  title="Структура волос"
                  options={
                    structures
                  }
                  value={
                    currentVariant.structure
                  }
                  onChange={(value) =>
                    updateVariant(
                      activeVariant,
                      {
                        structure:
                          value,
                      }
                    )
                  }
                />

                <OptionGroup
                  title="Форма стрижки"
                  options={
                    femaleForms
                  }
                  value={
                    currentVariant.femaleForm
                  }
                  onChange={(value) =>
                    updateVariant(
                      activeVariant,
                      {
                        femaleForm:
                          value,
                      }
                    )
                  }
                />

                <OptionGroup
                  title="Чёлка"
                  options={
                    femaleBangs
                  }
                  value={
                    currentVariant.femaleBang
                  }
                  onChange={(value) =>
                    updateVariant(
                      activeVariant,
                      {
                        femaleBang:
                          value,
                      }
                    )
                  }
                />

                <OptionGroup
                  title="Пробор"
                  options={
                    femalePartings
                  }
                  value={
                    currentVariant.femaleParting
                  }
                  onChange={(value) =>
                    updateVariant(
                      activeVariant,
                      {
                        femaleParting:
                          value,
                      }
                    )
                  }
                />

                <OptionGroup
                  title="Объём"
                  options={volumes}
                  value={
                    currentVariant.femaleVolume
                  }
                  onChange={(value) =>
                    updateVariant(
                      activeVariant,
                      {
                        femaleVolume:
                          value,
                      }
                    )
                  }
                />

                <OptionGroup
                  title="Укладка"
                  options={
                    stylings
                  }
                  value={
                    currentVariant.femaleStyling
                  }
                  onChange={(value) =>
                    updateVariant(
                      activeVariant,
                      {
                        femaleStyling:
                          value,
                      }
                    )
                  }
                />

                <OptionGroup
                  title="Концы"
                  options={ends}
                  value={
                    currentVariant.femaleEnds
                  }
                  onChange={(value) =>
                    updateVariant(
                      activeVariant,
                      {
                        femaleEnds:
                          value,
                      }
                    )
                  }
                />
              </>
            ) : (
              <>
                <OptionGroup
                  title="Форма"
                  options={
                    maleForms
                  }
                  value={
                    currentVariant.maleForm
                  }
                  onChange={
                    handleMaleFormChange
                  }
                />

                {maleLengthVisible ? (
                  <OptionGroup
                    title="Длина"
                    options={
                      lengths
                    }
                    value={
                      currentVariant.length
                    }
                    onChange={(
                      value
                    ) =>
                      updateVariant(
                        activeVariant,
                        {
                          length:
                            value,
                        }
                      )
                    }
                  />
                ) : null}

                <OptionGroup
                  title="Структура волос"
                  options={
                    structures
                  }
                  value={
                    currentVariant.structure
                  }
                  onChange={(value) =>
                    updateVariant(
                      activeVariant,
                      {
                        structure:
                          value,
                      }
                    )
                  }
                />

                <OptionGroup
                  title="Виски"
                  options={
                    temples
                  }
                  value={
                    currentVariant.maleTemples
                  }
                  onChange={(value) =>
                    updateVariant(
                      activeVariant,
                      {
                        maleTemples:
                          value,
                      }
                    )
                  }
                />
              </>
            )}
          </div>
        </section>

        <section className="card">
          <h2>
            3. Цвет
          </h2>

          <div className="color-mode">
            <button
              type="button"
              className={`color-mode-option ${
                colorMode ===
                "shared"
                  ? "color-mode-active"
                  : ""
              }`}
              onClick={() =>
                setColorMode(
                  "shared"
                )
              }
            >
              <strong>
                Один цвет для всех
              </strong>

              <span>
                Одинаковое окрашивание
                для всех вариантов
              </span>
            </button>

            <button
              type="button"
              className={`color-mode-option ${
                colorMode ===
                "individual"
                  ? "color-mode-active"
                  : ""
              }`}
              onClick={() =>
                setColorMode(
                  "individual"
                )
              }
            >
              <strong>
                Настроить отдельно
              </strong>

              <span>
                Свой цвет для каждого
                варианта
              </span>
            </button>
          </div>

          {colorMode ===
          "shared" ? (
            <>
              <ColorSettingsBlock
                color={
                  sharedColor
                }
                onChange={(
                  changes
                ) =>
                  setSharedColor(
                    (
                      current
                    ) => ({
                      ...current,
                      ...changes,
                    })
                  )
                }
              />
            </>
          ) : (
            <div className="individual-colors">
              {individualColors.map(
                (
                  color,
                  index
                ) => (
                  <div
                    key={index}
                    className={`individual-color-card ${
                      activeVariant ===
                      index
                        ? "individual-color-active"
                        : ""
                    }`}
                  >
                    <button
                      type="button"
                      className="individual-color-header"
                      onClick={() =>
                        setActiveVariant(
                          index
                        )
                      }
                    >
                      <strong>
                        Вариант{" "}
                        {index + 1}
                      </strong>

                      <span>
                        {generateColorLabel(
                          color
                        )}
                      </span>
                    </button>

                    <ColorSettingsBlock
                      color={color}
                      onChange={(
                        changes
                      ) =>
                        updateIndividualColor(
                          index,
                          changes
                        )
                      }
                    />
                  </div>
                )
              )}
            </div>
          )}
        </section>

        <section className="card">
          {loading ? (
            <div className="loading">
              <div className="loading-spinner" />

              <strong>
                {loadingMessages[
                  loadingStep
                ]}
              </strong>

              <span>
                Это может занять некоторое
                время
              </span>
            </div>
          ) : (
            <button
              className="generate"
              type="button"
              disabled={
                !image
              }
              onClick={
                generate
              }
            >
              Подобрать{" "}
              {variants.length ===
              1
                ? "вариант"
                : `${variants.length} варианта`}
            </button>
          )}

          {error ? (
            <p className="error">
              {error}
            </p>
          ) : null}
        </section>

        {resultImages.length >
        0 ? (
          <section className="card results">
            <h2>
              Результаты
            </h2>

            <p className="results-description">
              Каждый вариант создан
              отдельно по выбранным
              параметрам.
            </p>

            <div className="results-grid">
              {resultImages.map(
                (
                  src,
                  index
                ) => (
                  <div
                    className="result"
                    key={`${src}-${index}`}
                  >
                    <div className="result-number">
                      Вариант{" "}
                      {index + 1}
                    </div>

                    <img
                      src={src}
                      alt={`Вариант прически ${
                        index + 1
                      }`}
                    />
                  </div>
                )
              )}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
