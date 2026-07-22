"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api, PRODUCT_LABEL } from "../../lib/api";
import { hasFamily, featureOn } from "../../lib/tank";
import ListingCard from "../../components/ListingCard";
import RoundupCard from "../../components/RoundupCard";
import WorldStrip from "../../components/WorldStrip";

const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];

function BrowseInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const [facets, setFacets] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [web, setWeb] = useState<any[]>([]);
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

  // Web listings (the Roundup index) fill the same shelves: a buyer asking
  // "what's for sale?" deserves the whole market, not just our own inventory.
  // Cards keep the dashed 📡 treatment so provenance stays obvious. Auctions
  // are a WagyuTank-native concept, so that filter shows native only.
  const showWeb = !hasLocal && featureOn("roundup") && filters.sale_type !== "auction";

  useEffect(() => {
    setLoading(true);
    api.search(filters).then(setResults).catch(() => setResults([])).finally(() => setLoading(false));
    if (showWeb) {
      const sort = filters.sort === "price_asc" || filters.sort === "price_desc" ? filters.sort : "recent";
      api.roundup({
        product_type: filters.product_type, bloodline: filters.bloodline,
        q: filters.q, export_to: filters.export, sort, limit: 60,
      }).then((d: any) => setWeb(Array.isArray(d) ? d : [])).catch(() => setWeb([]));
    } else {
      setWeb([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp.toString()]);

  function setParam(key: string, val: string) {
    const p = new URLSearchParams(sp.toString());
    if (val) p.set(key, val); else p.delete(key);
    router.push(`/browse?${p.toString()}`, { scroll: false });
  }

  function setParams(updates: Record<string, string>) {
    const p = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(updates)) { if (v) p.set(k, v); else p.delete(k); }
    router.push(`/browse?${p.toString()}`, { scroll: false });
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

      {showWeb && <WorldStrip />}

      {loading ? (
        <div className="grid listings-grid">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="card"><div className="lc-media" /><div className="lc-body"><div className="skeleton" style={{ width: "70%" }} /></div></div>)}</div>
      ) : results.length ? (
        <div className="grid listings-grid">{results.map((l) => <ListingCard key={l.id} l={l} />)}</div>
      ) : web.length ? (
        <div className="adslot">No WagyuTank listings match those filters yet — here is what's for sale around the web. <a href="/sell">List yours →</a></div>
      ) : (
        <div className="adslot">No results match those filters. Try widening your search.</div>
      )}

      {web.length > 0 && (
        <section style={{ marginTop: 34 }}>
          <div className="section-head">
            <h2 style={{ fontSize: "1.25rem" }}>📡 From around the web · {web.length}{web.length === 60 ? "+" : ""}</h2>
            <div className="spacer" />
            <a href={`/roundup${filters.product_type ? `?product_type=${encodeURIComponent(filters.product_type)}` : ""}`} className="nav-link">Full Roundup →</a>
          </div>
          <p className="muted" style={{ maxWidth: "68ch", marginTop: -6, marginBottom: 18, fontSize: "0.85rem" }}>
            Indexed daily from public seller sites — these are not WagyuTank sellers. Each card links to the original listing.
          </p>
          <div className="grid listings-grid">{web.map((l) => <RoundupCard key={`w${l.id}`} l={l} />)}</div>
        </section>
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
