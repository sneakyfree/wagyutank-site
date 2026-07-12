"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../../lib/api";
import FollowButton from "../../components/FollowButton";

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
  { key: "Akaushi", label: "Akaushi — Japanese Red", glyph: "🟥",
    blurb: "A separate red breed from Kumamoto, imported alongside the Blacks. Rueshaw and Judo lead this line.",
    follow: "Kumamoto (Akaushi)" },
  { key: "Mixed", label: "Mixed / Multi-line", glyph: "🧬",
    blurb: "Founders that deliberately blend two or more lines — prized as outcrosses that add growth without losing marbling.",
    follow: null },
];

function groupOf(bloodline: string | null | undefined): string {
  const b = (bloodline || "").toLowerCase();
  if (b.startsWith("tajima")) return "Tajima";
  if (b.includes("shimane") || b.includes("fujiyoshi") || b.startsWith("itozakura")) return "Shimane";
  if (b.includes("kedaka") || b.includes("tottori")) return "Kedaka";
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

  const allBulls = bulls.filter((b) => b.animal_type === "bull");
  const cows = bulls.filter((b) => b.animal_type === "cow").sort(byName);
  const imports = allBulls.filter((b) => !b.bred_outside_japan);
  const domestic = allBulls.filter((b) => b.bred_outside_japan).sort(byName);

  const grouped = GROUPS
    .map((g) => ({ ...g, animals: imports.filter((b) => groupOf(b.bloodline) === g.key).sort(byName) }))
    .filter((g) => g.animals.length > 0);

  return (
    <div className="container section">
      <div style={{ maxWidth: "72ch" }}>
        <span className="pill">Breed History</span>
        <h1 style={{ fontSize: "2.4rem", marginTop: 12 }}>The Foundation Wagyu</h1>
        <p className="muted" style={{ fontSize: "1.1rem", lineHeight: 1.7 }}>
          Every full-blood Wagyu bred outside Japan descends from a small group of animals exported
          before Japan closed its borders in 1997. Below are the original import sires, sorted into the
          three Black bloodlines and the Akaushi Red line, then the influential sires bred outside Japan
          from imported parents. Tap any animal for its full history.
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
            <h2 style={{ fontSize: "1.5rem" }}>Original import foundation sires</h2>
            <p className="faint" style={{ maxWidth: "70ch", marginTop: 4 }}>
              The bulls whose genetics were exported from Japan — grouped by bloodline, alphabetical within each.
            </p>
          </div>
          {grouped.map((g) => (
            <BloodlineGroup key={g.key} group={g} />
          ))}

          {domestic.length > 0 && (
            <div className="section" style={{ paddingTop: 12 }}>
              <div className="section-head" style={{ borderTop: "1px solid var(--border, #2a2a2a)", paddingTop: 22 }}>
                <h2 style={{ fontSize: "1.35rem" }}>
                  Influential sires bred outside Japan <span className="faint" style={{ fontWeight: 400 }}>· {domestic.length}</span>
                </h2>
              </div>
              <p className="faint" style={{ maxWidth: "70ch", margin: "2px 0 16px" }}>
                Not Japan imports, but foundation-defining in their own right — full-bloods born abroad from
                imported parents, most out of the great World K's sire Haruki 2.
              </p>
              <FoundationCards animals={domestic} />
            </div>
          )}

          {cows.length > 0 && (
            <div className="section" style={{ paddingTop: 12 }}>
              <div className="section-head" style={{ borderTop: "1px solid var(--border, #2a2a2a)", paddingTop: 22 }}>
                <h2 style={{ fontSize: "1.35rem" }}>Foundation cows <span className="faint" style={{ fontWeight: 400 }}>· {cows.length}</span></h2>
              </div>
              <FoundationCards animals={cows} />
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
  return (
    <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(230px,1fr))" }}>
      {animals.map((a) => (
        <Link key={a.id} href={(a.slug || a.registration_no) && /^[A-Za-z0-9._-]+$/.test(a.slug || a.registration_no)
          ? `/animal/${a.slug || a.registration_no}/`
          : `/animal?reg=${encodeURIComponent(a.registration_no || a.name)}`} className="card">
          <div className="lc-media">
            {a.photo_url ? (
              <img className="animal-photo" src={a.photo_url} alt={a.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div className="foundation-ph">
                <span className="fp-seal">{a.animal_type === "cow" ? "♀" : "WT"}</span>
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
          </div>
        </Link>
      ))}
    </div>
  );
}
