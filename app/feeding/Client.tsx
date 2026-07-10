"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../../lib/api";
import { useLang, LANGUAGES, Lang } from "../../lib/i18n";
import { VideoCard } from "../videos/Client";
import Discussion from "../../components/Discussion";

function Topic({ t }: { t: any }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <button onClick={() => setOpen((o) => !o)} className="card-pad" style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", color: "inherit" }}>
        <div className="row" style={{ gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: "1.6rem" }}>{t.icon}</span>
          <h3 style={{ margin: 0, fontSize: "1.15rem", flex: 1 }}>{t.title}</h3>
          <span className="gold" style={{ fontSize: "1.2rem" }}>{open ? "–" : "+"}</span>
        </div>
        {!open && (t.key_points || []).length > 0 && (
          <div className="faint" style={{ fontSize: "0.85rem", marginTop: 8, marginLeft: 40 }}>{t.key_points[0]}</div>
        )}
      </button>
      {open && (
        <div className="card-pad" style={{ paddingTop: 0 }}>
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
            {(t.body || "").split(/\n\n+/).map((p: string, i: number) => (
              <p key={i} className="muted" style={{ lineHeight: 1.75, fontSize: "0.97rem" }}>{p}</p>
            ))}
            {(t.key_points || []).length > 0 && (
              <div className="card card-pad" style={{ marginTop: 12, background: "var(--bg-elev)" }}>
                <div className="faint" style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Key points</div>
                <ul className="stack" style={{ gap: 5, margin: 0, paddingLeft: 18 }}>
                  {t.key_points.map((k: string, i: number) => <li key={i} className="muted" style={{ fontSize: "0.9rem" }}>{k}</li>)}
                </ul>
              </div>
            )}
            {(t.sources || []).length > 0 && (
              <p className="help" style={{ marginTop: 10 }}>Sources: {t.sources.map((u: string, i: number) => (
                <a key={i} href={u} target="_blank" rel="noopener noreferrer" className="gold">[{i + 1}]</a>
              )).reduce((prev: any, curr: any) => [prev, " ", curr])}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Client() {
  const { lang: siteLang } = useLang();
  const [lang, setLang] = useState<Lang>(siteLang || "en");
  const [d, setD] = useState<any>(null);
  useEffect(() => { setLang(siteLang || "en"); }, [siteLang]);
  useEffect(() => { api.feeding(lang).then(setD).catch(() => setD(false)); }, [lang]);

  return (
    <div className="container section">
      <div className="row wrap" style={{ alignItems: "baseline" }}>
        <span className="pill" style={{ background: "rgba(188,64,64,0.12)", color: "#e08585", borderColor: "#a94444" }}>🌾 THE ART OF FEEDING</span>
        <div className="spacer" />
        <div className="row" style={{ gap: 6, alignItems: "center" }}>
          <span className="faint" style={{ fontSize: "0.8rem" }}>Read in:</span>
          <select className="select" style={{ width: "auto" }} value={lang} onChange={(e) => setLang(e.target.value as Lang)} aria-label="Read in language">
            {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
          </select>
        </div>
      </div>
      <h1 className="display" style={{ fontSize: "2.4rem", marginTop: 10 }}>The Art of Feeding Wagyu</h1>
      <p className="muted" style={{ maxWidth: "76ch", lineHeight: 1.75, fontSize: "1.05rem" }}>
        {d && d !== false ? d.intro : "Great Wagyu is made as much in the feed bunk as in the genes."}
      </p>
      <div className="card card-pad" style={{ maxWidth: "76ch", marginTop: 10, borderLeft: "3px solid var(--gold)" }}>
        <p className="muted" style={{ margin: 0, fontSize: "0.92rem", lineHeight: 1.6 }}>
          <strong className="gold">Straight talk:</strong> most Wagyu breeders outside Japan are new, and many haven't
          finished a carcass yet. If your ribeyes don't look like the photos, it's almost never the genetics —
          it's the feed program. Here is the documented science, honestly told.
        </p>
      </div>

      {d === false ? <div className="adslot" style={{ marginTop: 20 }}>Loading the feeding guide…</div>
      : !d ? <div className="muted" style={{ marginTop: 20 }}>Loading…</div>
      : (
        <>
          <div className="section" style={{ paddingBottom: 0 }}>
            <h2 style={{ fontSize: "1.5rem" }}>The fundamentals</h2>
            <p className="muted" style={{ marginTop: 0, marginBottom: 14, fontSize: "0.92rem" }}>Tap any topic to open the full explainer.</p>
            <div className="stack" style={{ gap: 12 }}>
              {(d.topics || []).map((t: any) => <Topic key={t.slug} t={t} />)}
            </div>
          </div>

          {d.japanese_note && (
            <div className="section" style={{ paddingBottom: 0 }}>
              <div className="card card-pad" style={{ borderColor: "var(--gold)", maxWidth: "80ch" }}>
                <div className="faint" style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>🔒 On the “secret” rations</div>
                <p className="muted" style={{ margin: 0, lineHeight: 1.7 }}>{d.japanese_note}</p>
              </div>
            </div>
          )}

          {(d.videos || []).length > 0 && (
            <div className="section" style={{ paddingBottom: 0 }}>
              <div className="section-head">
                <h2>🎬 Feeding, on film</h2>
                <div className="spacer" />
                <Link href="/videos?q=feeding" className="nav-link">More →</Link>
              </div>
              <p className="muted" style={{ marginTop: -8, marginBottom: 14, fontSize: "0.92rem" }}>Feed barns, rations, and finishing — including footage from Japan, titles translated.</p>
              <div className="grid video-grid">{d.videos.map((v: any) => <VideoCard key={v.id} v={v} />)}</div>
            </div>
          )}

          {/* The moat: a worldwide feeding Q&A, every reader in their own language */}
          <Discussion reg="topic:feeding" name="Wagyu feeding" />
        </>
      )}
    </div>
  );
}
