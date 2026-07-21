"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../../lib/api";
import { TANK } from "../../lib/tank";
import FollowButton from "../../components/FollowButton";
import { BlendBar } from "../../components/BloodBlend";
import OriginLine from "../../components/Origin";
import { thumbUrl } from "../../lib/thumb";

// The five founder groups, in the order the story is best told: the three black
// Wagyu bloodlines (largest → rarest), then the separate Akaushi red breed, then
// the deliberately multi-line bulls. Each group's `follow` is the canonical
// bloodline string used for the "get new listings" feed (null = no single line).
const GROUPS: { key: string; label: string; glyph: string; blurb: string; follow: string | null }[] = [
  { key: "Tajima", label: "Tajima", glyph: "🥩",
    blurb: "The marbling line, from Hyōgo (the blood behind Kobe beef). By far the largest founder group.",
    follow: "Tajima" },
  { key: "Shimane", label: "Shimane / Fujiyoshi", glyph: "⚖️",
    blurb: "The Shimane maternal-and-growth line, including the famed Itozakura family. The second-largest group.",
    follow: "Fujiyoshi (Shimane)" },
  { key: "Kedaka", label: "Kedaka / Tottori", glyph: "📏",
    blurb: "The rare frame-and-growth line from Tottori — the fewest founders of the three black bloodlines.",
    follow: "Kedaka (Tottori)" },
  { key: "Mixed", label: "Mixed / Multi-line", glyph: "🧬",
    blurb: "Founders that deliberately blend two or more lines — prized as outcrosses that add growth without losing marbling.",
    follow: null },
  { key: "Mishima", label: "Mishima — a separate native breed", glyph: "🏝️",
    blurb: "Not Wagyu at all. Mishima are one of Japan's six native cattle breeds, kept on a single island and never crossed with imported Western cattle — a living sample of Japanese cattle from before the crossbreeding that made modern Wagyu. One bull was ever exported.",
    follow: null },
  { key: "Akaushi", label: "Akaushi — Japanese Red", glyph: "🟥",
    blurb: "A separate red breed from Kumamoto, imported alongside the Blacks. Rueshaw and Judo lead this line.",
    follow: "Kumamoto (Akaushi)" },
];

function groupOf(bloodline: string | null | undefined): string {
  const b = (bloodline || "").toLowerCase();
  if (b.startsWith("tajima")) return "Tajima";
  if (b.includes("shimane") || b.includes("fujiyoshi") || b.startsWith("itozakura")) return "Shimane";
  if (b.includes("kedaka") || b.includes("tottori")) return "Kedaka";
  if (b.includes("mishima")) return "Mishima";
  if (b.includes("akaushi") || b.includes("kumamoto")) return "Akaushi";
  return "Mixed";
}

const byName = (a: any, z: any) => (a.name || "").localeCompare(z.name || "");

export default function Foundation() {
  const [bulls, setBulls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.foundation().then((all: any[]) => setBulls(all)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const isWagyu = (TANK as any).key === "wagyu";
  const allBulls = bulls.filter((b) => b.animal_type === "bull");
  const allCows = bulls.filter((b) => b.animal_type === "cow").sort(byName);
  // Two distinct breeds arrived together, and newcomers must not read them as one
  // herd: Japanese Black and Akaushi are separate breeds, so they get separate
  // sections rather than one undifferentiated "foundation cows" list.
  const isRed = (a: any) =>
    /akaushi|red|kumamoto/i.test(`${a.breed || ""} ${a.bloodline || ""}`);
  const cowGroups = [
    { key: "black", label: "Black Wagyu foundation dams", glyph: "⬛",
      blurb: "The Japanese Black females — the dam side of the Tajima, Shimane and Kedaka lines.",
      animals: allCows.filter((a) => !isRed(a)) },
    { key: "akaushi", label: "Akaushi (Japanese Red) foundation dams", glyph: "🟥",
      blurb: "A separate breed from Kumamoto, imported alongside the Blacks — not a colour variant of them.",
      animals: allCows.filter(isRed) },
  ].filter((g) => g.animals.length > 0);
  const cows = allCows;
  const imports = allBulls.filter((b) => !b.bred_outside_japan);
  const domestic = allBulls.filter((b) => b.bred_outside_japan).sort(byName);

  // WagyuTank keeps its five hand-curated bloodline groups (Tajima/Shimane/…).
  // Every other tank derives groups from the distinct bloodlines its own
  // foundation animals actually carry — so a clone never shows empty Wagyu
  // bloodline headers, and its real lines each get a section.
  let grouped: { key: string; label: string; glyph: string; blurb: string; follow: string | null; animals: any[] }[];
  if ((TANK as any).key === "wagyu") {
    grouped = GROUPS
      .map((g) => ({ ...g, animals: imports.filter((b) => groupOf(b.bloodline) === g.key).sort(byName) }))
      .filter((g) => g.animals.length > 0);
  } else {
    const order: string[] = [];
    const bucket: Record<string, any[]> = {};
    for (const b of imports) {
      const line = (b.bloodline || "").trim() || "Foundation";
      if (!bucket[line]) { bucket[line] = []; order.push(line); }
      bucket[line].push(b);
    }
    grouped = order
      .sort((a, z) => bucket[z].length - bucket[a].length || a.localeCompare(z))
      .map((line) => ({
        key: line, label: line, glyph: "🐄",
        blurb: bucket[line].length > 1 ? `${bucket[line].length} foundation animals in the ${line} line.` : "",
        follow: line === "Foundation" ? null : line,
        animals: bucket[line].sort(byName),
      }))
      .filter((g) => g.animals.length > 0);
  }

  return (
    <div className="container section">
      <div style={{ maxWidth: "72ch" }}>
        <span className="pill">Breed History</span>
        <h1 style={{ fontSize: "2.4rem", marginTop: 12 }}>
          {(TANK as any).copy?.foundationTitle || "The Foundation Wagyu"}
        </h1>
        <p className="muted" style={{ fontSize: "1.1rem", lineHeight: 1.7 }}>
          {(TANK as any).copy?.foundationIntro ||
            "Every full-blood Wagyu bred outside Japan descends from a small group of animals exported before Japan closed its borders in 1997. Below are the original import sires, sorted into the three Black bloodlines and the Akaushi Red line, then the influential sires bred outside Japan from imported parents. Tap any animal for its full history."}
        </p>
        <p style={{ marginTop: 10 }}>
          <Link href="/history" className="nav-link" style={{ paddingLeft: 0 }}>Read the full breed history →</Link>
        </p>
      </div>

      {loading ? (
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(230px,1fr))", marginTop: 28 }}>
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="card"><div className="lc-media" /></div>)}
        </div>
      ) : (
        <>
          <div className="section" style={{ paddingTop: 20 }}>
            <h2 style={{ fontSize: "1.5rem" }}>{isWagyu ? "Original import foundation sires" : "Foundation sires"}</h2>
            <p className="faint" style={{ maxWidth: "70ch", marginTop: 4 }}>
              {isWagyu
                ? "The bulls whose genetics were exported from Japan — grouped by bloodline, alphabetical within each."
                : "The bulls behind the breed — grouped by bloodline, alphabetical within each."}
            </p>
          </div>
          {grouped.map((g) => (
            <BloodlineGroup key={g.key} group={g} />
          ))}

          {domestic.length > 0 && (
            <div className="section" style={{ paddingTop: 12 }}>
              <div className="section-head" style={{ borderTop: "1px solid var(--border, #2a2a2a)", paddingTop: 22 }}>
                <h2 style={{ fontSize: "1.35rem" }}>
                  {isWagyu ? "Influential sires bred outside Japan" : "Influential home-bred sires"} <span className="faint" style={{ fontWeight: 400 }}>· {domestic.length}</span>
                </h2>
              </div>
              <p className="faint" style={{ maxWidth: "70ch", margin: "2px 0 16px" }}>
                {isWagyu
                  ? "Not Japan imports, but foundation-defining in their own right — full-bloods born abroad from imported parents, most out of the great World K's sire Haruki 2."
                  : "Not imports, but foundation-defining in their own right — bred at home from imported foundation parents."}
              </p>
              <FoundationCards animals={domestic} />
            </div>
          )}

          {cows.length > 0 && (
            <div className="section" style={{ paddingTop: 12 }}>
              <div className="section-head" style={{ borderTop: "1px solid var(--border, #2a2a2a)", paddingTop: 22 }}>
                <h2 style={{ fontSize: "1.35rem" }}>Foundation cows <span className="faint" style={{ fontWeight: 400 }}>· {cows.length}</span></h2>
              </div>
              <p className="faint" style={{ maxWidth: "70ch", margin: "2px 0 16px" }}>
                Two different breeds came out of Japan together. They are listed separately below and should not be blended: Japanese Black and Akaushi are distinct breeds, not colours of one.
              </p>
              {cowGroups.map((g) => (
                <div key={g.key} className="section" style={{ paddingTop: 6 }}>
                  <div className="section-head" style={{ alignItems: "baseline", flexWrap: "wrap", gap: 10 }}>
                    <h3 style={{ fontSize: "1.2rem" }}>
                      <span style={{ marginRight: 8 }}>{g.glyph}</span>{g.label}{" "}
                      <span className="faint" style={{ fontWeight: 400, fontSize: "0.9rem" }}>· {g.animals.length} {g.animals.length === 1 ? "dam" : "dams"}</span>
                    </h3>
                  </div>
                  <p className="faint" style={{ maxWidth: "70ch", margin: "2px 0 14px", fontSize: "0.9rem" }}>{g.blurb}</p>
                  <FoundationCards animals={g.animals} />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function BloodlineGroup({ group }: { group: any }) {
  return (
    <div className="section" style={{ paddingTop: 6 }}>
      <div className="section-head" style={{ alignItems: "baseline", flexWrap: "wrap", gap: 10 }}>
        <h3 style={{ fontSize: "1.2rem" }}>
          <span style={{ marginRight: 8 }}>{group.glyph}</span>{group.label}{" "}
          <span className="faint" style={{ fontWeight: 400, fontSize: "0.9rem" }}>· {group.animals.length} {group.animals.length === 1 ? "sire" : "sires"}</span>
        </h3>
        {group.follow && (
          <FollowButton targetType="bloodline" targetKey={group.follow} label={`${group.label} bloodline`} small />
        )}
      </div>
      <p className="faint" style={{ maxWidth: "70ch", margin: "2px 0 14px", fontSize: "0.9rem" }}>{group.blurb}</p>
      <FoundationCards animals={group.animals} />
    </div>
  );
}

function FoundationCards({ animals }: { animals: any[] }) {
  // Photo-less card seal = the brand's initials (wagyu ["WAGYU","TANK"] → "WT",
  // a clone ["GIR","TANK"] → "GT"). Never the hardcoded "WT".
  const wm = ((TANK as any).brand?.wordmark as string[] | undefined) || ["WAGYU", "TANK"];
  const seal = ((wm[0]?.[0] || "") + (wm[1]?.[0] || "")).toUpperCase() || "★";
  return (
    <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(230px,1fr))" }}>
      {animals.map((a) => (
        <Link key={a.id} href={(a.slug || a.registration_no) && /^[A-Za-z0-9._-]+$/.test(a.slug || a.registration_no)
          ? `/animal/${a.slug || a.registration_no}/`
          : `/animal?reg=${encodeURIComponent(a.registration_no || a.name)}`} className="card">
          <div className="lc-media">
            {a.photo_url ? (
              <img
                className="animal-photo animal-thumb"
                src={thumbUrl(a.photo_url)}
                alt={a.name}
                loading="lazy"
                onError={(e) => {
                  // no pre-cut thumbnail for this one — fall back to the full photo
                  const img = e.currentTarget;
                  if (img.src !== a.photo_url) img.src = a.photo_url;
                }}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div className="foundation-ph">
                <span className="fp-seal">{a.animal_type === "cow" ? "♀" : seal}</span>
                <span className="fp-name">{a.bloodline || a.breed || "Foundation"}</span>
                <span className="fp-note">{a.animal_type === "cow" ? "Foundation dam" : "Foundation sire"}</span>
              </div>
            )}
          </div>
          <div className="lc-body">
            <div className="row" style={{ gap: 6, marginBottom: 6 }}>
              {a.bloodline && <span className="pill pill-dim" style={{ fontSize: "0.65rem" }}>{a.bloodline}</span>}
            </div>
            <div className="lc-title">{a.name}</div>
            <div className="faint" style={{ fontSize: "0.8rem" }}>
              {a.registration_no ? `${a.registration_no} · ` : ""}
              {a.au_progeny ? `${a.au_progeny.toLocaleString()} AU progeny` : (a.importer || a.breed)}
            </div>
            {a.birth_country !== undefined && (
              <OriginLine a={a} className="faint" style={{ fontSize: "0.74rem", display: "block", marginTop: 3 }} />
            )}
            <BlendBar blend={a.blend} />
          </div>
        </Link>
      ))}
    </div>
  );
}
