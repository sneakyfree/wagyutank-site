"use client";
import { useEffect, useMemo, useState } from "react";
import { api, countryFlag } from "../../lib/api";
import ProductBadge from "../../components/ProductBadge";

const REGION_LABEL: Record<string, string> = {
  NA: "North America", SA: "South America", CAM: "Central America",
  EU: "Europe", AU: "Oceania", AS: "Asia", AF: "Africa", ME: "Middle East",
};
const CAT_LABEL: Record<string, string> = {
  genetics: "🧬 Genetics", live_cattle: "🐂 Live cattle", beef: "🥩 Beef",
  feedlot: "🌾 Feedlot", stud_services: "⚕ Stud services",
};
const BREED_LABEL: Record<string, string> = { black_wagyu: "Black Wagyu", akaushi: "Akaushi" };

function SellerCard({ s }: { s: any }) {
  return (
    <div className="card card-pad" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div className="row" style={{ gap: 8, alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ margin: 0, fontSize: "1.05rem", lineHeight: 1.3 }}>{s.name}</h3>
          <div className="faint" style={{ fontSize: "0.78rem", marginTop: 2 }}>
            {s.country && <span title={s.country}>{countryFlag(s.country)} </span>}
            {s.region ? REGION_LABEL[s.region] || s.region : ""}
            {(s.breeds || []).length > 0 && (
              <> · {s.breeds.map((b: string) => BREED_LABEL[b] || b).join(" & ")}</>
            )}
          </div>
        </div>
        {s.css_eligible && (
          <span className="pill" title="Offers CSS / export-eligible genetics"
            style={{ fontSize: "0.66rem" }}>✈ Export</span>
        )}
      </div>
      {s.blurb && (
        <p className="muted" style={{ fontSize: "0.82rem", margin: 0, lineHeight: 1.55 }}>{s.blurb}</p>
      )}
      {(s.categories || []).length > 0 && (
        <div className="row wrap" style={{ gap: 5 }}>
          {s.categories.map((c: string) => (
            <span key={c} className="pill" style={{ fontSize: "0.68rem" }}>{CAT_LABEL[c] || c}</span>
          ))}
        </div>
      )}
      <div className="row wrap" style={{ gap: 5 }}>
        {(s.products || []).map((p: string) => <ProductBadge key={p} type={p} />)}
        {s.listings > 0 ? (
          <span className="faint" style={{ fontSize: "0.76rem", alignSelf: "center" }}>
            {s.listings} indexed listing{s.listings === 1 ? "" : "s"}
          </span>
        ) : (
          <span className="faint" style={{ fontSize: "0.74rem", alignSelf: "center", fontStyle: "italic" }}>
            See their site for current offerings
          </span>
        )}
      </div>
      {(s.sires || []).length > 0 && (
        <div className="faint" style={{ fontSize: "0.74rem", lineHeight: 1.5 }}>
          Bloodlines: {s.sires.slice(0, 4).join(", ")}{s.sires.length > 4 ? "…" : ""}
        </div>
      )}
      <a href={s.url} target="_blank" rel="noopener noreferrer" className="btn btn-block"
        style={{ marginTop: "auto", fontSize: "0.85rem" }}>
        Visit site ↗
      </a>
    </div>
  );
}

export default function Client() {
  const [stats, setStats] = useState<any>(null);
  const [sellers, setSellers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [product, setProduct] = useState("");
  const [category, setCategory] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.directoryStats().then(setStats).catch(() => {}); }, []);
  useEffect(() => {
    setLoading(true);
    const params: any = { limit: 1000 };
    if (country) params.country = country;
    if (region) params.region = region;
    if (product) params.product = product;
    if (category) params.category = category;
    if (q.trim()) params.q = q.trim();
    const h = setTimeout(() => {
      api.directory(params).then((d) => { setSellers(d.sellers || []); setTotal(d.total || 0); })
        .finally(() => setLoading(false));
    }, q ? 250 : 0);
    return () => clearTimeout(h);
  }, [country, region, product, category, q]);

  const countryOptions = useMemo(
    () => Object.keys(stats?.countries || {}).sort(), [stats]);

  return (
    <div className="container" style={{ padding: "32px 16px 60px" }}>
      <h1 style={{ marginBottom: 6 }}>The Wagyu Atlas</h1>
      <p className="muted" style={{ maxWidth: 680, lineHeight: 1.7 }}>
        A free, worldwide directory of Wagyu &amp; Akaushi genetics sellers — the consolidated map of who's
        out there. Every seller links to their own website; we list only public information and never
        rehost anyone's content.
        {stats && (
          <> Currently <strong className="gold">{stats.total_sellers}</strong> sellers across{" "}
            <strong className="gold">{Object.keys(stats.countries).length}</strong> countries.</>
        )}
      </p>

      {/* Filters */}
      <div className="card card-pad" style={{ margin: "18px 0 24px" }}>
        <div className="row wrap" style={{ gap: 10, alignItems: "center" }}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search seller or bloodline…"
            style={{ flex: 1, minWidth: 180, padding: "8px 10px" }} />
          <select value={country} onChange={(e) => { setCountry(e.target.value); setRegion(""); }}
            style={{ padding: "8px 10px" }}>
            <option value="">All countries</option>
            {countryOptions.map((c) => (
              <option key={c} value={c}>{countryFlag(c)} {c}</option>
            ))}
          </select>
          <select value={product} onChange={(e) => setProduct(e.target.value)} style={{ padding: "8px 10px" }}>
            <option value="">All products</option>
            <option value="semen">Semen</option>
            <option value="embryo">Embryos</option>
            <option value="clone_rights">Cloning rights</option>
          </select>
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ padding: "8px 10px" }}>
            <option value="">All activities</option>
            <option value="genetics">Genetics</option>
            <option value="live_cattle">Live cattle</option>
            <option value="beef">Beef</option>
            <option value="feedlot">Feedlot</option>
            <option value="stud_services">Stud services</option>
          </select>
        </div>
        {stats && (
          <div className="row wrap" style={{ gap: 6, marginTop: 10 }}>
            <button onClick={() => setRegion("")} className={`pill ${!region ? "roundup-pill" : ""}`}
              style={{ cursor: "pointer", border: "none" }}>All regions</button>
            {Object.entries(stats.regions).map(([r, n]: any) => (
              <button key={r} onClick={() => { setRegion(r); setCountry(""); }}
                className={`pill ${region === r ? "roundup-pill" : ""}`}
                style={{ cursor: "pointer", border: "none" }}>
                {REGION_LABEL[r] || r} ({n})
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="faint" style={{ fontSize: "0.82rem", marginBottom: 12 }}>
        {loading ? "Loading…" : `${total} seller${total === 1 ? "" : "s"}`}
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 14 }}>
        {sellers.map((s) => <SellerCard key={s.site} s={s} />)}
      </div>
      {!loading && sellers.length === 0 && (
        <p className="muted" style={{ textAlign: "center", marginTop: 30 }}>No sellers match those filters.</p>
      )}

      <p className="faint" style={{ fontSize: "0.8rem", marginTop: 32, textAlign: "center", maxWidth: 620, marginInline: "auto" }}>
        Are you a seller listed here and want changes or removal? Visit your listing in the{" "}
        <a href="/roundup" className="gold">Roundup</a> — a one-click, email-verified removal keeps you in control.
      </p>
    </div>
  );
}
