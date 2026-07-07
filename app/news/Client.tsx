"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "../../lib/api";

const REGIONS = [
  { code: "", label: "🌍 All" },
  { code: "US", label: "🇺🇸 United States" },
  { code: "AU", label: "🇦🇺 Australia" },
  { code: "JP", label: "🇯🇵 Japan (translated)" },
  { code: "EU", label: "🇪🇺 Europe" },
  { code: "SA", label: "🌎 South America" },
];
const FLAG: Record<string, string> = { US: "🇺🇸", AU: "🇦🇺", JP: "🇯🇵", EU: "🇪🇺", SA: "🌎", OTHER: "🌍" };

function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function NewsInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const region = sp.get("region") || "";
  const [rows, setRows] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.newsRegions().then(setStats).catch(() => {}); }, []);
  useEffect(() => {
    setLoading(true);
    api.news({ region, limit: 60 }).then(setRows).catch(() => setRows([])).finally(() => setLoading(false));
  }, [region]);

  function setRegion(r: string) {
    const p = new URLSearchParams(sp.toString());
    if (r) p.set("region", r); else p.delete("region");
    router.push(`/news?${p.toString()}`);
  }

  return (
    <div className="container section">
      <span className="pill roundup-pill">📰 The Wagyu Wire</span>
      <h1 style={{ fontSize: "2.2rem", marginTop: 12 }}>Wagyu news from around the world</h1>
      <div className="roundup-banner" style={{ maxWidth: "76ch", marginTop: 14 }}>
        <p className="muted" style={{ margin: 0, lineHeight: 1.7 }}>
          The latest Wagyu reporting from the US, Australia, Europe, and South America — plus
          something you'll find nowhere else in English: <strong className="gold">Japanese Wagyu
          news, translated.</strong> Read what the breeders who built the breed are actually saying.
          {stats && <span className="faint"> {stats.total} stories · {stats.translated} translated.</span>}
        </p>
      </div>

      <div className="row wrap" style={{ gap: 8, margin: "20px 0" }}>
        {REGIONS.map((r) => (
          <button key={r.code} className={`pill ${region === r.code ? "" : "pill-dim"}`} style={{ cursor: "pointer" }}
            onClick={() => setRegion(r.code)}>
            {r.label}{stats?.counts?.[r.code] ? ` (${stats.counts[r.code]})` : ""}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="stack">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="card card-pad"><div className="skeleton" style={{ width: "80%" }} /></div>)}</div>
      ) : rows.length ? (
        <div className="stack" style={{ gap: 12 }}>
          {rows.map((a) => (
            <a key={a.id} href={api.newsGoUrl(a.id)} target="_blank" rel="noopener noreferrer" className="card card-pad news-item">
              <div className="row wrap" style={{ gap: 8, marginBottom: 6 }}>
                <span className="news-region">{FLAG[a.region] || "🌍"} {a.region}</span>
                {a.is_translated && <span className="pill roundup-pill" style={{ fontSize: "0.64rem" }}>🌐 Translated</span>}
                <span className="faint" style={{ fontSize: "0.76rem" }}>{a.source_name} · {timeAgo(a.published_at)}</span>
              </div>
              <div className="news-title">{a.title}</div>
              {a.original_title && a.is_translated && <div className="faint news-orig">{a.original_title}</div>}
            </a>
          ))}
        </div>
      ) : (
        <div className="adslot">No stories yet — the news crawler is warming up.</div>
      )}
    </div>
  );
}

export default function News() {
  return <Suspense fallback={<div className="container section">Loading…</div>}><NewsInner /></Suspense>;
}
