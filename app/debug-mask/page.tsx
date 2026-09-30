"use client";

import { useState } from "react";

export default function DebugMaskPage() {
  const [file, setFile] = useState<File | null>(null);
  const [gender, setGender] = useState("male");
  const [length, setLength] = useState("short");
  const [structure, setStructure] = useState("afro-curls");
  const [mask, setMask] = useState("");
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function run() {
    if (!file) {
      setError("Сначала выбери фотографию.");
      return;
    }

    setLoading(true);
    setError("");
    setMask("");
    setPreview("");

    const formData = new FormData();
    formData.append("image", file);
    formData.append("gender", gender);
    formData.append("length", length);
    formData.append("structure", structure);

    try {
      const response = await fetch("/api/debug-mask", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Ошибка диагностики.");
      }

      setMask(data.mask);
      setPreview(data.preview);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка диагностики.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 32,
        background: "#f5f5f5",
        color: "#111",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ marginBottom: 8 }}>PROFCOSMO AI — проверка маски</h1>
        <p style={{ marginTop: 0, color: "#555" }}>
          Диагностический экран. Рабочую генерацию не меняет.
        </p>

        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
          }}
        >
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />

          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginTop: 16,
            }}
          >
            <label>
              Пол{" "}
              <select value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="male">Мужской</option>
                <option value="female">Женский</option>
              </select>
            </label>

            <label>
              Длина{" "}
              <select value={length} onChange={(e) => setLength(e.target.value)}>
                <option value="very-short">Очень короткие</option>
                <option value="short">Короткие</option>
                <option value="medium">Средние</option>
                <option value="below-shoulders">Ниже плеч</option>
                <option value="long">Длинные</option>
              </select>
            </label>

            <label>
              Структура{" "}
              <select value={structure} onChange={(e) => setStructure(e.target.value)}>
                <option value="straight">Прямые</option>
                <option value="wavy">Волнистые</option>
                <option value="curly">Кудрявые</option>
                <option value="afro-curls">Афро-кудри</option>
              </select>
            </label>
          </div>

          <button
            onClick={run}
            disabled={loading}
            style={{
              marginTop: 18,
              padding: "12px 20px",
              border: 0,
              borderRadius: 10,
              background: "#111",
              color: "#fff",
              cursor: loading ? "wait" : "pointer",
              fontWeight: 700,
            }}
          >
            {loading ? "Строю маску…" : "Проверить маску"}
          </button>

          {error && (
            <div style={{ marginTop: 14, color: "#b00020" }}>{error}</div>
          )}
        </div>

        {preview && (
          <section style={{ marginBottom: 24 }}>
            <h2>Маска поверх исходного фото</h2>
            <p style={{ color: "#555" }}>
              Светлая область показывает зону, которую система считает допустимой для изменения.
            </p>
            <img
              src={preview}
              alt="Диагностическая маска поверх исходного фото"
              style={{ maxWidth: "100%", display: "block", borderRadius: 12 }}
            />
          </section>
        )}

        {mask && (
          <section>
            <h2>Чистая маска</h2>
            <p style={{ color: "#555" }}>
              Белое = можно изменять. Чёрное = должно оставаться защищённым.
            </p>
            <img
              src={mask}
              alt="Чистая маска волос"
              style={{
                maxWidth: "100%",
                display: "block",
                borderRadius: 12,
                background: "#888",
              }}
            />
          </section>
        )}
      </div>
    </main>
  );
}
