"use client";

import { useState } from "react";

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
  { value: "ai", label: "AI-подбор" },
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
  (_, i) => ({
    value: String(i + 1),
    label: `${i + 1} тон`,
  })
);

const blondToneLevels: Option[] = allToneLevels.filter(
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
    { value: "gold", label: "Золотистый" },
  ],
  "5": [
    { value: "natural", label: "Натуральный" },
    { value: "ash", label: "Пепельный" },
    { value: "beige", label: "Бежевый" },
    { value: "gold", label: "Золотистый" },
    { value: "copper", label: "Медный" },
  ],
  "6": [
    { value: "natural", label: "Натуральный" },
    { value: "ash", label: "Пепельный" },
    { value: "beige", label: "Бежевый" },
    { value: "gold", label: "Золотистый" },
    { value: "copper", label: "Медный" },
    { value: "red", label: "Красный" },
  ],
  "7": [
    { value: "natural", label: "Натуральный" },
    { value: "ash", label: "Пепельный" },
    { value: "beige", label: "Бежевый" },
    { value: "gold", label: "Золотистый" },
    { value: "copper", label: "Медный" },
  ],
  "8": [
    { value: "natural", label: "Натуральный" },
    { value: "ash", label: "Пепельный" },
    { value: "beige", label: "Бежевый" },
    { value: "gold", label: "Золотистый" },
    { value: "pearl", label: "Перламутровый" },
  ],
  "9": [
    { value: "natural", label: "Натуральный" },
    { value: "ash", label: "Пепельный" },
    { value: "beige", label: "Бежевый" },
    { value: "gold", label: "Золотистый" },
    { value: "pearl", label: "Перламутровый" },
  ],
  "10": [
    { value: "natural", label: "Натуральный" },
    { value: "ash", label: "Пепельный" },
    { value: "beige", label: "Бежевый" },
    { value: "pearl", label: "Перламутровый" },
  ],
};

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
              value === option.value ? "option-active" : ""
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

function createDefaultVariant(): Variant {
  return {
    length: "medium",
    structure: "straight",
    femaleForm: "ai",
    femaleBang: "none",
    femaleParting: "center",
    femaleVolume: "natural",
    femaleStyling: "natural",
    femaleEnds: "straight",
    maleForm: "classic",
    maleTemples: "straight",
  };
}

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");

  const [gender, setGender] =
    useState<"female" | "male">("female");

  const [variants, setVariants] = useState<Variant[]>([
    createDefaultVariant(),
    createDefaultVariant(),
    createDefaultVariant(),
  ]);

  const [colorDepth, setColorDepth] = useState("");
  const [colorShade, setColorShade] = useState("");
  const [coloring, setColoring] = useState("none");

  const [activeVariant, setActiveVariant] = useState(0);

  const [resultImages, setResultImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentVariant = variants[activeVariant];

  const maleLengthVisible =
    currentVariant.maleForm === "undercut" ||
    currentVariant.maleForm === "elongated";

  const toneOptions =
    coloring === "blond" ? blondToneLevels : allToneLevels;

  const availableShades = colorDepth
    ? shadesByTone[colorDepth] || []
    : [];

  function updateVariant(
    index: number,
    changes: Partial<Variant>
  ) {
    setVariants((current) =>
      current.map((variant, i) =>
        i === index
          ? { ...variant, ...changes }
          : variant
      )
    );
  }

  function handleImage(file: File | null) {
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResultImages([]);
    setError("");
  }

  function resetForGender(
    nextGender: "female" | "male"
  ) {
    setGender(nextGender);

    setVariants(
      Array.from({ length: 3 }, () =>
        createDefaultVariant()
      ).map((variant) =>
        nextGender === "male"
          ? {
              ...variant,
              length: "short",
              structure: "straight",
              maleForm: "classic",
              maleTemples: "straight",
            }
          : variant
      )
    );

    setActiveVariant(0);
    setResultImages([]);
    setError("");
  }

  function handleMaleFormChange(value: string) {
    const changes: Partial<Variant> = {
      maleForm: value,
    };

    if (
      value !== "undercut" &&
      value !== "elongated"
    ) {
      changes.length = "short";
    }

    updateVariant(activeVariant, changes);
  }

  function handleColoringChange(value: string) {
    setColoring(value);

    if (value === "none") {
      setColorDepth("");
      setColorShade("");
      return;
    }

    if (value === "blond") {
      if (
        !colorDepth ||
        Number(colorDepth) < 7
      ) {
        setColorDepth("7");
        setColorShade("");
      }
    }
  }

  function handleToneChange(value: string) {
    setColorDepth(value);
    setColorShade("");
  }

  async function generate() {
    if (!image) {
      setError("Сначала загрузите фотографию.");
      return;
    }

    if (coloring !== "none") {
      if (!colorDepth) {
        setError("Выберите уровень тона.");
        return;
      }

      if (!colorShade) {
        setError("Выберите оттенок.");
        return;
      }
    }

    setLoading(true);
    setError("");
    setResultImages([]);

    try {
      const formData = new FormData();

      formData.append("image", image);
      formData.append("gender", gender);

      // Новый интерфейс уже хранит 3 самостоятельных
      // набора параметров.
      formData.append(
        "variants",
        JSON.stringify(variants)
      );

      // Цвет общий для всех трёх вариантов.
      formData.append("colorDepth", colorDepth);
      formData.append("colorShade", colorShade);
      formData.append("coloring", coloring);

      const response = await fetch(
        "/api/generate",
        {
          method: "POST",
          body: formData,
        }
      );

      let data: any = null;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          `Сервер вернул некорректный ответ. Код: ${response.status}`
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            `Не удалось создать варианты прически. Код: ${response.status}`
        );
      }

      const images =
        Array.isArray(data.imageUrls)
          ? data.imageUrls
          : data.imageUrl
          ? [data.imageUrl]
          : [];

      if (!images.length) {
        throw new Error("AI не вернул изображения.");
      }

      setResultImages(images);
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
    <main className="page">
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
              onChange={(e) =>
                handleImage(
                  e.target.files?.[0] || null
                )
              }
            />
          </label>
        </section>

        <section className="card">
          <h2>2. Параметры прически</h2>

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
              resetForGender(
                value as "female" | "male"
              )
            }
          />

          <div className="variant-tabs">
            {[0, 1, 2].map((index) => (
              <button
                key={index}
                type="button"
                className={`variant-tab ${
                  activeVariant === index
                    ? "variant-tab-active"
                    : ""
                }`}
                onClick={() =>
                  setActiveVariant(index)
                }
              >
                Вариант {index + 1}
              </button>
            ))}
          </div>

          {gender === "female" ? (
            <OptionGroup
              title="Длина"
              options={lengths}
              value={currentVariant.length}
              onChange={(value) =>
                updateVariant(
                  activeVariant,
                  { length: value }
                )
              }
            />
          ) : null}

          <OptionGroup
            title="Структура волос"
            options={structures}
            value={currentVariant.structure}
            onChange={(value) =>
              updateVariant(
                activeVariant,
                { structure: value }
              )
            }
          />

          {gender === "female" ? (
            <>
              <OptionGroup
                title="Форма стрижки"
                options={femaleForms}
                value={currentVariant.femaleForm}
                onChange={(value) =>
                  updateVariant(
                    activeVariant,
                    { femaleForm: value }
                  )
                }
              />

              <OptionGroup
                title="Чёлка"
                options={femaleBangs}
                value={currentVariant.femaleBang}
                onChange={(value) =>
                  updateVariant(
                    activeVariant,
                    { femaleBang: value }
                  )
                }
              />

              <OptionGroup
                title="Пробор"
                options={femalePartings}
                value={currentVariant.femaleParting}
                onChange={(value) =>
                  updateVariant(
                    activeVariant,
                    { femaleParting: value }
                  )
                }
              />

              <OptionGroup
                title="Объём"
                options={volumes}
                value={currentVariant.femaleVolume}
                onChange={(value) =>
                  updateVariant(
                    activeVariant,
                    { femaleVolume: value }
                  )
                }
              />

              <OptionGroup
                title="Укладка"
                options={stylings}
                value={currentVariant.femaleStyling}
                onChange={(value) =>
                  updateVariant(
                    activeVariant,
                    { femaleStyling: value }
                  )
                }
              />

              <OptionGroup
                title="Концы"
                options={ends}
                value={currentVariant.femaleEnds}
                onChange={(value) =>
                  updateVariant(
                    activeVariant,
                    { femaleEnds: value }
                  )
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
                    updateVariant(
                      activeVariant,
                      { length: value }
                    )
                  }
                />
              ) : null}

              <OptionGroup
                title="Виски"
                options={temples}
                value={currentVariant.maleTemples}
                onChange={(value) =>
                  updateVariant(
                    activeVariant,
                    { maleTemples: value }
                  )
                }
              />
            </>
          )}
        </section>

        <section className="card">
          <h2>3. Цвет — общий для всех вариантов</h2>

          <OptionGroup
            title="Уровень тона"
            options={toneOptions}
            value={colorDepth}
            onChange={handleToneChange}
          />

          {colorDepth ? (
            <OptionGroup
              title={`Оттенок — ${colorDepth} тон`}
              options={availableShades}
              value={colorShade}
              onChange={setColorShade}
            />
          ) : null}

          <OptionGroup
            title="Техника окрашивания"
            options={coloringTechniques}
            value={coloring}
            onChange={handleColoringChange}
          />
        </section>

        <section className="card">
          <button
            className="generate"
            type="button"
            disabled={loading}
            onClick={generate}
          >
            {loading
              ? "Создаём варианты..."
              : "Подобрать 3 варианта"}
          </button>

          {error ? (
            <p className="error">{error}</p>
          ) : null}
        </section>

        {resultImages.length > 0 ? (
          <section className="card results">
            <h2>Результаты</h2>

            <p className="results-description">
              Три варианта на основе выбранных параметров.
            </p>

            <div className="results-grid">
              {resultImages.map(
                (src, index) => (
                  <div
                    className="result"
                    key={`${src}-${index}`}
                  >
                    <div className="result-number">
                      Вариант {index + 1}
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
