"use client";
import { useState } from "react";
import { PALETTE } from "@/lib/palette";

const FAMILY_LABELS: Record<string, string> = {
  cold_pearl: "Cold Pearl", intense_violet: "Intense Violet", iridescent_blond: "Iridescent Blond",
  beige: "Beige", golden: "Golden", golden_copper: "Golden Copper", copper: "Copper", intense_copper: "Intense Copper",
  golden_chocolate: "Golden Chocolate", caramel: "Caramel", special_blond: "Special Blond", special_toner: "Special Toner",
  pastel_toner: "Pastel Toner", ammonia_corrector: "Ammonia Corrector", corrector: "Corrector", red: "Red", ultra_red: "Ultra Red",
  mahogany: "Mahogany", frozen_choco: "Frozen Choco", frozen_choco_wood: "Frozen Choco", rosewood: "Rosewood",
  chocolate: "Chocolate", intense_chocolate: "Intense Chocolate", cold_natural: "Cold Natural", intense_natural: "Intense Natural",
  ash: "Ash", metallic: "Metallic", sand: "Sand", pearl: "Pearl",
};

function safeCode(code: string) { return code.replaceAll("/", "_").replaceAll(" ", "_"); }

export function PalettePicker({ value, onChange }: {
  value: string;
  onChange: (entry: (typeof PALETTE)[number]) => void;
}) {
  const [family, setFamily] = useState("all");
  const [query, setQuery] = useState("");
  const families = Array.from(new Set(PALETTE.map((item) => item.family)));
  const filtered = PALETTE.filter((item) =>
    (family === "all" || item.family === family) &&
    item.code.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по коду, например 7.34"
          style={{ flex: 1, minWidth: 220, padding: "11px 12px", border: "1px solid #ddd8ce", borderRadius: 10 }}
        />
        <select
          value={family}
          onChange={(e) => setFamily(e.target.value)}
          style={{ padding: "11px 12px", border: "1px solid #ddd8ce", borderRadius: 10, background: "#fff" }}
        >
          <option value="all">Все направления</option>
          {families.map((item) => <option key={item} value={item}>{FAMILY_LABELS[item] || item}</option>)}
        </select>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(92px, 1fr))", gap: 8, maxHeight: 430, overflowY: "auto", padding: 2 }}>
        {filtered.map((entry) => {
          const active = entry.code === value;
          return (
            <button
              key={entry.family + "-" + entry.code}
              type="button"
              title={entry.code + " — " + (FAMILY_LABELS[entry.family] || entry.family)}
              onClick={() => onChange(entry)}
              style={{ padding: 6, borderRadius: 10, border: active ? "2px solid #d46925" : "1px solid #ddd8ce", background: active ? "#fff0e4" : "#fff", cursor: "pointer" }}
            >
              <img src={"/palette/" + entry.family + "/" + safeCode(entry.code) + ".svg"} alt={entry.code} style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: 7, display: "block" }} />
              <span style={{ display: "block", marginTop: 5, fontWeight: 700, fontSize: 12 }}>{entry.code}</span>
            </button>
          );
        })}
      </div>
      <p style={{ margin: "8px 0 0", fontSize: 12, color: "#77736c" }}>
        Выбрано: {value || "не выбрано"} · каталог: {PALETTE.length} позиций
      </p>
    </div>
  );
}