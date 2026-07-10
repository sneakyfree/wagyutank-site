"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../../lib/api";
import { useLang, LANGUAGES, Lang } from "../../lib/i18n";

function Card({ a }: { a: any }) {
  return (
    <div className="card card-pad" style={{ borderTop: "3px solid var(--gold)" }}>
      <div className="row" style={{ alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
        {a.ono_rank && <span className="pill" style={{ fontSize: "0.66rem", background: "var(--gold-soft)", color: "var(--gold)", borderColor: "var(--gold)" }}>Ono #{a.ono_rank}</span>}
        <h3 style={{ margin: 0, fontSize: "1.2rem" }}>{a.name}</h3>
        {a.name_jp && <span className="faint" style={{ fontSize: "1rem" }}>{a.name_jp}</span>}
      </div>
      {a.epithet && <p className="gold" style={{ fontStyle: "italic", fontSize: "0.92rem", margin: "4px 0 8px" }}>“{a.epithet}”</p>}
      <div className="row wrap" style={{ gap: 6, marginBottom: 10 }}>
        {a.line && <span className="pill pill-dim" style={{ fontSize: "0.62rem" }}>{a.line}</span>}
        {a.prefecture && <span className="pill pill-dim" style={{ fontSize: "0.62rem" }}>{a.prefecture}</span>}
        {a.reg && <span className="pill pill-dim" style={{ fontSize: "0.62rem" }}>{a.reg}</span>}
        {a.era && <span className="pill pill-dim" style={{ fontSize: "0.62rem" }}>{a.era}</span>}
      </div>
      <p className="muted" style={{ fontSize: "0.92rem", lineHeight: 1.65, margin: 0 }}>{a.bio}</p>
      {(a.key_facts || []).length > 0 && (
        <ul className="stack" style={{ gap: 3, margin: "10px 0 0", paddingLeft: 18, fontSize: "0.84rem" }}>
          {a.key_facts.map((f: string, i: number) => <li key={i} className="faint">{f}</li>)}
        </ul>
      )}
      {a.registry_reg && (
        <Link href={`/animal?reg=${encodeURIComponent(a.registry_reg)}`} className="gold" style={{ fontSize: "0.85rem", display: "inline-block", marginTop: 10 }}>
          See {a.name} in the registry →
        </Link>
      )}
    </div>
  );
}

export default function Client() {
  const { lang: siteLang } = useLang();
  const [lang, setLang] = useState<Lang>(siteLang || "en");
  const [d, setD] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setLang(siteLang || "en"); }, [siteLang]);
  useEffect(() => {
    setLoading(true);
    api.canon(lang).then(setD).catch(() => setD(false)).finally(() => setLoading(false));
  }, [lang]);

  return (
    <div className="container section">
      <div className="row wrap" style={{ alignItems: "baseline" }}>
        <span className="pill" style={{ background: "rgba(188,64,64,0.12)", color: "#e08585", borderColor: "#a94444" }}>📖 THE CANON</span>
        <div className="spacer" />
        <div className="row" style={{ gap: 6, alignItems: "center" }}>
          <span className="faint" style={{ fontSize: "0.8rem" }}>Read in:</span>
          <select className="select" style={{ width: "auto" }} value={lang} onChange={(e) => setLang(e.target.value as Lang)} aria-label="Read in language">
            {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
          </select>
        </div>
      </div>
      <h1 className="display" style={{ fontSize: "2.4rem", marginTop: 10 }}>The Great Sires &amp; Dams of Japan</h1>
      <p className="muted" style={{ maxWidth: "76ch", lineHeight: 1.75, fontSize: "1.05rem" }}>
        The legendary animals whose blood built the breed — the bulls and cows Japan spent a century
        perfecting, and whose names run through the pedigree of nearly every fullblood on earth. This
        is WagyuTank's own reference to the canon: who they were, what they did, and where they sit in
        your herd's ancestry.
      </p>

      {loading && !d ? <div className="muted" style={{ marginTop: 20 }}>Loading the encyclopedia…</div>
      : d === false ? <div className="adslot">The encyclopedia is loading — check back shortly.</div>
      : (
        <>
          <div className="section" style={{ paddingBottom: 0 }}>
            <h2 style={{ fontSize: "1.5rem" }}>🐂 The Sires</h2>
            <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(330px,1fr))", gap: 16, marginTop: 8 }}>
              {(d.sires || []).map((a: any) => <Card key={a.name} a={a} />)}
            </div>
          </div>
          {(d.dams || []).length > 0 && (
            <div className="section" style={{ paddingBottom: 0 }}>
              <h2 style={{ fontSize: "1.5rem" }}>♀ The Dams</h2>
              <p className="muted" style={{ marginTop: 0, marginBottom: 12, fontSize: "0.92rem" }}>The great females — too often overlooked, and just as decisive.</p>
              <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(330px,1fr))", gap: 16 }}>
                {(d.dams || []).map((a: any) => <Card key={a.name} a={a} />)}
              </div>
            </div>
          )}

          {/* Attribution to Ono */}
          <div className="section">
            <div className="card card-pad" style={{ maxWidth: "80ch", borderColor: "var(--gold)" }}>
              <div className="faint" style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>🙏 With gratitude to the source</div>
              <p className="muted" style={{ lineHeight: 1.7, margin: 0 }}>{d.attribution}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
