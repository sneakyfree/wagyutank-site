"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api, PRODUCT_LABEL } from "../../lib/api";
import RoundupCard from "../../components/RoundupCard";

function RoundupInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const [rows, setRows] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const product = sp.get("product_type") || "";
  const sort = sp.get("sort") || "recent";

  useEffect(() => { api.roundupStats().then(setStats).catch(() => {}); }, []);
  useEffect(() => {
    setLoading(true);
    api.roundup({ product_type: product, sort, limit: 60 })
      .then(setRows).catch(() => setRows([])).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp.toString()]);

  function setParam(k: string, v: string) {
    const p = new URLSearchParams(sp.toString());
    if (v) p.set(k, v); else p.delete(k);
    router.push(`/roundup?${p.toString()}`);
  }

  return (
    <div className="container section">
      <span className="pill roundup-pill">📡 The Roundup</span>
      <h1 style={{ fontSize: "2.2rem", marginTop: 12 }}>Wagyu genetics from across the web</h1>
      <div className="roundup-banner" style={{ maxWidth: "75ch", marginTop: 14 }}>
        <p className="muted" style={{ margin: 0, lineHeight: 1.7 }}>
          The Roundup gathers frozen Wagyu semen, embryos, and cloning listings from public
          sources all over the internet into one place — so buyers can find everything for sale
          without hunting across a dozen sites. <strong className="gold">These are not WagyuTank
          listings.</strong> Each one links straight back to the original seller's page; we simply
          point the way. Sellers pay nothing and can remove their listing anytime.
          {stats && <span className="faint"> Currently tracking {stats.active} listings across {stats.sources} sources.</span>}
        </p>
      </div>

      <div className="row wrap" style={{ gap: 8, margin: "20px 0" }}>
        <button className={`pill ${product === "" ? "" : "pill-dim"}`} style={{ cursor: "pointer" }} onClick={() => setParam("product_type", "")}>All</button>
        {["semen", "embryo", "clone_rights"].map((p) => (
          <button key={p} className={`pill ${product === p ? "" : "pill-dim"}`} style={{ cursor: "pointer" }} onClick={() => setParam("product_type", p)}>
            {PRODUCT_LABEL[p]}
          </button>
        ))}
        <div className="spacer" />
        <select className="select" style={{ width: "auto" }} value={sort} onChange={(e) => setParam("sort", e.target.value)}>
          <option value="recent">Most recent</option>
          <option value="price_asc">Price ↑</option>
          <option value="price_desc">Price ↓</option>
        </select>
      </div>

      {loading ? (
        <div className="grid listings-grid">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="card roundup-card"><div className="lc-body"><div className="skeleton" style={{ width: "70%" }} /></div></div>)}</div>
      ) : rows.length ? (
        <div className="grid listings-grid">{rows.map((l) => <RoundupCard key={l.id} l={l} />)}</div>
      ) : (
        <div className="adslot">No web listings tracked yet — the daily crawler is building the index.</div>
      )}
    </div>
  );
}

export default function Roundup() {
  return <Suspense fallback={<div className="container section">Loading…</div>}><RoundupInner /></Suspense>;
}
