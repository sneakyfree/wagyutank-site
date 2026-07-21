// The official 16/16 bloodline analysis, drawn two ways:
//   variant="bar"   — a compact stacked strip for the foundation gallery card
//   variant="donut" — the full breakdown on an animal's profile page
//
// `blend` is units out of 16 keyed by strain, e.g. {Tajima: 8, Kedaka: 4}.
//
// Colour is categorical (each strain is an identity, not a magnitude), so hues
// are assigned in a FIXED slot order and never cycled — a strain keeps its hue
// whatever else is on screen. The eight hues below are the validated dark-mode
// categorical set; verified against this site's chart surface (#1a1712) with
// scripts/validate_palette.js: lightness band, chroma floor, adjacent-pair CVD
// separation (worst ΔE 8.4), normal-vision floor (19.3) and 3:1 contrast all
// PASS. Do not re-order or hand-tweak these without re-running that validator.
// "Other" is a catch-all, so it takes a neutral — not a ninth hue.

export const LINE_ORDER = [
  "Tajima", "Kedaka", "Tottori", "Itozakura",
  "Shimane", "Okayama", "Hiroshima", "Kumanami", "Other",
] as const;

export const LINE_COLOR: Record<string, string> = {
  Tajima: "#3987e5",
  Kedaka: "#d95926",
  Tottori: "#199e70",
  Itozakura: "#c98500",
  Shimane: "#d55181",
  Okayama: "#008300",
  Hiroshima: "#9085e9",
  Kumanami: "#e66767",
  Other: "#8a8578",
};

type Seg = { line: string; units: number; pct: number; color: string };

function segments(blend: Record<string, number> | null | undefined): Seg[] {
  if (!blend) return [];
  const entries = LINE_ORDER
    .filter((l) => Number(blend[l]) > 0)
    .map((l) => ({ line: l as string, units: Number(blend[l]) }));
  const total = entries.reduce((s, e) => s + e.units, 0);
  if (!total) return [];
  return entries.map((e) => ({
    ...e,
    pct: (e.units / total) * 100,
    color: LINE_COLOR[e.line] || LINE_COLOR.Other,
  }));
}

const fmtPct = (p: number) => `${p < 1 ? p.toFixed(1) : Math.round(p)}%`;

// Two facts worth calling out on sight. Almost every founder outside Japan
// carries Tajima marbling blood, so a zero in that column marks one of the very
// few true outcrosses left; and of those, only Shigefuku is wholly Kedaka/Tottori.
function distinctions(segs: Seg[]): string[] {
  if (!segs.length) return [];
  const out: string[] = [];
  if (!segs.some((s) => s.line === "Tajima")) out.push("No Tajima");
  const kt = segs.filter((s) => s.line === "Kedaka" || s.line === "Tottori")
                 .reduce((n, s) => n + s.pct, 0);
  if (kt > 99.5) out.push("Pure Kedaka / Tottori");
  return out;
}

/** Compact stacked strip + the two dominant strains named in text. */
export function BlendBar({ blend }: { blend?: Record<string, number> | null }) {
  const segs = segments(blend);
  if (!segs.length) return null;
  const top = [...segs].sort((a, z) => z.units - a.units).slice(0, 2);
  return (
    <div style={{ marginTop: 7 }}>
      {/* 2px surface-coloured gaps keep adjacent fills legible for CVD readers */}
      <div style={{ display: "flex", gap: 2, height: 6, borderRadius: 3, overflow: "hidden" }}>
        {segs.map((s) => (
          <div
            key={s.line}
            title={`${s.line} ${fmtPct(s.pct)}`}
            style={{ width: `${s.pct}%`, background: s.color, borderRadius: 2 }}
          />
        ))}
      </div>
      <div className="faint" style={{ fontSize: "0.68rem", marginTop: 4, letterSpacing: "0.01em" }}>
        {top.map((s) => `${fmtPct(s.pct)} ${s.line}`).join(" · ")}
        {segs.length > top.length ? " · …" : ""}
      </div>
    </div>
  );
}

/** Donut + legend/value list — the profile-page view of the same numbers. */
export function BlendDonut({
  blend, group, source, total,
}: {
  blend?: Record<string, number> | null;
  group?: string | null;
  source?: string | null;
  total?: number | null;
}) {
  const segs = segments(blend);
  if (!segs.length) return null;

  const R = 54, SW = 22, C = 2 * Math.PI * R;
  const dominant = [...segs].sort((a, z) => z.units - a.units)[0];
  let accum = 0;

  return (
    <div style={{ marginTop: 6 }}>
      <div className="row wrap" style={{ gap: 22, alignItems: "center" }}>
        <svg width="140" height="140" viewBox="0 0 140 140" role="img"
             aria-label={`Bloodline analysis: ${segs.map((s) => `${s.line} ${fmtPct(s.pct)}`).join(", ")}`}>
          <g transform="rotate(-90 70 70)">
            {segs.map((s) => {
              const len = (s.pct / 100) * C;
              const draw = Math.max(len - 2, 0.5);   // 2px gap between arcs
              const el = (
                <circle
                  key={s.line} cx="70" cy="70" r={R}
                  fill="none" stroke={s.color} strokeWidth={SW}
                  strokeDasharray={`${draw} ${C - draw}`}
                  strokeDashoffset={-accum}
                >
                  <title>{`${s.line} — ${fmtPct(s.pct)}`}</title>
                </circle>
              );
              accum += len;
              return el;
            })}
          </g>
          <text x="70" y="65" textAnchor="middle" fontSize="21" fontWeight="800" fill="var(--text)">
            {fmtPct(dominant.pct)}
          </text>
          <text x="70" y="82" textAnchor="middle" fontSize="10.5" fill="var(--text-dim)"
                letterSpacing="0.06em">
            {dominant.line.toUpperCase()}
          </text>
        </svg>

        <div style={{ flex: "1 1 210px", minWidth: 190 }}>
          {segs.map((s) => (
            <div key={s.line} className="row"
                 style={{ gap: 8, alignItems: "center", padding: "3px 0", fontSize: "0.86rem" }}>
              <span aria-hidden style={{
                width: 10, height: 10, borderRadius: 2,
                background: s.color, flex: "0 0 auto",
              }} />
              <span style={{ flex: 1 }}>{s.line}</span>
              <span className="muted" style={{ fontVariantNumeric: "tabular-nums" }}>
                {Number(s.units.toFixed(1))}/16
              </span>
              <span style={{ fontWeight: 700, minWidth: 44, textAlign: "right",
                             fontVariantNumeric: "tabular-nums" }}>
                {fmtPct(s.pct)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {distinctions(segs).length > 0 && (
        <div className="row wrap" style={{ gap: 6, marginTop: 10 }}>
          {distinctions(segs).map((d) => (
            <span key={d} className="pill" style={{ fontSize: "0.68rem" }}>{d}</span>
          ))}
        </div>
      )}

      <p className="faint" style={{ fontSize: "0.74rem", marginTop: 10, lineHeight: 1.5 }}>
        {group ? <>Group <strong>{group}</strong> · </> : null}
        16/16 strain analysis{total && Math.abs(total - 16) > 0.15
          ? ` (source totals ${Number(total.toFixed(1))}, not 16 — shown as published)` : ""}
        {source ? ` · ${source}` : ""}
      </p>
    </div>
  );
}
