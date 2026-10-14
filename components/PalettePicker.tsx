"use client";

import { useMemo, useState } from "react";
import { PALETTE } from "@/lib/palette";

const LEVELS = Array.from({ length: 12 }, (_, i) => i + 1);

const FAMILY_LABELS: Record<string, string> = {
  cold_pearl: "Холодный жемчуг",
  intense_violet: "Интенсивный фиолетовый",
  iridescent_blond: "Перламутровый блонд",
  beige: "Бежевый",
  golden: "Золотистый",
  golden_copper: "Золотисто-медный",
  copper: "Медный",
  intense_copper: "Интенсивно-медный",
  golden_chocolate: "Золотистый шоколад",
  caramel: "Карамельный",
  special_blond: "Специальный блонд",
  special_toner: "Специальный тонер",
  pastel_toner: "Пастельный тонер",
  ammonia_corrector: "Аммиачный корректор",
  corrector: "Корректор",
  red: "Красный",
  ultra_red: "Ультра-красный",
  mahogany: "Махагон",
  frozen_choco: "Холодный шоколад — пепел",
  frozen_choco_wood: "Холодный шоколад — дерево",
  rosewood: "Розовое дерево",
  chocolate: "Шоколадный",
  intense_chocolate: "Интенсивный шоколад",
  cold_natural: "Холодный натуральный",
  intense_natural: "Интенсивный натуральный",
  ash: "Пепельный",
  metallic: "Металлик",
  sand: "Песочный",
  pearl: "Жемчужный",
};

const GROUPS = [
  { value: "all", label: "Все группы" },
  ...Array.from(new Set(PALETTE.map((entry) => entry.family))).map((family) => ({
    value: family,
    label: PALETTE.find((entry) => entry.family === family)?.label || FAMILY_LABELS[family] || family,
  })),
];

export function PalettePicker({ value, onChange }: {
  value: string;
  onChange: (entry: (typeof PALETTE)[number]) => void;
}) {
  const initialLevel = Number.parseInt(value.split(".")[0], 10);
  const [level, setLevel] = useState(initialLevel >= 1 && initialLevel <= 12 ? initialLevel : 7);
  const [group, setGroup] = useState("all");
  const [showAllLevels, setShowAllLevels] = useState(false);

  const shades = useMemo(() => PALETTE.filter((item) => {
    const matchesLevel = showAllLevels || item.level === level || item.level === null;
    const matchesGroup = group === "all" || item.family === group;
    return matchesLevel && matchesGroup;
  }), [level, group, showAllLevels]);

  const selected = PALETTE.find((item) => item.code === value) ?? null;

  return (
    <section style={{ marginTop: 10, color: "#302b26" }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#77736c", marginBottom: 9 }}>
          1. Уровень глубины тона
        </div>
        <div style={{ display: "flex", gap: 7, overflowX: "auto", padding: "2px 2px 8px" }}>
          {LEVELS.map((item) => {
            const active = item === level && !showAllLevels;
            return (
              <button key={item} type="button" onClick={() => { setLevel(item); setShowAllLevels(false); }}
                aria-pressed={active} aria-label={`Уровень тона ${item}`}
                style={{ flex: "0 0 38px", width: 38, height: 38, borderRadius: 9, border: active ? "2px solid #d46925" : "1px solid #d8d2c8",
                  background: active ? "#f8e8dc" : "#fff", color: "#302b26", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>
                {item}
              </button>
            );
          })}
          <button type="button" onClick={() => setShowAllLevels(true)} aria-pressed={showAllLevels}
            style={{ flex: "0 0 auto", borderRadius: 9, border: showAllLevels ? "2px solid #d46925" : "1px solid #d8d2c8",
              padding: "0 12px", background: showAllLevels ? "#f8e8dc" : "#fff", color: "#302b26", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            Все уровни
          </button>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label htmlFor="epica-family-filter" style={{ display: "block", fontSize: 12, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#77736c", marginBottom: 8 }}>
          2. Направление оттенка
        </label>
        <select id="epica-family-filter" value={group} onChange={(event) => setGroup(event.target.value)}
          style={{ width: "100%", border: "1px solid #d8d2c8", borderRadius: 10, background: "#fff", color: "#302b26", padding: "12px 14px", fontSize: 14 }}>
          {GROUPS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
      </div>

      {selected && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, marginBottom: 14, border: "1px solid #d46925", borderRadius: 12, background: "#fffaf6" }}>
          <img src={selected.imagePath} alt={`Оттенок EPICA ${selected.code}`} style={{ width: 64, height: 86, objectFit: "cover", borderRadius: 7, background: "#f4f0eb" }} />
          <div>
            <div style={{ fontSize: 11, color: "#77736c", marginBottom: 3 }}>ВЫБРАННЫЙ ОТТЕНОК</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{selected.code}</div>
            <div style={{ fontSize: 13, color: "#6e665e", marginTop: 3 }}>{selected.label || FAMILY_LABELS[selected.family] || selected.family}</div>
          </div>
        </div>
      )}

      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#77736c", marginBottom: 9 }}>
        3. Выберите прядь
      </div>

      {shades.length === 0 ? (
        <div style={{ padding: 18, border: "1px solid #e3ddd4", borderRadius: 12, color: "#77736c", background: "#faf9f7" }}>
          В каталоге нет оттенков по этим параметрам.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(112px, 1fr))", gap: 10 }}>
          {shades.map((entry) => {
            const active = entry.code === value;
            return (
              <button key={entry.family + "-" + entry.code} type="button" onClick={() => onChange(entry)}
                aria-pressed={active} title={FAMILY_LABELS[entry.family] || entry.family}
                style={{ minWidth: 0, overflow: "hidden", textAlign: "left", padding: 7, borderRadius: 10,
                  border: active ? "2px solid #d46925" : "1px solid #e1dbd2", background: active ? "#fff7f1" : "#fff",
                  boxShadow: active ? "0 0 0 2px rgba(212,105,37,.10)" : "none", cursor: "pointer" }}>
                <img src={entry.imagePath} alt={`Прядь EPICA ${entry.code}`} loading="lazy"
                  style={{ display: "block", width: "100%", height: 104, objectFit: "cover", borderRadius: 6, background: "#f4f0eb" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 4, padding: "8px 2px 2px" }}>
                  <strong style={{ fontSize: 15, color: "#302b26" }}>{entry.code}</strong>
                  {entry.level !== null && <span style={{ fontSize: 10, color: "#81796f" }}>УГТ {entry.level}</span>}
                </div>
                <div style={{ fontSize: 11, lineHeight: 1.35, color: "#77736c", padding: "0 2px 3px" }}>
                  {FAMILY_LABELS[entry.family] || entry.family}
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: 12, fontSize: 12, color: "#77736c" }}>
        Показано: {shades.length} оттенков{showAllLevels ? "" : ` · уровень ${level}`}{selected ? ` · выбран ${selected.code}` : ""}
      </div>
    </section>
  );
}
