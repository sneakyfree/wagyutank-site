"use client";
// Visual, color-coded markers so a listing's type reads at a glance:
// semen = sperm cell, embryo = morula (cell cluster), clone rights = DNA helix.
// Non-genetics families (live animals, beef) get the tank config's emoji glyph.
import { PRODUCT_GLYPH, PRODUCT_LABEL } from "../lib/api";

const STYLE: Record<string, { color: string; bg: string; border: string }> = {
  semen: { color: "#5ec8e0", bg: "rgba(94,200,224,0.14)", border: "rgba(94,200,224,0.4)" },
  embryo: { color: "#e0a53a", bg: "rgba(224,165,58,0.14)", border: "rgba(224,165,58,0.4)" },
  clone_rights: { color: "#b98ce0", bg: "rgba(185,140,224,0.14)", border: "rgba(185,140,224,0.4)" },
  live_animal: { color: "#7fc07f", bg: "rgba(127,192,127,0.14)", border: "rgba(127,192,127,0.4)" },
  beef: { color: "#e07a6a", bg: "rgba(224,122,106,0.14)", border: "rgba(224,122,106,0.4)" },
};

function Icon({ type, size = 14 }: { type: string; size?: number }) {
  const c = STYLE[type]?.color || "currentColor";
  if (type === "semen") {
    // sperm: round head + wavy tail
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="7" cy="8" r="4" fill={c} />
        <path d="M10 10 C14 12, 12 15, 16 16 C20 17, 18 20, 22 21" stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === "embryo") {
    // morula: cluster of cells
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="9" stroke={c} strokeWidth="1.3" opacity="0.55" />
        {[[9, 9], [15, 9], [12, 8], [8.5, 13], [15.5, 13], [12, 15], [11, 12], [14, 12]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="2.1" fill={c} opacity={0.85} />
        ))}
      </svg>
    );
  }
  if (type === "clone_rights") {
    // clone rights: DNA double helix
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M8 3 C8 8, 16 8, 16 12 C16 16, 8 16, 8 21" stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <path d="M16 3 C16 8, 8 8, 8 12 C8 16, 16 16, 16 21" stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <line x1="9.5" y1="6" x2="14.5" y2="6" stroke={c} strokeWidth="1.1" />
        <line x1="9.5" y1="18" x2="14.5" y2="18" stroke={c} strokeWidth="1.1" />
      </svg>
    );
  }
  // Everything else (live_animal, beef, unknown): the config's emoji glyph —
  // simple, and it can never crash on a product type this build hasn't met.
  return (
    <span aria-hidden style={{ fontSize: size, lineHeight: 1 }}>{PRODUCT_GLYPH[type] || "🐄"}</span>
  );
}

export default function ProductBadge({ type, size = 14 }: { type: string; size?: number }) {
  const s = STYLE[type] || STYLE.semen;
  return (
    <span className="pill product-badge" style={{ background: s.bg, color: s.color, borderColor: s.border, display: "inline-flex", alignItems: "center", gap: 5 }}>
      <Icon type={type} size={size} />
      {PRODUCT_LABEL[type] || type}
    </span>
  );
}

// A small corner marker for card media (icon only, colored).
export function ProductMark({ type }: { type: string }) {
  const s = STYLE[type] || STYLE.semen;
  return (
    <span title={PRODUCT_LABEL[type] || type} style={{ position: "absolute", top: 10, right: 10, width: 30, height: 30, borderRadius: "50%", background: s.bg, border: `1px solid ${s.border}`, display: "grid", placeItems: "center", backdropFilter: "blur(4px)" }}>
      <span style={{ display: "grid", placeItems: "center" }}><IconExport type={type} /></span>
    </span>
  );
}
function IconExport({ type }: { type: string }) { return <Icon type={type} size={17} />; }
