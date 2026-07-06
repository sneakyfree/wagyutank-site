"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api, money } from "../lib/api";

// The Wagyu Genetics Price Index — a live, scrolling "stock ticker" of semen prices,
// computed from Roundup listings. Ownable data nobody else publishes.
export default function PriceTicker() {
  const [d, setD] = useState<any>(null);
  useEffect(() => { api.priceIndex().then(setD).catch(() => {}); }, []);
  if (!d || (!d.market.semen_avg && !d.sires.length)) return null;

  const arrow = (t: number | null) =>
    t == null ? <span className="tk-flat">•</span>
      : t > 0 ? <span className="tk-up">▲ {Math.abs(t)}%</span>
        : t < 0 ? <span className="tk-down">▼ {Math.abs(t)}%</span> : <span className="tk-flat">– 0%</span>;

  const items: any[] = [];
  if (d.market.semen_avg) items.push(
    <span className="tk-item tk-market" key="mkt">
      <b>WAGYU SEMEN INDEX</b> {money(d.market.semen_avg)}<span className="tk-unit">/straw avg</span> {arrow(d.market.trend)}
    </span>);
  d.sires.forEach((s: any, i: number) => items.push(
    <span className="tk-item" key={i}>
      <b>{s.sire}</b> {money(s.avg)} {arrow(s.trend)} <span className="tk-unit">({s.count})</span>
    </span>));
  if (d.market.embryo_avg) items.push(
    <span className="tk-item" key="emb"><b>EMBRYOS</b> {money(d.market.embryo_avg)} <span className="tk-unit">avg ({d.market.embryo_count})</span></span>);

  return (
    <Link href="/roundup" className="ticker" title="Wagyu Genetics Price Index — from live Roundup listings">
      <span className="ticker-badge">📈 PRICE INDEX</span>
      <div className="ticker-track">
        <div className="ticker-run">{items}{items}</div>
      </div>
    </Link>
  );
}
