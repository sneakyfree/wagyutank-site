"use client";
import { brand, TANK } from "../lib/tank";

// The marbled-medallion mark: a ribeye seal (marbling = the hero). The source
// (wagyu) carries the hand-drawn W·T monogram; every CLONE gets a medallion in
// ITS OWN palette (brand.colors) with ITS OWN initials, so no Wagyu gold or W·T
// seal ever leaks onto another breed's site. Scales from favicon to hero.
export function LogoMark({ size = 40 }: { size?: number }) {
  const isWagyu = (TANK as any).key === "wagyu";
  const colors = ((brand as any).colors || {}) as Record<string, string>;
  // clone gradient stops from config; wagyu keeps its exact original 3-stop gold.
  const gBright = colors.goldBright || "#f6cd6b";
  const gMid = colors.gold || "#d9a441";
  const gDeep = isWagyu ? "#a9761f" : (colors.gold || "#a9761f");
  // clone monogram = breed initials (["GIR","TANK"] -> "GT"); wagyu = hand path.
  const wm = ((brand as any).wordmark as string[] | undefined) || ["WAGYU", "TANK"];
  const initials = ((wm[0]?.[0] || "") + (wm[1]?.[0] || "")).toUpperCase();

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true"
         style={{ flex: "0 0 auto", display: "block" }}>
      <defs>
        <radialGradient id="wtMedal" cx="42%" cy="34%" r="72%">
          <stop offset="0%" stopColor="#26211a" />
          <stop offset="70%" stopColor="#171310" />
          <stop offset="100%" stopColor="#0c0a08" />
        </radialGradient>
        <linearGradient id="wtGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={gBright} />
          <stop offset="48%" stopColor={gMid} />
          <stop offset="100%" stopColor={gDeep} />
        </linearGradient>
        <clipPath id="wtClip"><circle cx="32" cy="32" r="28" /></clipPath>
      </defs>

      {/* medallion body */}
      <circle cx="32" cy="32" r="30" fill="url(#wtGold)" />
      <circle cx="32" cy="32" r="28.2" fill="url(#wtMedal)" />

      {/* marbling — fine intramuscular veining (the A5 hero), clipped to the eye */}
      <g clipPath="url(#wtClip)" stroke="url(#wtGold)" fill="none" strokeLinecap="round" opacity="0.5">
        <path d="M8 26 C18 22 22 30 30 27 C38 24 44 30 56 24" strokeWidth="1.1" opacity="0.55" />
        <path d="M6 36 C16 40 24 34 32 38 C42 43 48 37 58 41" strokeWidth="1.3" opacity="0.6" />
        <path d="M12 47 C20 44 27 49 34 46 C43 42 50 48 55 45" strokeWidth="0.9" opacity="0.45" />
        <path d="M20 10 C22 18 18 24 24 30" strokeWidth="0.8" opacity="0.4" />
        <path d="M46 12 C44 20 49 25 45 32" strokeWidth="0.8" opacity="0.4" />
        <path d="M14 18 C20 20 22 26 19 33" strokeWidth="0.7" opacity="0.35" />
        <path d="M52 50 C46 47 43 41 47 36" strokeWidth="0.7" opacity="0.35" />
      </g>

      {isWagyu ? (
        /* W·T monogram, embossed — the source mark, kept byte-identical */
        <g strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M15 22 L23 44 L32 30 L41 44 L49 22" stroke="#000" strokeOpacity="0.35" strokeWidth="5.4" transform="translate(0.6,0.9)" />
          <path d="M20 17.5 L44 17.5 M32 17.5 L32 30" stroke="#000" strokeOpacity="0.35" strokeWidth="5.4" transform="translate(0.6,0.9)" />
          <path d="M15 22 L23 44 L32 30 L41 44 L49 22" stroke="url(#wtGold)" strokeWidth="5" />
          <path d="M20 17.5 L44 17.5 M32 17.5 L32 30" stroke="#f6cd6b" strokeWidth="5" />
        </g>
      ) : (
        /* clone: the breed's initials in its own gold, embossed */
        <g>
          <text x="32" y="33" transform="translate(0.6,0.9)" textAnchor="middle" dominantBaseline="central"
                fontFamily="Georgia, 'Times New Roman', serif" fontWeight="700"
                fontSize={initials.length > 1 ? 26 : 34} fill="#000" fillOpacity="0.35">{initials}</text>
          <text x="32" y="33" textAnchor="middle" dominantBaseline="central"
                fontFamily="Georgia, 'Times New Roman', serif" fontWeight="700"
                fontSize={initials.length > 1 ? 26 : 34} fill="url(#wtGold)">{initials}</text>
        </g>
      )}
    </svg>
  );
}

export default function Logo({ size = 34 }: { size?: number }) {
  // Wordmark text comes from tank config (["WAGYU","TANK"], ["HIGHLAND","TANK"]…).
  // The medallion SVG above is a per-tank brand asset, swapped at clone time.
  // Fallback derives from the brand name ("DexterTank" → ["DEXTER","TANK"]) so
  // a config without an explicit wordmark never shows another tank's mark.
  const bn = ((brand as any).name as string | undefined) || "WagyuTank";
  const derived = bn.toUpperCase().endsWith("TANK")
    ? [bn.slice(0, -4).toUpperCase().trim(), "TANK"]
    : [bn.toUpperCase(), ""];
  const wm = ((brand as any).wordmark as string[] | undefined) || derived;
  return (
    <span className="wt-logo">
      <LogoMark size={size} />
      <span className="wt-wordmark"><b>{wm[0]}</b><span className="wt-tank">{wm[1] || ""}</span></span>
    </span>
  );
}
