"use client";

import { useState } from "react";

type Option = {
  value: string;
  label: string;
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

const toneLevels = Array.from({ length: 10 }, (_, i) => ({
  value: String(i + 1),
  label: `${i + 1} тон`,
}));

/**
 * Здесь пока используются универсальные названия оттенков.
 * Когда дадим точную палитру Insight, этот массив заменяется
 * на реальные оттенки бренда для каждого уровня тона.
 */
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

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");

  const [gender, setGender] = useState<"female" | "male">("female");

  const [length, setLength] = useState("medium");
  const [structure, setStructure] = useState("straight");

  const [femaleBang, setFemaleBang] = useState("none");
  const [femaleParting, setFemaleParting] = useState("none");
  const [femaleVolume, setFemaleVolume] = useState("natural");
  const [femaleStyling, setFemaleStyling] = useState("natural");
  const [femaleEnds, setFemaleEnds] = useState("straight");

  const [maleForm, setMaleForm] = useState("classic");
  const [maleTemples, setMaleTemples] = useState("straight");

  const [colorDepth, setColorDepth] = useState("");
  const [colorShade, setColorShade] = useState("");
  const [coloring, setColoring] = useState("none");

  const [resultImages, setResultImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const availableShades = colorDepth
    ? shadesByTone[colorDepth] || []
    : [];

  function handleImage(file: File | null) {
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResultImages([]);
    setError("");
  }

  function resetForGender(nextGender: "female" | "male") {
    setGender(nextGender);

    setLength("medium");
    setStructure("straight");

    if (nextGender === "female") {
      setFemaleBang("none");
      setFemaleParting("none");
      setFemaleVolume("natural");
      setFemaleStyling("natural");
      setFemaleEnds("straight");
    } else {
      setMaleForm("classic");
      setMaleTemples("straight");
    }
  }

  async function generate() {
    if (!image) {
      setError("Сначала загрузите фотографию.");
      return;
    }

    if (!colorDepth) {
      setError("Выберите уровень тона.");
      return;
    }

    if (!colorShade) {
      setError("Выберите оттенок.");
      return;
    }

    if (!coloring) {
      setError("Выберите технику окрашивания.");
      return;
    }

    setLoading(true);
    setError("");
    setResultImages([]);

    try {
      const formData = new FormData();

      formData.append("image", image);
      formData.append("gender", gender);

      formData.append("length", length);
      formData.append("structure", structure);

      if (gender === "female") {
        formData.append("bangs", femaleBang);
        formData.append("parting", femaleParting);
        formData.append("volume", femaleVolume);
        formData.append("styling", femaleStyling);
        formData.append("ends", femaleEnds);

        formData.append("maleForm", "");
        formData.append("temples", "");
      } else {
        formData.append("maleForm", maleForm);
        formData.append("temples", maleTemples);

        formData.append("bangs", "");
        formData.append("parting", "");
        formData.append("volume", "");
        formData.append("styling", "");
        formData.append("ends", "");
      }

      formData.append("colorDepth", colorDepth);
      formData.append("colorShade", colorShade);
      formData.append("coloring", coloring);

      /**
       * Просим backend вернуть несколько вариантов.
       * Основная логика:
       * цвет сохраняется,
       * структура сохраняется,
       * варианты отличаются прежде всего длиной/формой.
       */
      formData.append("variants", "3");

      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Не удалось создать варианты прически."
        );
      }

      const images = Array.isArray(data.imageUrls)
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
              onChange={(e) =>
                handleImage(e.target.files?.[0] || null)
              }
            />
          </label>
        </section>

        <section className="card">
          <h2>2. Параметры</h2>

          <OptionGroup
            title="Пол"
            options={[
              { value: "female", label: "Женская" },
              { value: "male", label: "Мужская" },
            ]}
            value={gender}
            onChange={(value) =>
              resetForGender(value as "female" | "male")
            }
          />

          <OptionGroup
            title="Длина"
            options={lengths}
            value={length}
            onChange={setLength}
          />

          <OptionGroup
            title="Структура волос"
            options={structures}
            value={structure}
            onChange={setStructure}
          />

          {gender === "female" ? (
            <>
              <OptionGroup
                title="Чёлка"
                options={femaleBangs}
                value={femaleBang}
                onChange={setFemaleBang}
              />

              <OptionGroup
                title="Пробор"
                options={femalePartings}
                value={femaleParting}
                onChange={setFemaleParting}
              />

              <OptionGroup
                title="Объём"
                options={volumes}
                value={femaleVolume}
                onChange={setFemaleVolume}
              />

              <OptionGroup
                title="Укладка"
                options={stylings}
                value={femaleStyling}
                onChange={setFemaleStyling}
              />

              <OptionGroup
                title="Концы"
                options={ends}
                value={femaleEnds}
                onChange={setFemaleEnds}
              />
            </>
          ) : (
            <>
              <OptionGroup
                title="Форма"
                options={maleForms}
                value={maleForm}
                onChange={setMaleForm}
              />

              {(maleForm === "undercut" ||
                maleForm === "elongated") && (
                <OptionGroup
                  title="Длина"
                  options={lengths}
                  value={length}
                  onChange={setLength}
                />
              )}

              <OptionGroup
                title="Виски"
                options={temples}
                value={maleTemples}
                onChange={setMaleTemples}
              />
            </>
          )}
        </section>

        <section className="card">
          <h2>3. Цвет</h2>

          <OptionGroup
            title="Уровень тона"
            options={toneLevels}
            value={colorDepth}
            onChange={(value) => {
              setColorDepth(value);
              setColorShade("");
            }}
          />

          {colorDepth && (
            <OptionGroup
              title={`Оттенок — ${colorDepth} тон`}
              options={availableShades}
              value={colorShade}
              onChange={setColorShade}
            />
          )}

          <OptionGroup
            title="Техника окрашивания"
            options={coloringTechniques}
            value={coloring}
            onChange={setColoring}
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
              : "Подобрать прическу"}
          </button>

          {error && <p className="error">{error}</p>}
        </section>

        {resultImages.length > 0 && (
          <section className="card results">
            <h2>Варианты</h2>

            <p className="results-description">
              Несколько вариантов на основе выбранных параметров.
            </p>

            <div className="results-grid">
              {resultImages.map((src, index) => (
                <div className="result" key={`${src}-${index}`}>
                  <div className="result-number">
                    Вариант {index + 1}
                  </div>

                  <img
                    src={src}
                    alt={`Вариант прически ${index + 1}`}
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
