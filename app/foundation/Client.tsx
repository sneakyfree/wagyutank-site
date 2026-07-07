"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../../lib/api";
import FollowButton from "../../components/FollowButton";

const GLYPH: Record<string, string> = {
  Tajima: "🥩", "Fujiyoshi (Shimane)": "⚖️", "Kedaka (Tottori)": "📏",
  Itozakura: "🌸", "Kumamoto (Akaushi)": "🟥", Mixed: "🧬",
};

export default function Foundation() {
  const [bulls, setBulls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    api.foundation().then((all: any[]) => setBulls(all)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const bloodlines = Array.from(new Set(bulls.map((b) => b.bloodline).filter(Boolean))).sort();
  const shown = filter ? bulls.filter((b) => b.bloodline === filter) : bulls;
  const bullsOnly = shown.filter((b) => b.animal_type === "bull");
  const cows = shown.filter((b) => b.animal_type === "cow");

  return (
    <div className="container section">
      <div style={{ maxWidth: "70ch" }}>
        <span className="pill">Breed History</span>
        <h1 style={{ fontSize: "2.4rem", marginTop: 12 }}>The Foundation Wagyu</h1>
        <p className="muted" style={{ fontSize: "1.1rem", lineHeight: 1.7 }}>
          Every full-blood Wagyu bred outside Japan descends from a small group of animals exported
          before Japan closed its borders in 1997 — audited at 221 animals in total. These are the
          founders: the bulls and cows whose genetics built the breed across America, Australia, and
          the world. Tap any animal for its full history.
        </p>
        <p style={{ marginTop: 10 }}>
          <Link href="/history" className="nav-link" style={{ paddingLeft: 0 }}>Read the full breed history →</Link>
        </p>
      </div>

      <div className="row wrap" style={{ gap: 8, margin: "24px 0 20px" }}>
        <button className={`pill ${filter === "" ? "" : "pill-dim"}`} style={{ cursor: "pointer" }} onClick={() => setFilter("")}>
          All bloodlines
        </button>
        {bloodlines.map((b) => (
          <button key={b} className={`pill ${filter === b ? "" : "pill-dim"}`} style={{ cursor: "pointer" }} onClick={() => setFilter(b)}>
            {GLYPH[b] || "🧬"} {b}
          </button>
        ))}
      </div>
      {filter && (
        <div className="row" style={{ gap: 10, alignItems: "center", marginBottom: 20 }}>
          <span className="faint" style={{ fontSize: "0.85rem" }}>Get new {filter} listings in your feed:</span>
          <FollowButton targetType="bloodline" targetKey={filter as string} label={`${filter} bloodline`} small />
        </div>
      )}

      {loading ? (
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(230px,1fr))" }}>
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="card"><div className="lc-media" /></div>)}
        </div>
      ) : (
        <>
          <FoundationGrid label="Foundation bulls" animals={bullsOnly} />
          {cows.length > 0 && <FoundationGrid label="Foundation cows" animals={cows} />}
        </>
      )}
    </div>
  );
}

function FoundationGrid({ label, animals }: { label: string; animals: any[] }) {
  if (!animals.length) return null;
  return (
    <div className="section" style={{ paddingTop: 8 }}>
      <div className="section-head"><h2>{label} <span className="faint" style={{ fontWeight: 400 }}>· {animals.length}</span></h2></div>
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(230px,1fr))" }}>
        {animals.map((a) => (
          <Link key={a.id} href={(a.slug || a.registration_no) && /^[A-Za-z0-9._-]+$/.test(a.slug || a.registration_no)
            ? `/animal/${a.slug || a.registration_no}/`
            : `/animal?reg=${encodeURIComponent(a.registration_no || a.name)}`} className="card">
            <div className="lc-media">
              {a.photo_url ? (
                <img src={a.photo_url} alt={a.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span className="glyph">{GLYPH[a.bloodline] || "🐂"}</span>
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
    </div>
  );
}
