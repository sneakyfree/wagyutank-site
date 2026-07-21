"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { api, money } from "../lib/api";
import { featureOn } from "../lib/tank";

function arrow(t: number | null | undefined) {
  if (t == null) return null;
  return t > 0 ? <span className="tk-up">▲ {Math.abs(t)}%</span>
    : t < 0 ? <span className="tk-down">▼ {Math.abs(t)}%</span> : <span className="tk-flat">–</span>;
}

const SPEED_PX_S = 32;

// JS-driven marquee: CSS keyframe animations freeze on some iOS Safari
// configurations (compositing limits, Reduce Motion, sticky tap-hover), so
// the scroll is driven by requestAnimationFrame instead.
function Band({ badge, href, items, title, accent }: {
  badge: string; href: string; items: React.ReactNode[]; title: string; accent?: string;
}) {
  const runRef = useRef<HTMLDivElement>(null);
  const paused = useRef(false);

  useEffect(() => {
    const run = runRef.current;
    if (!run || !items.length) return;
    let half = 0;
    const measure = () => { half = run.scrollWidth / 2; };
    measure();
    window.addEventListener("resize", measure);
    let offset = 0, last: number | null = null, raf = 0;
    const step = (t: number) => {
      if (last == null) last = t;
      const dt = Math.min((t - last) / 1000, 0.1);
      last = t;
      if (!paused.current && half > 0) {
        offset += SPEED_PX_S * dt;
        if (offset >= half) offset -= half;
        run.style.transform = `translate3d(${-offset}px,0,0)`;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", measure); };
  }, [items.length]);

  if (!items.length) return null;
  return (
    <div className="ticker" title={title}
      onMouseEnter={() => { paused.current = true; }}
      onMouseLeave={() => { paused.current = false; }}>
      <Link href={href} className="ticker-badge" style={accent ? { background: accent } : undefined}>{badge}</Link>
      <div className="ticker-track"><div className="ticker-run" ref={runRef}>{items}{items}</div></div>
    </div>
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
    // Deep-link each sire to his own profile — landing on the whole foundation
    // gallery after tapping one bull's price is a dead end.
    (genetics.sires || []).forEach((s: any, i: number) => {
      const key = s.slug || s.registration_no;
      const body = <><b>{s.sire}</b> {money(s.avg)}<span className="tk-unit">/straw</span> {arrow(s.trend)}</>;
      g.push(key
        ? <Link key={`g${i + 1}`} href={`/animal/${encodeURIComponent(key)}/`} className="tk-item tk-link">{body}</Link>
        : <span className="tk-item" key={`g${i + 1}`}>{body}</span>);
    });
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
      <Band badge="📈 GENETICS INDEX" href="/foundation" items={g} title="Wagyu Genetics Price Index — verified foundation-sire prices. Tap for per-bull analytics." />
      {featureOn("market_data") && <Band badge="🥩 BEEF MARKET" href="/market" items={b} title="Beef & Wagyu market prices" accent="linear-gradient(180deg,#c86b4e,#a9481f)" />}
      <Band badge="🏆 SALE DATA" href="/sale-reports" items={s} title="Wagyu auction sale averages" accent="linear-gradient(180deg,#6d9995,#4d7570)" />
    </div>
  );
}
