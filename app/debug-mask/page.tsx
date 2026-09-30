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

            <h2>Чистая маска волос (класс 17)</h2>
            <img
              src={result.mask}
              alt="Чистая маска волос"
              style={{ maxWidth: "100%", display: "block", borderRadius: 12 }}
            />

            <h2>Текущий тест: гибридная маска волос</h2>
            <p>
              MODNet определяет силуэт человека, SCRFD задаёт область головы,
              а face parsing удаляет лицо, уши, шею и одежду. Production пока не использует эту маску.
            </p>
            {result.hybridHairPreview ? (
              <>
                <h3>Гибридная маска поверх оригинала</h3>
                <img
                  src={result.hybridHairPreview}
                  alt="Hybrid hair mask"
                  style={{ maxWidth: "100%", display: "block", borderRadius: 12 }}
                />
                <h3>Чистая маска волос</h3>
                <img
                  src={result.hybridHairCleanMask}
                  alt="Hybrid clean hair mask"
                  style={{ maxWidth: "100%", display: "block", borderRadius: 12 }}
                />
              </>
            ) : (
              <pre style={{ whiteSpace: "pre-wrap", color: "#b00020" }}>
                Гибридная маска не создана.
              </pre>
            )}

            <h2>Диагностика</h2>
            <p>
              Здесь проверяем только качество новой маски. Production-генерация
              и текущая BiSeNet-маска не меняются.
            </p>

            {result.modnetMattePreview ? (
              <>
                <h3>MODNet — исходная matte</h3>
                <img
                  src={result.modnetMattePreview}
                  alt="MODNet matte"
                  style={{
                    maxWidth: "100%",
                    display: "block",
                    borderRadius: 12,
                  }}
                />
              </>
            ) : (
              <pre style={{ whiteSpace: "pre-wrap", color: "#b00020" }}>
                MODNet не запустился: {result.diagnostic?.modnet?.error || "неизвестная ошибка"}
              </pre>
            )}

            {result.modnetHairCandidatePreview && (
              <>
                <h3>MODNet + защита лица — кандидат зоны волос</h3>
                <img
                  src={result.modnetHairCandidatePreview}
                  alt="MODNet hair candidate"
                  style={{
                    maxWidth: "100%",
                    display: "block",
                    borderRadius: 12,
                  }}
                />
              </>
            )}

            <h2>Сравнение классов BiSeNet</h2>
            <p>
              Здесь показываем отдельно классы 14, 16 и 17. Белая область —
              то, что BiSeNet отнёс к соответствующему классу.
            </p>
            {[14, 16, 17].map((cls) => (
              <div key={cls} style={{ marginTop: 24 }}>
                <h3>Класс {cls}</h3>
                {result.diagnosticClassPreviews?.[String(cls)] ? (
                  <img
                    src={result.diagnosticClassPreviews[String(cls)]}
                    alt={`Диагностика класса ${cls}`}
                    style={{
                      maxWidth: "100%",
                      display: "block",
                      borderRadius: 12,
                    }}
                  />
                ) : (
                  <p>Предпросмотр не получен.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
