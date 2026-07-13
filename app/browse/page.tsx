"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api, PRODUCT_LABEL } from "../../lib/api";
import { hasFamily } from "../../lib/tank";
import ListingCard from "../../components/ListingCard";

const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];

function BrowseInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const [facets, setFacets] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // Location filters only exist where cattle stand in a pasture or beef ships
  // from a ranch — genetics tanks keep their exact browse UI.
  const hasLocal = hasFamily("live") || hasFamily("beef");
  const [zipInput, setZipInput] = useState(sp.get("near_postal") || "");
  const [radiusInput, setRadiusInput] = useState(sp.get("radius_miles") || "100");

  const filters = {
    q: sp.get("q") || "",
    product_type: sp.get("product_type") || "",
    bloodline: sp.get("bloodline") || "",
    sale_type: sp.get("sale_type") || "",
    export: sp.get("export") || "",
    sort: sp.get("sort") || "newest",
    ...(hasLocal ? {
      state: sp.get("state") || "",
      near_postal: sp.get("near_postal") || "",
      radius_miles: sp.get("radius_miles") || "",
    } : {}),
  } as Record<string, string>;

  useEffect(() => { api.facets().then(setFacets).catch(() => {}); }, []);

  useEffect(() => {
    setLoading(true);
    api.search(filters).then(setResults).catch(() => setResults([])).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp.toString()]);

  function setParam(key: string, val: string) {
    const p = new URLSearchParams(sp.toString());
    if (val) p.set(key, val); else p.delete(key);
    router.push(`/browse?${p.toString()}`);
  }

  function setParams(updates: Record<string, string>) {
    const p = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(updates)) { if (v) p.set(k, v); else p.delete(k); }
    router.push(`/browse?${p.toString()}`);
  }

  return (
    <div className="container section">
      <h1 style={{ fontSize: "1.8rem" }}>
        Browse {filters.product_type ? PRODUCT_LABEL[filters.product_type] : hasLocal ? "listings" : "genetics"}
      </h1>

      <div className="row wrap" style={{ gap: 10, margin: "18px 0 24px" }}>
        <select className="select" style={{ width: "auto" }} value={filters.product_type} onChange={(e) => setParam("product_type", e.target.value)}>
          <option value="">All products</option>
          {(facets?.product_types || []).map((p: string) => <option key={p} value={p}>{PRODUCT_LABEL[p] || p}</option>)}
        </select>
        <select className="select" style={{ width: "auto" }} value={filters.bloodline} onChange={(e) => setParam("bloodline", e.target.value)}>
          <option value="">All bloodlines</option>
          {(facets?.bloodlines || []).map((b: string) => <option key={b} value={b}>{b}</option>)}
        </select>
        <select className="select" style={{ width: "auto" }} value={filters.sale_type} onChange={(e) => setParam("sale_type", e.target.value)}>
          <option value="">Fixed & auction</option>
          <option value="fixed">Buy now</option>
          <option value="auction">Auctions</option>
        </select>
        <select className="select" style={{ width: "auto" }} value={filters.export} onChange={(e) => setParam("export", e.target.value)}>
          <option value="">Any destination</option>
          {(facets?.export_regions || []).map((r: string) => <option key={r} value={r}>Export to {r}</option>)}
        </select>
        <div className="spacer" />
        <select className="select" style={{ width: "auto" }} value={filters.sort} onChange={(e) => setParam("sort", e.target.value)}>
          <option value="newest">Newest</option>
          <option value="price_asc">Price ↑</option>
          <option value="price_desc">Price ↓</option>
          <option value="ending_soon">Ending soon</option>
          {hasLocal && <option value="nearest">Nearest</option>}
        </select>
      </div>

      {hasLocal && (
        <div className="row wrap" style={{ gap: 10, margin: "-12px 0 24px" }}>
          <select className="select" style={{ width: "auto" }} value={filters.state} onChange={(e) => setParam("state", e.target.value)} aria-label="Filter by state">
            <option value="">Any state</option>
            {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <form
            className="row" style={{ gap: 6 }}
            onSubmit={(e) => {
              e.preventDefault();
              const zip = zipInput.trim();
              setParams(zip
                ? { near_postal: zip, radius_miles: radiusInput, sort: "nearest" }
                : { near_postal: "", radius_miles: "", ...(filters.sort === "nearest" ? { sort: "" } : {}) });
            }}
          >
            <span className="faint" style={{ alignSelf: "center", fontSize: "0.85rem" }}>near ZIP</span>
            <input className="input" style={{ width: 100 }} inputMode="numeric" placeholder="76028" value={zipInput}
              onChange={(e) => setZipInput(e.target.value)} aria-label="Near ZIP code" />
            <select className="select" style={{ width: "auto" }} value={radiusInput}
              onChange={(e) => { setRadiusInput(e.target.value); if (filters.near_postal) setParam("radius_miles", e.target.value); }} aria-label="Search radius">
              {["50", "100", "250", "500"].map((r) => <option key={r} value={r}>within {r} mi</option>)}
            </select>
            <button className="btn" type="submit">Go</button>
            {filters.near_postal && (
              <button type="button" className="pill pill-dim" style={{ cursor: "pointer" }}
                onClick={() => { setZipInput(""); setParams({ near_postal: "", radius_miles: "", ...(filters.sort === "nearest" ? { sort: "" } : {}) }); }}>
                clear ✕
              </button>
            )}
          </form>
        </div>
      )}

      {loading ? (
        <div className="grid listings-grid">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="card"><div className="lc-media" /><div className="lc-body"><div className="skeleton" style={{ width: "70%" }} /></div></div>)}</div>
      ) : results.length ? (
        <div className="grid listings-grid">{results.map((l) => <ListingCard key={l.id} l={l} />)}</div>
      ) : (
        <div className="adslot">No results match those filters. Try widening your search.</div>
      )}
    </div>
  );
}

export default function Browse() {
  return (
    <Suspense fallback={<div className="container section">Loading…</div>}>
      <BrowseInner />
    </Suspense>
  );
}
