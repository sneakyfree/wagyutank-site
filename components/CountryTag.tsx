// A country label a rancher can read across the room: big flag + the name
// spelled out. The bare 0.95rem emoji it replaces was invisible squint-bait —
// and the international breadth of the market is a selling point, not fine print.
import { countryFlag } from "../lib/api";

// Fallback names for environments without Intl.DisplayNames.
const NAMES: Record<string, string> = {
  US: "United States", AU: "Australia", GB: "United Kingdom", DE: "Germany",
  JP: "Japan", CA: "Canada", BR: "Brazil", AT: "Austria", CZ: "Czechia",
  DK: "Denmark", ES: "Spain", FR: "France", HU: "Hungary", IT: "Italy",
  MX: "Mexico", NL: "Netherlands", NO: "Norway", NZ: "New Zealand",
  TH: "Thailand", TR: "Türkiye", VN: "Vietnam", ZA: "South Africa", CO: "Colombia",
};

export function countryName(cc?: string | null): string {
  if (!cc) return "";
  const up = cc.toUpperCase();
  try {
    const n = new Intl.DisplayNames(["en"], { type: "region" }).of(up);
    if (n && n !== up) return n;
  } catch { /* fall through */ }
  return NAMES[up] || up;
}

export default function CountryTag({ cc, size = "md" }: { cc: string; size?: "sm" | "md" }) {
  const name = countryName(cc);
  return (
    <span className={`country-tag${size === "sm" ? " country-tag-sm" : ""}`} title={name}>
      <span className="country-tag-flag" aria-hidden>{countryFlag(cc)}</span>
      <span className="country-tag-name">{name}</span>
    </span>
  );
}
