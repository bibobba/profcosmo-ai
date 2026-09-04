"use client";

import { useState } from "react";

const options = {
  gender: [
    ["male", "Мужской"],
    ["female", "Женский"],
  ],

  length: [
    ["very-short", "Очень короткая"],
    ["short", "Короткая"],
    ["medium", "Средняя"],
    ["below-shoulders", "Ниже плеч"],
    ["long", "Длинная"],
  ],

  structure: [
    ["straight", "Прямые"],
    ["wavy", "Волнистые"],
    ["curly", "Кудрявые"],
    ["very-curly", "Очень кудрявые"],
  ],

  bangs: [
    ["none", "Без челки"],
    ["straight", "Прямая"],
    ["side", "Косая"],
    ["long", "Удлиненная"],
    ["curtain", "Curtain bangs"],
    ["short", "Короткая"],
  ],

  parting: [
    ["none", "Без выраженного"],
    ["center", "По центру"],
    ["left", "Слева"],
    ["right", "Справа"],
    ["side", "Боковой"],
  ],

  volume: [
    ["low", "Минимальный"],
    ["natural", "Естественный"],
    ["medium", "Средний"],
    ["high", "Максимальный"],
  ],

  styling: [
    ["natural", "Естественная"],
    ["smooth", "Гладкая"],
    ["textured", "Текстурированная"],
    ["voluminous", "Объемная"],
    ["messy", "Небрежная"],
    ["wet", "Wet look"],
  ],

  colorDepth: [
    ["1", "1"],
    ["2", "2"],
    ["3", "3"],
    ["4", "4"],
    ["5", "5"],
    ["6", "6"],
    ["7", "7"],
    ["8", "8"],
    ["9", "9"],
    ["10", "10"],
  ],

  colorTone: [
    ["natural", "Натуральный"],
    ["ash", "Пепельный"],
    ["beige", "Бежевый"],
    ["gold", "Золотистый"],
    ["copper", "Медный"],
    ["red", "Красный"],
    ["violet", "Фиолетовый"],
    ["pearl", "Перламутровый"],
  ],

  colorIntensity: [
    ["pastel", "Пастельная"],
    ["soft", "Мягкая"],
    ["medium", "Средняя"],
    ["rich", "Насыщенная"],
  ],

  coloring: [
    ["solid", "Однотонное"],
    ["highlighting", "Мелирование"],
    ["balayage", "Балаяж"],
    ["shatush", "Шатуш"],
    ["airtouch", "AirTouch"],
    ["ombre", "Омбре"],
    ["toning", "Тонирование"],
  ],

  roots: [
    ["same", "В тон длины"],
    ["natural", "Натуральные"],
    ["dark", "Затемненные"],
    ["stretch", "Растяжка"],
  ],
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState("");

  const [gender, setGender] = useState("male");

  const [length, setLength] = useState("medium");
  const [structure, setStructure] = useState("straight");
  const [bangs, setBangs] = useState("none");
  const [parting, setParting] = useState("none");
  const [volume, setVolume] = useState("natural");
  const [styling, setStyling] = useState("natural");

  const [colorDepth, setColorDepth] = useState("5");
  const [colorTone, setColorTone] = useState("natural");
  const [colorIntensity, setColorIntensity] = useState("medium");
  const [coloring, setColoring] = useState("solid");
  const [roots, setRoots] = useState("same");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleFile(selected: File) {
    if (!selected.type.startsWith("image/")) {
      setError("Загрузите изображение");
      return;
    }

    if (selected.size > 8 * 1024 * 1024) {
      setError("Максимальный размер — 8 МБ");
      return;
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setResult("");
    setError("");
  }

  async function generate() {
    if (!file) {
      setError("Сначала загрузите фотографию");
      return;
    }

    setLoading(true);
    setError("");
    setResult("");

    try {
      const formData = new FormData();

      formData.append("image", file);
      formData.append("gender", gender);

      formData.append("length", length);
      formData.append("structure", structure);
      formData.append("bangs", bangs);
      formData.append("parting", parting);
      formData.append("volume", volume);
      formData.append("styling", styling);

      formData.append("colorDepth", colorDepth);
      formData.append("colorTone", colorTone);
      formData.append("colorIntensity", colorIntensity);
      formData.append("coloring", coloring);
      formData.append("roots", roots);

      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ошибка генерации");
      }

      setResult(data.imageUrl);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Ошибка генерации"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <header>
        <b>ПРОФКОСМО AI</b>
        <span>AI-подбор прически</span>
      </header>

      <section className="hero">
        <div className="eyebrow">ВИРТУАЛЬНАЯ ПРИМЕРКА</div>

        <h1>
          Подберите прическу
          <br />
          <em>с помощью ИИ</em>
        </h1>

        <p>
          Загрузите фотографию — выберите параметры —
          получите реалистичную визуализацию.
        </p>
      </section>

      <section className="grid">
        <div className="card">
          <h2>01 — Фотография</h2>

          <label
            className="upload"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();

              const dropped = e.dataTransfer.files[0];

              if (dropped) {
                handleFile(dropped);
              }
            }}
          >
            {preview ? (
              <img src={preview} alt="Фото клиента" />
            ) : (
              <>
                <div className="plus">+</div>
                <strong>Загрузите фотографию</strong>
                <small>JPG, PNG или WEBP · до 8 МБ</small>
              </>
            )}

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const selected = e.target.files?.[0];

                if (selected) {
                  handleFile(selected);
                }
              }}
            />
          </label>
        </div>

        <div className="card">
          <h2>02 — Параметры</h2>

          <Group
            title="Пол"
            options={options.gender}
            value={gender}
            setValue={setGender}
          />

          <Group
            title="Длина"
            options={options.length}
            value={length}
            setValue={setLength}
          />

          <Group
            title="Структура волос"
            options={options.structure}
            value={structure}
            setValue={setStructure}
          />

          <Group
            title="Челка"
            options={options.bangs}
            value={bangs}
            setValue={setBangs}
          />

          <Group
            title="Пробор"
            options={options.parting}
            value={parting}
            setValue={setParting}
          />

          <Group
            title="Объем"
            options={options.volume}
            value={volume}
            setValue={setVolume}
          />

          <Group
            title="Укладка"
            options={options.styling}
            value={styling}
            setValue={setStyling}
          />

          <div className="parameter-section">
            <h3>Цвет волос</h3>

            <Group
              title="Глубина тона (УГТ)"
              options={options.colorDepth}
              value={colorDepth}
              setValue={setColorDepth}
            />

            <Group
              title="Направление цвета"
              options={options.colorTone}
              value={colorTone}
              setValue={setColorTone}
            />

            <Group
              title="Насыщенность"
              options={options.colorIntensity}
              value={colorIntensity}
              setValue={setColorIntensity}
            />

            <Group
              title="Техника окрашивания"
              options={options.coloring}
              value={coloring}
              setValue={setColoring}
            />

            <Group
              title="Корни"
              options={options.roots}
              value={roots}
              setValue={setRoots}
            />
          </div>

          <button
            className="generate"
            disabled={!file || loading}
            onClick={generate}
          >
            {loading
              ? "Создаём визуализацию..."
              : "Создать визуализацию →"}
          </button>

          {error && <div className="error">{error}</div>}
        </div>
      </section>

      {(loading || result) && (
        <section className="result">
          <h2>03 — Результат</h2>

          {loading ? (
            <div className="loading">
              <div className="spinner" />

              <h3>Создаём вашу визуализацию</h3>

              <p>AI подбирает новую прическу...</p>
            </div>
          ) : (
            <>
              <img
                className="result-image"
                src={result}
                alt="Новая прическа"
              />

              <div className="result-actions">
                <button onClick={() => setResult("")}>
                  ← Попробовать другой вариант
                </button>

                <a
                  href={result}
                  target="_blank"
                  rel="noreferrer"
                >
                  Скачать результат
                </a>
              </div>
            </>
          )}
        </section>
      )}

      <footer>
        ПРОФКОСМО AI · Демонстрационная версия
      </footer>
    </main>
  );
}

function Group({
  title,
  options,
  value,
  setValue,
}: {
  title: string;
  options: string[][];
  value: string;
  setValue: (value: string) => void;
}) {
  return (
    <div className="group">
      <label>{title}</label>

      <div className="options">
        {options.map(([key, label]) => (
          <button
            key={key}
            className={value === key ? "active" : ""}
            onClick={() => setValue(key)}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
