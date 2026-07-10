"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "../../lib/api";
import UploadVideo from "../../components/UploadVideo";

function views(n: number | null): string {
  if (n == null) return "";
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M views`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(n >= 1e4 ? 0 : 1)}K views`;
  return `${n} views`;
}
function dur(s: number | null): string {
  if (!s) return "";
  const m = Math.floor(s / 60), sec = s % 60;
  return m >= 60 ? `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}:${String(sec).padStart(2, "0")}` : `${m}:${String(sec).padStart(2, "0")}`;
}

export function VideoCard({ v, rank }: { v: any; rank?: number }) {
  const delta = v.views != null && v.views_prev != null ? v.views - v.views_prev : null;
  return (
    <Link href={`/video?id=${v.id}`} className="card video-card">
      <div className="video-thumb">
        {v.thumbnail_url && <img src={v.thumbnail_url} alt={v.title} loading="lazy" />}
        {rank != null && <span className="video-rank">#{rank}{delta != null && delta !== 0 ? (delta > 0 ? " ▲" : " ▼") : ""}</span>}
        {v.duration != null && <span className="video-dur">{dur(v.duration)}</span>}
        {v.lang === "ja" && <span className="video-jp">🇯🇵</span>}
      </div>
      <div className="lc-body" style={{ padding: "10px 12px 12px" }}>
        <div className="lc-title" style={{ fontSize: "0.9rem", lineHeight: 1.35 }}>{v.title_en || v.title}</div>
        <div className="faint" style={{ fontSize: "0.76rem", marginTop: 4 }}>
          {v.channel}{v.views != null ? ` · ${views(v.views)}` : ""}
        </div>
        {v.matched_animal_reg && <span className="pill pill-dim" style={{ fontSize: "0.62rem", marginTop: 6 }}>🐂 {v.matched_animal_reg}</span>}
      </div>
    </Link>
  );
}

function TheaterInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const [charts, setCharts] = useState<any>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [qInput, setQInput] = useState("");
  const [showUpload, setShowUpload] = useState(false);

  const cat = sp.get("category") || "";
  const q = sp.get("q") || "";
  const view = sp.get("view") || (cat || q ? "browse" : "charts");

  useEffect(() => { api.videoCharts().then(setCharts).catch(() => setCharts(false)); }, []);
  useEffect(() => {
    if (view !== "browse") return;
    setLoading(true);
    api.videos({ category: cat, q, sort: sp.get("sort") || "views", limit: 60 })
      .then((d) => { setRows(d.videos); setTotal(d.total); }).catch(() => setRows([])).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp.toString()]);

  function setParam(k: string, v: string) {
    const p = new URLSearchParams(sp.toString());
    if (v) p.set(k, v); else p.delete(k);
    if (k !== "view") p.set("view", "browse");
    router.push(`/videos?${p.toString()}`);
  }

  const cats = charts?.categories || [];
  const stats = charts?.stats;

  return (
    <div className="container section">
      <span className="pill" style={{ background: "var(--gold-soft)", color: "var(--gold)", borderColor: "var(--gold)" }}>🎬 THE WAGYU THEATER</span>
      <h1 style={{ fontSize: "2.2rem", marginTop: 12 }}>Every Wagyu video, one place</h1>
      <div className="roundup-banner" style={{ maxWidth: "78ch", marginTop: 14 }}>
        <p className="muted" style={{ margin: 0, lineHeight: 1.7 }}>
          Foundation bulls and their sons on film. Auction recordings. Japanese farms and technique.
          Ranch tours and how-to. Gathered from across the web, organized, and <strong className="gold">searchable
          by registration number</strong> — type a reg and see the animal, or its ancestors, moving.
          {stats && <span className="faint"> {stats.total} videos · {stats.channels} channels · {stats.matched_animals} matched to registry animals · {stats.japanese} from Japan.</span>}
        </p>
      </div>

      <div className="row wrap" style={{ gap: 8, margin: "20px 0 8px" }}>
        <button className={`pill ${view === "charts" ? "" : "pill-dim"}`} style={{ cursor: "pointer" }}
          onClick={() => router.push("/videos")}>🏆 Top 100</button>
        {cats.map((c: any) => (
          <button key={c.key} className={`pill ${cat === c.key ? "" : "pill-dim"}`} style={{ cursor: "pointer" }}
            onClick={() => setParam("category", cat === c.key ? "" : c.key)}>{c.icon} {c.label}</button>
        ))}
        <div className="spacer" />
        <button className="btn btn-gold" onClick={() => setShowUpload(true)}>⬆ Share your video</button>
        <form onSubmit={(e) => { e.preventDefault(); setParam("q", qInput); }} className="row" style={{ gap: 6 }}>
          <input className="input" style={{ width: 210 }} placeholder="Search title or reg # …" value={qInput} onChange={(e) => setQInput(e.target.value)} />
          <button className="btn" type="submit">Search</button>
        </form>
      </div>

      {view === "charts" ? (
        charts === false ? <div className="adslot">The Theater is loading its first reels — check back shortly.</div>
        : !charts ? <div className="muted" style={{ marginTop: 20 }}>Loading the charts…</div>
        : (
          <>
            <h2 style={{ fontSize: "1.3rem", margin: "22px 0 12px" }}>🏆 The Wagyu Top 100 — all-time most watched</h2>
            <div className="grid video-grid">
              {charts.top100.slice(0, 24).map((v: any, i: number) => <VideoCard key={v.id} v={v} rank={i + 1} />)}
            </div>
            {Object.entries(charts.by_category).map(([key, vids]: any) => {
              const c = cats.find((x: any) => x.key === key);
              if (!c || !vids.length) return null;
              return (
                <div key={key} style={{ marginTop: 34 }}>
                  <div className="row" style={{ alignItems: "baseline" }}>
                    <h2 style={{ fontSize: "1.2rem", margin: 0 }}>{c.icon} {c.label}</h2>
                    <div className="spacer" />
                    <button className="gold" style={{ background: "none", border: "none", cursor: "pointer", font: "inherit", fontSize: "0.85rem" }}
                      onClick={() => setParam("category", key)}>See all →</button>
                  </div>
                  <div className="grid video-grid" style={{ marginTop: 12 }}>
                    {vids.slice(0, 4).map((v: any) => <VideoCard key={v.id} v={v} />)}
                  </div>
                </div>
              );
            })}
          </>
        )
      ) : loading ? (
        <div className="grid video-grid" style={{ marginTop: 20 }}>{Array.from({ length: 8 }).map((_, i) => <div key={i} className="card video-card"><div className="video-thumb skeleton" /></div>)}</div>
      ) : rows.length ? (
        <>
          <p className="faint" style={{ margin: "14px 0 10px", fontSize: "0.85rem" }}>{total} video{total === 1 ? "" : "s"}{q ? ` for “${q}”` : ""}</p>
          <div className="grid video-grid">{rows.map((v) => <VideoCard key={v.id} v={v} />)}</div>
        </>
      ) : (
        <div className="adslot" style={{ marginTop: 20 }}>Nothing found{q ? ` for “${q}”` : ""} — the harvest crawler keeps hunting. Try a bull's name or registration number.</div>
      )}
      {showUpload && <UploadVideo onClose={() => setShowUpload(false)} />}
    </div>
  );
}

export default function Theater() {
  return <Suspense fallback={<div className="container section">Loading…</div>}><TheaterInner /></Suspense>;
}
