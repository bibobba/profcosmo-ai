"use client";

import { useMemo, useState } from "react";
import { PALETTE } from "@/lib/palette";

const LEVELS = Array.from({ length: 12 }, (_, i) => i + 1);

const FAMILY_LABELS: Record<string, string> = {
  cold_pearl: "Холодный жемчуг", intense_violet: "Интенсивный фиолетовый", iridescent_blond: "Перламутровый блонд",
  beige: "Бежевый", golden: "Золотистый", golden_copper: "Золотисто-медный", copper: "Медный", intense_copper: "Интенсивно-медный",
  golden_chocolate: "Золотисто-шоколадный", caramel: "Карамельный", special_blond: "Специальный блонд", special_toner: "Специальный тонер",
  pastel_toner: "Пастельный тонер", ammonia_corrector: "Аммиачный корректор", corrector: "Корректор", red: "Красный", ultra_red: "Ультра-красный",
  mahogany: "Махагон", frozen_choco: "Холодный шоколад", frozen_choco_wood: "Холодный шоколад", rosewood: "Розовое дерево",
  chocolate: "Шоколадный", intense_chocolate: "Интенсивный шоколад", cold_natural: "Холодный натуральный", intense_natural: "Интенсивный натуральный",
  ash: "Пепельный", metallic: "Металлик", sand: "Песочный", pearl: "Жемчужный",
};

function levelColor(level: number) {
  return `hsl(30 13% ${Math.min(84, 12 + (level - 1) * 6.4)}%)`;
}

function textColorForHex(hex: string) {
  const value = hex.replace("#", "");
  if (value.length !== 6) return "#fff";
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? "#2b2824" : "#fff";
}

export function PalettePicker({ value, onChange }: {
  value: string;
  onChange: (entry: (typeof PALETTE)[number]) => void;
}) {
  const initialLevel = Number.parseInt(value.split(".")[0], 10);
  const [level, setLevel] = useState(initialLevel >= 1 && initialLevel <= 12 ? initialLevel : 7);

  const shades = useMemo(() => PALETTE.filter((item) => item.level === level), [level]);
  const selected = PALETTE.find((item) => item.code === value) ?? null;

  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#77736c", marginBottom: 8 }}>
          1. Уровень тона
        </div>
        <div style={{ display: "flex", gap: 7, overflowX: "auto", padding: "2px 2px 8px" }}>
          {LEVELS.map((item) => {
            const active = item === level;
            return (
              <button key={item} type="button" onClick={() => setLevel(item)} aria-label={`Уровень тона ${item}`}
                style={{ flex: "0 0 42px", width: 42, height: 42, borderRadius: "50%", border: active ? "3px solid #d46925" : "1px solid #d8d2c8",
                  background: levelColor(item), color: item >= 7 ? "#2b2824" : "#fff", fontWeight: 800, fontSize: 13, cursor: "pointer",
                  boxShadow: active ? "0 0 0 3px rgba(212,105,37,.14)" : "none" }}>
                {item}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#77736c", marginBottom: 8 }}>
          2. Оттенок — уровень {level}
        </div>

        {shades.length === 0 ? (
          <div style={{ padding: 18, border: "1px solid #e3ddd4", borderRadius: 14, color: "#77736c", background: "#faf9f7" }}>
            Для этого уровня в текущем каталоге нет оттенков.
          </div>
        ) : (
          <div style={{ position: "relative", width: "100%", maxWidth: 430, aspectRatio: "1", margin: "0 auto", minHeight: 310 }}>
            <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", width: 112, height: 112, borderRadius: "50%",
              background: "#f7f5f0", border: "1px solid #e3ddd4", display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", textAlign: "center", boxSizing: "border-box", padding: 10 }}>
              <span style={{ fontSize: 11, color: "#77736c" }}>{selected?.code || `Уровень ${level}`}</span>
              <strong style={{ marginTop: 3, fontSize: 14 }}>
                {selected ? (FAMILY_LABELS[selected.family] || selected.family) : "Выберите оттенок"}
              </strong>
            </div>

            {shades.map((entry, index) => {
              const angle = -Math.PI / 2 + (index / Math.max(shades.length, 1)) * Math.PI * 2;
              const radius = shades.length <= 4 ? 38 : shades.length <= 7 ? 40 : 43;
              const x = 50 + Math.cos(angle) * radius;
              const y = 50 + Math.sin(angle) * radius;
              const active = entry.code === value;

              return (
                <button key={entry.family + "-" + entry.code} type="button" onClick={() => onChange(entry)}
                  title={FAMILY_LABELS[entry.family] || entry.family}
                  style={{ position: "absolute", left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)", width: 64, height: 64,
                    borderRadius: "50%", border: active ? "3px solid #d46925" : "2px solid rgba(255,255,255,.9)",
                    outline: active ? "3px solid rgba(212,105,37,.18)" : "1px solid rgba(0,0,0,.12)", background: entry.hex,
                    color: textColorForHex(entry.hex), fontWeight: 800, fontSize: 12, cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(40,30,20,.12)", display: "flex", alignItems: "center", justifyContent: "center", padding: 4 }}>
                  {entry.code}
                </button>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: 8, textAlign: "center", fontSize: 12, color: "#77736c" }}>
          {shades.length} оттенков на уровне {level}{selected ? ` · выбрано ${selected.code}` : ""}
        </div>
      </div>
    </div>
  );
}
