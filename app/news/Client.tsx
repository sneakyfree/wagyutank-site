"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "../../lib/api";
import { useLang } from "../../lib/i18n";

const REGIONS = [
  { code: "", label: "🌍 All" },
  { code: "US", label: "🇺🇸 United States" },
  { code: "AU", label: "🇦🇺 Australia" },
  { code: "JP", label: "🇯🇵 Japan" },
  { code: "AS", label: "🇨🇳 Asia" },
  { code: "EU", label: "🇪🇺 Europe" },
  { code: "SA", label: "🌎 South America" },
];
const FLAG: Record<string, string> = { US: "🇺🇸", AU: "🇦🇺", JP: "🇯🇵", AS: "🇨🇳", EU: "🇪🇺", SA: "🌎", OTHER: "🌍" };
const WINDOWS = [
  { code: "", label: "Latest" }, { code: "day", label: "Today" }, { code: "week", label: "This week" },
  { code: "month", label: "This month" }, { code: "year", label: "This year" },
];

function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

// Translate a headline into the active language on demand (cached server-side).
function useTranslated(rows: any[], lang: string) {
  const [map, setMap] = useState<Record<number, string>>({});
  useEffect(() => {
    if (lang === "en" || !rows.length) { setMap({}); return; }
    let alive = true;
    (async () => {
      const out: Record<number, string> = {};
      await Promise.all(rows.slice(0, 40).map(async (a) => {
        try { const r = await api.translate(a.title, lang); if (r?.text) out[a.id] = r.text; } catch {}
      }));
      if (alive) setMap(out);
    })();
    return () => { alive = false; };
  }, [rows, lang]);
  return map;
}

function NewsInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const { lang } = useLang();
  const region = sp.get("region") || "";
  const window = sp.get("window") || "";
  const year = sp.get("year") || "";
  const trending = window !== "" || sp.get("sort") === "trending";
  const [rows, setRows] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [highlights, setHighlights] = useState<any>(null);
  const [years, setYears] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const translated = useTranslated(rows, lang);

  useEffect(() => {
    api.newsRegions().then(setStats).catch(() => {});
    api.newsHighlights().then(setHighlights).catch(() => {});
    api.newsYears().then((d: any) => setYears(d.years || [])).catch(() => {});
  }, []);
  useEffect(() => {
    setLoading(true);
    api.news({ region, window, year, sort: trending ? "trending" : "recent", limit: 60 })
      .then(setRows).catch(() => setRows([])).finally(() => setLoading(false));
  }, [region, window, year, trending]);

  function setParam(k: string, v: string) {
    const p = new URLSearchParams(sp.toString());
    if (v) p.set(k, v); else p.delete(k);
    if (k === "window") p.delete("year");
    if (k === "year") p.delete("window");
    router.push(`/news?${p.toString()}`);
  }

  return (
    <div className="container section">
      <span className="pill roundup-pill">📰 The Wagyu Wire</span>
      <h1 style={{ fontSize: "2.2rem", marginTop: 12 }}>Wagyu news from around the world</h1>
      <div className="roundup-banner" style={{ maxWidth: "78ch", marginTop: 14 }}>
        <p className="muted" style={{ margin: 0, lineHeight: 1.7 }}>
          The latest Wagyu reporting from the US, Australia, Japan, Asia, Europe, and South America —
          plus <strong className="gold">Japanese and Chinese reporting translated</strong>, found nowhere
          else. Switch the site language (top right) to read every headline in your language.
          {stats && <span className="faint"> {stats.total} stories · {stats.translated} translated.</span>}
        </p>
      </div>

      {/* Auto-generated highlights synthesis */}
      {highlights?.bullets?.length > 0 && (
        <div className="card card-pad highlights-card">
          <div className="ad-tag">✨ The state of world Wagyu — auto-synthesis</div>
          <ul className="highlights-list">
            {highlights.bullets.map((b: string, i: number) => <li key={i}>{b}</li>)}
          </ul>
        </div>
      )}

      {/* Time window + trending */}
      <div className="row wrap" style={{ gap: 8, margin: "20px 0 8px", alignItems: "center" }}>
        <span className="faint" style={{ fontSize: "0.82rem" }}>🔥 Trending:</span>
        {WINDOWS.map((w) => (
          <button key={w.code} className={`pill ${window === w.code && !year ? "" : "pill-dim"}`} style={{ cursor: "pointer" }}
            onClick={() => setParam("window", w.code)}>{w.label}</button>
        ))}
        {years.length > 0 && (
          <select className="select" style={{ width: "auto" }} value={year} onChange={(e) => setParam("year", e.target.value)}>
            <option value="">By year…</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        )}
      </div>

      {/* Region */}
      <div className="row wrap" style={{ gap: 8, marginBottom: 20 }}>
        {REGIONS.map((r) => (
          <button key={r.code} className={`pill ${region === r.code ? "" : "pill-dim"}`} style={{ cursor: "pointer" }}
            onClick={() => setParam("region", r.code)}>
            {r.label}{stats?.counts?.[r.code] ? ` (${stats.counts[r.code]})` : ""}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="stack">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="card card-pad"><div className="skeleton" style={{ width: "80%" }} /></div>)}</div>
      ) : rows.length ? (
        <div className="stack" style={{ gap: 12 }}>
          {rows.map((a, i) => (
            <a key={a.id} href={api.newsGoUrl(a.id)} target="_blank" rel="noopener noreferrer" className="card card-pad news-item">
              <div className="row wrap" style={{ gap: 8, marginBottom: 6 }}>
                {trending && <span className="news-rank">#{i + 1}</span>}
                <span className="news-region">{FLAG[a.region] || "🌍"} {a.region}</span>
                {a.is_translated && <span className="pill roundup-pill" style={{ fontSize: "0.64rem" }}>🌐 Translated</span>}
                <span className="faint" style={{ fontSize: "0.76rem" }}>{a.source_name} · {timeAgo(a.published_at)}{a.clicks ? ` · ${a.clicks} reads` : ""}</span>
              </div>
              <div className="news-title">{translated[a.id] || a.title}</div>
              {translated[a.id] && a.title !== translated[a.id] && <div className="faint news-orig">{a.title}</div>}
              {!translated[a.id] && a.original_title && a.is_translated && <div className="faint news-orig">{a.original_title}</div>}
            </a>
          ))}
        </div>
      ) : (
        <div className="adslot">No stories in this window yet — the archive builds over time as the crawler runs.</div>
      )}
    </div>
  );
}

export default function News() {
  return <Suspense fallback={<div className="container section">Loading…</div>}><NewsInner /></Suspense>;
}
