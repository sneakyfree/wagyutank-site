"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api } from "../../../lib/api";
import { VideoCard } from "../../videos/Client";

function hostname(u: string) {
  try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return u; }
}

function EventInner() {
  const n = useSearchParams().get("n");
  const [d, setD] = useState<any>(null);
  useEffect(() => { if (n) api.zenkyoEvent(n).then(setD).catch(() => setD(false)); }, [n]);

  if (d === false) return <div className="container section"><h1>Zenkyo event not found</h1><Link href="/zenkyo" className="gold">← The Zenkyo Hall of Champions</Link></div>;
  if (!d) return <div className="container section">Loading the scrapbook…</div>;
  const e = d.event;
  const upcoming = e.year === 2027;

  return (
    <div className="container section" style={{ maxWidth: 900 }}>
      <Link href="/zenkyo" className="gold" style={{ fontSize: "0.85rem" }}>← The Zenkyo Hall of Champions</Link>

      {/* Header */}
      <div className="row wrap" style={{ alignItems: "baseline", gap: 12, marginTop: 12 }}>
        <span className="gold display" style={{ fontSize: "3rem", fontWeight: 700, lineHeight: 1 }}>{e.number}<span style={{ fontSize: "1.4rem" }}>{["th","st","nd","rd"][(e.number % 10 > 3 || [11,12,13].includes(e.number)) ? 0 : e.number % 10] || "th"}</span></span>
        <div>
          <h1 style={{ fontSize: "2rem", margin: 0 }}>The {e.year} Zenkyo</h1>
          <div className="muted">🇯🇵 {e.host_prefecture}{e.city ? ` · ${e.city}` : ""} · {e.dates}{upcoming && " · UPCOMING"}</div>
        </div>
      </div>
      {e.theme && <p className="gold" style={{ fontStyle: "italic", fontSize: "1.1rem", marginTop: 10 }}>“{e.theme}”</p>}

      {/* Winners */}
      {(e.breeding_winner || e.meat_winner) && (
        <div className="row wrap" style={{ gap: 16, marginTop: 16 }}>
          {e.breeding_winner && (
            <div className="card card-pad" style={{ flex: "1 1 240px", borderTop: "3px solid var(--gold)" }}>
              <div className="faint" style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>🐂 Breeding division (種牛) champion</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, marginTop: 4 }}>{e.breeding_winner}</div>
            </div>
          )}
          {e.meat_winner && (
            <div className="card card-pad" style={{ flex: "1 1 240px", borderTop: "3px solid #c86b4e" }}>
              <div className="faint" style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>🥩 Meat division (肉牛) champion</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, marginTop: 4 }}>{e.meat_winner}</div>
            </div>
          )}
        </div>
      )}
      {e.winning_breeder && (
        <p className="muted" style={{ marginTop: 12 }}>🏅 <strong>Winning exhibitor:</strong> {e.winning_breeder}</p>
      )}
      {e.champion_note && <p className="muted" style={{ marginTop: 4 }}>{e.champion_note}</p>}

      {/* Story */}
      {e.notable_facts && (
        <div className="section" style={{ paddingBottom: 0 }}>
          <h2 style={{ fontSize: "1.2rem" }}>The story</h2>
          <p className="muted" style={{ lineHeight: 1.75, maxWidth: "74ch" }}>{e.notable_facts}</p>
          {e.top_honors && <p className="gold" style={{ fontWeight: 600 }}>🥇 {e.top_honors}</p>}
        </div>
      )}

      {/* Champion sires tied to this event */}
      {d.champions?.length > 0 && (
        <div className="section" style={{ paddingBottom: 0 }}>
          <h2 style={{ fontSize: "1.2rem" }}>🐂 Champion sires of this Zenkyo</h2>
          <div className="stack" style={{ gap: 10 }}>
            {d.champions.map((c: any) => (
              <div key={c.name} className="card card-pad">
                <div style={{ fontWeight: 700 }}>{c.name} {c.name_jp && <span className="faint">{c.name_jp}</span>}</div>
                <div className="gold" style={{ fontSize: "0.85rem" }}>🏆 {c.zenkyo_record}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Videos */}
      {d.videos?.length > 0 && (
        <div className="section" style={{ paddingBottom: 0 }}>
          <h2 style={{ fontSize: "1.2rem" }}>🎬 On film</h2>
          <div className="grid video-grid">{d.videos.map((v: any) => <VideoCard key={v.id} v={v} />)}</div>
        </div>
      )}

      {/* Photo galleries — linked out, never rehosted */}
      {e.photo_links?.length > 0 && (
        <div className="section" style={{ paddingBottom: 0 }}>
          <h2 style={{ fontSize: "1.2rem" }}>📷 Photo galleries &amp; coverage</h2>
          <p className="muted" style={{ fontSize: "0.9rem", marginTop: 0 }}>Photographs live with their publishers — these links open the original galleries and reports.</p>
          <div className="stack" style={{ gap: 8 }}>
            {e.photo_links.map((u: string) => (
              <a key={u} href={u} target="_blank" rel="noopener noreferrer" className="card card-pad" style={{ display: "block" }}>
                <span className="gold">📷 {hostname(u)}</span> <span className="faint" style={{ fontSize: "0.82rem" }}>— open gallery ↗</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {upcoming && (
        <div className="section">
          <div className="card card-pad" style={{ borderColor: "var(--gold)" }}>
            <strong>Want to be there?</strong> <Link href="/zenkyo" className="gold">Register for the WagyuTank Delegation to Hokkaido 2027 →</Link>
          </div>
        </div>
      )}

      <p className="muted center" style={{ marginTop: 16 }}>
        <Link href="/zenkyo" className="gold">← Back to all Zenkyos</Link>
      </p>
    </div>
  );
}

export default function ZenkyoEventPage() {
  return <Suspense fallback={<div className="container section">Loading…</div>}><EventInner /></Suspense>;
}
