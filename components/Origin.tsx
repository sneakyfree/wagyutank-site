// Where an animal was BORN — the thing breeders actually want to know at a
// glance, and which "imported 1994" alone doesn't tell you (a calf born here to
// an imported dam arrived on the same shipment but was never in Japan).
//
// Japan-born  → 🇯🇵 with the year its genetics were exported
// US-born     → 🇺🇸
// Australia   → 🇦🇺
// unestablished origin → no flag, just "bred outside Japan"

const FLAG: Record<string, string> = { JP: "🇯🇵", US: "🇺🇸", AU: "🇦🇺" };
const COUNTRY: Record<string, string> = { JP: "Japan", US: "America", AU: "Australia" };

export function originFlag(a: any): string {
  // In-utero arrivals get both flags — the whole point is that the two
  // countries differ, which one flag can't say.
  if (a?.conceived_in_japan && a?.birth_country && a.birth_country !== "JP") {
    return `🇯🇵→${FLAG[a.birth_country] || ""}`;
  }
  return FLAG[a?.birth_country] || "";
}

/** Short form for gallery cards. */
export function originShort(a: any): string {
  const cc = a?.birth_country;
  if (a?.conceived_in_japan && COUNTRY[cc] && cc !== "JP") {
    return `Conceived in Japan · born in ${COUNTRY[cc]}`;
  }
  if (cc === "JP") {
    // Semen-only sire: the bull stayed in Japan; only his straws were exported.
    if (a?.semen_only) {
      return a?.import_year ? `Born in Japan · semen imported ${a.import_year}` : "Born in Japan · semen exported";
    }
    return a?.import_year ? `Born in Japan · imported ${a.import_year}` : "Born in Japan";
  }
  if (COUNTRY[cc]) return `Born in ${COUNTRY[cc]}`;
  return "Bred outside Japan";
}

/** Long form for the profile page's registry table. */
export function originLong(a: any): string {
  const cc = a?.birth_country;
  if (!COUNTRY[cc]) return "Bred outside Japan — country not established";
  if (a?.conceived_in_japan && cc !== "JP") {
    // Listed on the export charts as a "calf born": it crossed the Pacific
    // inside an imported cow, so it is foundation stock that never stood in Japan.
    return `Conceived in Japan, born in ${COUNTRY[cc]} — carried in utero on the import`;
  }
  if (cc === "JP") {
    if (a?.semen_only) return "Japan — only his semen was exported; the bull never left Japan";
    return "Japan — exported to America";
  }
  return `${COUNTRY[cc]} — bred from imported parents`;
}

export default function OriginLine({ a, className, style }: { a: any; className?: string; style?: any }) {
  const flag = originFlag(a);
  return (
    <span className={className} style={style}>
      {flag && <span aria-hidden style={{ marginRight: 5 }}>{flag}</span>}
      {originShort(a)}
    </span>
  );
}
