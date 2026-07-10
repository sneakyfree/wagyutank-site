"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api } from "../../lib/api";
import { VideoCard } from "../videos/Client";
import Discussion from "../../components/Discussion";

// The canonical WagyuTank page for a video — the embed is an implementation
// detail (YouTube today, native player later); the URL, context, and community
// layer are ours.
function VideoInner() {
  const id = useSearchParams().get("id");
  const [v, setV] = useState<any>(null);
  useEffect(() => {
    if (id) api.video(id).then(setV).catch(() => setV(false));
  }, [id]);

  if (v === false) return <div className="container section"><h1>Video not found</h1><p className="muted"><Link href="/videos" className="gold">← Back to the Theater</Link></p></div>;
  if (!v) return <div className="container section">Loading…</div>;

  return (
    <div className="container section">
      <Link href="/videos" className="gold" style={{ fontSize: "0.85rem" }}>← The Wagyu Theater</Link>
      <div className="row wrap" style={{ gap: 28, marginTop: 14, alignItems: "flex-start" }}>
        <div style={{ flex: "1 1 560px", minWidth: 300 }}>
          <div className="card" style={{ overflow: "hidden" }}>
            <div style={{ aspectRatio: "16/9", background: "#000" }}>
              {v.source === "native" ? (
                <video controls preload="metadata" style={{ width: "100%", height: "100%" }} src={v.embed_url} />
              ) : (
                <iframe src={v.embed_url} title={v.title} style={{ width: "100%", height: "100%", border: 0 }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              )}
            </div>
          </div>
          <h1 style={{ fontSize: "1.5rem", marginTop: 16, lineHeight: 1.3 }}>{v.title_en || v.title}</h1>
          {v.title_en && v.title_en !== v.title && <p className="faint" style={{ marginTop: 2 }}>{v.title}</p>}
          <div className="row wrap" style={{ gap: 8, marginTop: 8 }}>
            {v.lang === "ja" && <span className="pill roundup-pill">🇯🇵 From Japan</span>}
            <span className="pill pill-dim">{v.category}</span>
            {v.source === "native" && <span className="pill" style={{ background: "var(--gold-soft)", color: "var(--gold)", borderColor: "var(--gold)", fontSize: "0.64rem" }}>⬆ Uploaded on WagyuTank</span>}
            <span className="faint" style={{ fontSize: "0.85rem", alignSelf: "center" }}>
              {v.claimed_by_handle
                ? <Link href={`/u?handle=${v.claimed_by_handle}`} className="gold">✓ {v.channel} · @{v.claimed_by_handle}</Link>
                : <>{v.channel}</>}{v.views != null ? ` · ${v.views.toLocaleString()} views` : ""}
            </span>
          </div>
          {v.editorial && (
            <div className="card card-pad" style={{ marginTop: 16, borderColor: "var(--gold)", maxWidth: "74ch" }}>
              <div className="faint" style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>🖋 WagyuTank notes</div>
              <p className="muted" style={{ margin: 0, lineHeight: 1.7 }}>{v.editorial}</p>
            </div>
          )}
          {v.description && <p className="muted" style={{ marginTop: 14, lineHeight: 1.7, maxWidth: "72ch", whiteSpace: "pre-wrap" }}>{v.description}</p>}
          {v.source === "youtube" && v.video_id && (
            <p className="help" style={{ marginTop: 10 }}>
              Playing via YouTube — the creator keeps every view.{" "}
              <a href={`https://www.youtube.com/watch?v=${v.video_id}`} target="_blank" rel="noopener noreferrer" className="gold">Watch on YouTube ↗</a>
            </p>
          )}
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org", "@type": "VideoObject",
            name: v.title_en || v.title, description: (v.editorial || v.description || v.title || "").slice(0, 300),
            thumbnailUrl: v.thumbnail_url, uploadDate: v.published_at || v.first_seen_at,
            embedUrl: v.embed_url, interactionCount: v.views || undefined,
          }) }} />
          {v.source === "youtube" && !v.claimed_by_handle && <ClaimChannel v={v} />}
          <Discussion reg={`video:${v.id}`} name="this video" />
        </div>

        <div style={{ flex: "1 1 280px", minWidth: 260 }}>
          {(v.matched_animal_reg || (v.matched_regs || []).length > 0) && (
            <div className="card card-pad" style={{ marginBottom: 16 }}>
              <div className="faint" style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>🐂 Animals in this video</div>
              {v.matched_animal_reg && (
                <Link href={`/animal?reg=${encodeURIComponent(v.matched_animal_reg)}`} className="btn btn-block" style={{ marginBottom: 8, textAlign: "center" }}>
                  View {v.matched_animal_reg} in the registry →
                </Link>
              )}
              {(v.matched_regs || []).filter((r: string) => r !== v.matched_animal_reg).map((r: string) => (
                <div key={r} className="kv"><span className="k">Reg found</span><span className="mono" style={{ fontFamily: "monospace" }}>{r}</span></div>
              ))}
              <p className="help" style={{ marginTop: 8 }}>Registration numbers found in this video are permanently indexed — search any reg in the Theater to find footage of an animal or its ancestors.</p>
            </div>
          )}
          {v.sale && (
            <div className="card card-pad" style={{ marginBottom: 16 }}>
              <div className="faint" style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>🏆 Sale recording</div>
              <div style={{ fontWeight: 700 }}>{v.sale.sale_name} {v.sale.year}</div>
              <Link href="/sale-reports" className="gold" style={{ fontSize: "0.85rem" }}>See this sale's results →</Link>
            </div>
          )}
          {(v.related || []).length > 0 && (
            <>
              <div className="faint" style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.06em", margin: "4px 0 10px" }}>More like this</div>
              <div className="stack" style={{ gap: 12 }}>
                {v.related.map((r: any) => <VideoCard key={r.id} v={r} />)}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ClaimChannel({ v }: { v: any }) {
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  if (!v.channel_id && !v.channel) return null;
  async function claim() {
    setBusy(true);
    try { const r = await api.claimChannel(v.channel_id || v.channel, v.channel); setMsg(r.message); }
    catch (e: any) { setMsg(e.message === "Not authenticated" ? "Sign in first, then claim your channel from this page." : e.message); }
    finally { setBusy(false); }
  }
  return (
    <div className="card card-pad" style={{ marginTop: 16, maxWidth: "74ch" }}>
      {msg ? <p className="muted" style={{ margin: 0 }}>{msg}</p> : (
        <div className="row wrap" style={{ gap: 10, alignItems: "center" }}>
          <span className="muted" style={{ fontSize: "0.9rem" }}>Is <b>{v.channel}</b> your channel? Link it to your WagyuTank profile — your videos, listings, and ranch page become one.</span>
          <div className="spacer" />
          <button className="btn" disabled={busy} onClick={claim}>✓ Claim this channel</button>
        </div>
      )}
    </div>
  );
}

export default function VideoPage() {
  return <Suspense fallback={<div className="container section">Loading…</div>}><VideoInner /></Suspense>;
}
