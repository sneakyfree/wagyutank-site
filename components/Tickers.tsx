"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api, money } from "../lib/api";

function arrow(t: number | null | undefined) {
  if (t == null) return null;
  return t > 0 ? <span className="tk-up">▲ {Math.abs(t)}%</span>
    : t < 0 ? <span className="tk-down">▼ {Math.abs(t)}%</span> : <span className="tk-flat">–</span>;
}

function Band({ badge, href, items, title, accent }: {
  badge: string; href: string; items: React.ReactNode[]; title: string; accent?: string;
}) {
  if (!items.length) return null;
  return (
    <Link href={href} className="ticker" title={title}>
      <span className="ticker-badge" style={accent ? { background: accent } : undefined}>{badge}</span>
      <div className="ticker-track"><div className="ticker-run">{items}{items}</div></div>
    </Link>
  );
}

export default function Tickers() {
  const [genetics, setGenetics] = useState<any>(null);
  const [beef, setBeef] = useState<any[]>([]);
  const [saleData, setSaleData] = useState<any[]>([]);

  useEffect(() => {
    api.priceIndex().then(setGenetics).catch(() => {});
    api.marketTicker().then((d: any) => setBeef(d.items || [])).catch(() => {});
    api.saleTicker().then((d: any) => setSaleData(d.items || [])).catch(() => {});
  }, []);

  // Band 1 — genetics price index (semen)
  const g: React.ReactNode[] = [];
  if (genetics?.market?.semen_avg) {
    g.push(<span className="tk-item tk-market" key="g0"><b>WAGYU SEMEN INDEX</b> {money(genetics.market.semen_avg)}<span className="tk-unit">/straw</span> {arrow(genetics.market.trend)}</span>);
    (genetics.sires || []).forEach((s: any, i: number) =>
      g.push(<span className="tk-item" key={`g${i + 1}`}><b>{s.sire}</b> {money(s.avg)} {arrow(s.trend)}</span>));
  }

  // Band 2 — beef market
  const b = beef.map((it, i) => (
    <span className={`tk-item ${it.wagyu ? "tk-market" : ""}`} key={`b${i}`}>
      <b>{it.label}</b> {it.value} {arrow(it.change)}
    </span>
  ));

  // Band 3 — Wagyu sale data
  const s = saleData.map((it, i) => (
    <span className="tk-item" key={`s${i}`}><b>{it.label}</b> {it.value} <span className="tk-unit">avg</span></span>
  ));

  return (
    <div className="ticker-stack">
      <Band badge="📈 GENETICS INDEX" href="/roundup" items={g} title="Wagyu Genetics Price Index — live semen prices" />
      <Band badge="🥩 BEEF MARKET" href="/market" items={b} title="Beef & Wagyu market prices" accent="linear-gradient(180deg,#c86b4e,#a9481f)" />
      <Band badge="🏆 SALE DATA" href="/sale-reports" items={s} title="Wagyu auction sale averages" accent="linear-gradient(180deg,#6d9995,#4d7570)" />
    </div>
  );
}
