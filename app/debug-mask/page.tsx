"use client";

import { useState } from "react";

export default function DebugMaskPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);

  async function run() {
    if (!file) {
      setError("Сначала выбери фотографию.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("gender", "male");
    formData.append("length", "short");
    formData.append("structure", "afro-curls");

    try {
      const response = await fetch("/api/debug-mask", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      setResult(data);
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
        <h1>PROFCOSMO AI — проверка маски</h1>
        <p>Тестовый экран. Основную генерацию не меняет.</p>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            setFile(e.target.files?.[0] || null);
            setError("");
          }}
        />

        <button
          onClick={run}
          disabled={loading}
          style={{
            display: "block",
            marginTop: 16,
            padding: "12px 20px",
            border: 0,
            borderRadius: 10,
            background: "#111",
            color: "#fff",
            fontWeight: 700,
            cursor: loading ? "wait" : "pointer",
          }}
        >
          {loading ? "Проверяю…" : "Проверить маску"}
        </button>

        {error && (
          <pre style={{ marginTop: 20, color: "#b00020", whiteSpace: "pre-wrap" }}>
            {error}
          </pre>
        )}

        {result && (
          <div style={{ marginTop: 24 }}>
            <h2>Диагностика</h2>
            <pre style={{ whiteSpace: "pre-wrap" }}>
              {JSON.stringify(result.diagnostic, null, 2)}
            </pre>

            <h2>Маска поверх фото</h2>
            <img
              src={result.preview}
              alt="Диагностическая маска"
              style={{ maxWidth: "100%", display: "block", borderRadius: 12 }}
            />

            <h2>Чистая маска</h2>
            <img
              src={result.mask}
              alt="Чистая маска волос"
              style={{ maxWidth: "100%", display: "block", borderRadius: 12 }}
            />
          </div>
        )}
      </div>
    </main>
  );
}
