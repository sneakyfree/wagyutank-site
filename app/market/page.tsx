"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api, money } from "../../lib/api";

function fmt(q: any): string {
  if (q.value_text) return q.value_text + (q.unit ? ` ${q.unit}` : "");
  if (q.value != null) {
    const v = q.unit?.startsWith("$") || q.unit?.includes("/") || q.unit === "head"
      ? money(q.value) : q.value.toLocaleString();
    return `${q.unit?.startsWith("$") ? v.replace("$", "$") : v}${q.unit && !q.unit.startsWith("$") ? " " + q.unit : ""}`;
  }
  return "—";
}
function changeEl(c: number | null) {
  if (c == null) return null;
  return c > 0 ? <span className="tk-up">▲ {Math.abs(c)}</span>
    : c < 0 ? <span className="tk-down">▼ {Math.abs(c)}</span> : <span className="tk-flat">–</span>;
}

function QuoteCard({ q }: { q: any }) {
  return (
    <div className="mkt-quote">
      <div className="mkt-q-top">
        <span className="mkt-q-label">{q.label}</span>
        {changeEl(q.change)}
      </div>
      <div className="mkt-q-value">{fmt(q)}</div>
      <div className="mkt-q-meta">
        {q.note && <div className="faint" style={{ fontSize: "0.76rem", marginBottom: 3 }}>{q.note}</div>}
        <span className="faint" style={{ fontSize: "0.7rem" }}>
          {q.as_of ? `${q.as_of} · ` : ""}
          {q.source_url ? <a href={q.source_url} target="_blank" rel="noopener noreferrer" className="faint" style={{ textDecoration: "underline" }}>{q.source}</a> : q.source}
        </span>
      </div>
    </div>
  );
}

export default function Market() {
  const [d, setD] = useState<any>(null);
  const [idx, setIdx] = useState<any>(null);
  useEffect(() => { api.market().then(setD).catch(() => setD(false)); api.priceIndex().then(setIdx).catch(() => {}); }, []);
  if (d === false) return <div className="container section">Market data unavailable.</div>;
  if (!d) return <div className="container section">Loading market data…</div>;

  return (
    <div className="container section">
      <span className="pill roundup-pill">📊 DATA CENTER</span>
      <h1 style={{ fontSize: "2.2rem", marginTop: 12 }}>Beef & Wagyu Market Data</h1>
      <div className="roundup-banner" style={{ maxWidth: "78ch", marginTop: 14 }}>
        <p className="muted" style={{ margin: 0, lineHeight: 1.7 }}>
          The whole cattle complex on one page — feeder and fed cattle, boxed-beef cutout, and Wagyu
          premiums — so genetics buyers can see the market they're breeding into.
          <strong className="gold"> Commodity figures from USDA public-domain reports.</strong>
        </p>
      </div>

      {/* Our own genetics index — the ownable data */}
      {idx?.market?.semen_avg && (
        <Link href="/roundup" className="mkt-index card card-pad">
          <div className="row wrap" style={{ alignItems: "center", gap: 16 }}>
            <div>
              <div className="ad-tag">📈 WagyuTank Genetics Price Index</div>
              <div style={{ fontSize: "1.7rem", fontWeight: 800, color: "var(--gold)" }}>{money(idx.market.semen_avg)}<span className="faint" style={{ fontSize: "0.9rem", fontWeight: 500 }}> /straw avg semen</span></div>
            </div>
            <div className="spacer" />
            <div className="faint" style={{ fontSize: "0.8rem" }}>Live from {idx.market.semen_count} listings · {idx.sires?.length || 0} marquee sires →</div>
          </div>
        </Link>
      )}

      <Link href="/sales" className="mkt-index card card-pad" style={{ marginTop: 14 }}>
        <div className="row wrap" style={{ alignItems: "center", gap: 12 }}>
          <div>
            <div className="ad-tag">🏆 Hall of Records</div>
            <div style={{ fontWeight: 700, marginTop: 2 }}>The biggest Wagyu sales ever — a $68,000 straw, a $400,000 heifer, a ¥50M cow</div>
          </div>
          <div className="spacer" />
          <span className="faint" style={{ fontSize: "0.8rem" }}>See the record books →</span>
        </div>
      </Link>

      {d.categories.map((c: any) => (
        (d.data[c.key]?.length > 0) && (
          <div key={c.key} className="section" style={{ paddingTop: 18, paddingBottom: 0 }}>
            <h2 style={{ fontSize: "1.25rem" }}>{c.icon} {c.label}</h2>
            <div className="mkt-grid">
              {d.data[c.key].map((q: any, i: number) => <QuoteCard key={i} q={q} />)}
            </div>
          </div>
        )
      ))}

      <p className="help" style={{ marginTop: 30, maxWidth: "70ch" }}>{d.disclaimer}</p>
    </div>
  );
}
