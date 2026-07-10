"use client";
import { useEffect, useState } from "react";
import { api, money } from "../lib/api";

// Per-bull price analytics — the "click a foundation sire → see the real numbers"
// panel. Shows the curated reference price (not the scrape average that conflates
// a foundation sire with cheap namesakes), the snapshot trend, and what this
// animal's genetics currently list for on the marketplace.
export default function PriceAnalytics({ reg, name }: { reg: string; name: string }) {
  const [d, setD] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (!reg) return;
    api.animalPriceHistory(reg).then(setD).catch(() => {}).finally(() => setLoaded(true));
  }, [reg]);

  if (!loaded || !d) return null;
  const ref = d.reference;
  const market = d.market || {};
  const hist = d.history || [];
  // Nothing verified and nothing on the market → don't render an empty box.
  if (!ref && !market.semen && !market.embryo) return null;

  const conf: Record<string, string> = { high: "Verified", medium: "Well-sourced", low: "Estimated" };
  return (
    <div className="section" style={{ paddingTop: 8 }}>
      <div className="section-head"><h2><span className="pill" style={{ background: "var(--gold-soft)", color: "var(--gold)", borderColor: "var(--gold)" }}>📊 {name} — genetics price analytics</span></h2></div>

      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 14, marginTop: 4 }}>
        {ref?.semen_usd != null && (
          <div className="card card-pad">
            <div className="faint" style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>Reference semen price</div>
            <div style={{ fontSize: "1.9rem", fontWeight: 800, marginTop: 4 }}>{money(ref.semen_usd)}<span className="faint" style={{ fontSize: "0.8rem", fontWeight: 500 }}> /straw</span></div>
            {(ref.semen_low != null && ref.semen_high != null) && <div className="faint" style={{ fontSize: "0.8rem" }}>range {money(ref.semen_low)}–{money(ref.semen_high)}</div>}
          </div>
        )}
        {ref?.embryo_usd != null && (
          <div className="card card-pad">
            <div className="faint" style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>Reference embryo price</div>
            <div style={{ fontSize: "1.9rem", fontWeight: 800, marginTop: 4 }}>{money(ref.embryo_usd)}<span className="faint" style={{ fontSize: "0.8rem", fontWeight: 500 }}> /embryo</span></div>
          </div>
        )}
        {market.semen && (
          <div className="card card-pad">
            <div className="faint" style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>On the market now</div>
            <div style={{ fontSize: "1.9rem", fontWeight: 800, marginTop: 4 }}>{money(market.semen.avg)}<span className="faint" style={{ fontSize: "0.8rem", fontWeight: 500 }}> avg</span></div>
            <div className="faint" style={{ fontSize: "0.8rem" }}>{market.semen.count} listing{market.semen.count === 1 ? "" : "s"} · {money(market.semen.min)}–{money(market.semen.max)}</div>
          </div>
        )}
      </div>

      {ref && (
        <p className="muted" style={{ marginTop: 14, fontSize: "0.9rem", maxWidth: "70ch" }}>
          {ref.availability && <><strong className="gold">{ref.availability}.</strong> </>}
          {ref.notes}
          {ref.source && <span className="faint"> — source: {ref.source}{ref.as_of_year ? `, ${ref.as_of_year}` : ""} · {conf[ref.confidence] || "Estimated"} reference.</span>}
        </p>
      )}
      {ref && market.semen && (ref.semen_usd || 0) > (market.semen.avg || 0) * 3 && (
        <p className="faint" style={{ fontSize: "0.82rem", marginTop: 6, maxWidth: "70ch" }}>
          Note: cheaper straws listed under this name are typically from <em>descendants</em> that carry the sire's name — not the original foundation bull, whose limited straws command the reference price above.
        </p>
      )}

      {hist.length >= 2 && (
        <div className="card card-pad" style={{ marginTop: 14, maxWidth: 640 }}>
          <div className="faint" style={{ fontSize: "0.78rem", marginBottom: 8 }}>Reference-price trend</div>
          <Spark points={hist.map((h: any) => h.price)} />
        </div>
      )}
    </div>
  );
}

function Spark({ points }: { points: number[] }) {
  if (points.length < 2) return null;
  const w = 600, h = 60, max = Math.max(...points), min = Math.min(...points);
  const rng = max - min || 1;
  const path = points.map((p, i) => `${(i / (points.length - 1)) * w},${h - ((p - min) / rng) * (h - 8) - 4}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: "100%", height: 60 }}>
      <polyline points={path} fill="none" stroke="var(--gold)" strokeWidth={2} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
