"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api, PRODUCT_LABEL, WORLD_REGIONS } from "../../lib/api";
import { copy, products, TANK } from "../../lib/tank";
import RoundupCard from "../../components/RoundupCard";
import ListingCard from "../../components/ListingCard";
import AdSlot from "../../components/AdSlot";
import WorldStrip from "../../components/WorldStrip";
import CountryTag from "../../components/CountryTag";

type Row = { kind: "wt" | "web"; ts: string; l: any };

function RoundupInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const [webRows, setWebRows] = useState<any[]>([]);
  const [wtRows, setWtRows] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const product = sp.get("product_type") || "";
  const region = sp.get("region") || "";
  const country = sp.get("country") || "";
  const css = sp.get("css") || "";
  const sort = sp.get("sort") || "recent";
  const source = sp.get("source") || "";
  const q = sp.get("q") || "";
  const bloodline = sp.get("bloodline") || "";
  const [qInput, setQInput] = useState(q);
  useEffect(() => { setQInput(q); }, [q]);

  useEffect(() => { api.roundupStats().then(setStats).catch(() => {}); }, []);
  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.roundup({ product_type: product, region, country, css, sort, q, bloodline, limit: 80 }).catch(() => []),
      api.browse({ product_type: product, limit: 80 }).catch(() => []),
    ]).then(([web, wt]) => {
      setWebRows(web || []);
      setWtRows(wt || []);
    }).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp.toString()]);

  // Strings that are plainly not a bloodline -- the extractor picked up a page
  // label or recorded that the seller never said.
  const BL_JUNK = new Set(["unknown", "n/a", "na", "none", "more info", "tbd", "-", "?"]);
  // A pedigree recital ("X x Y x Z", "Sire: ..., Dam: ...") is a description of
  // one animal, not a category anything else can belong to.
  const BL_PEDIGREE = /(\s[x×]\s|[,;:#(]|\bdonor\b|\bsire\b|\bdam\b)/i;

  const [showAllBl, setShowAllBl] = useState(false);
  const BL_VISIBLE = 12;

  const usefulBloodlines = useMemo(() => {
    const raw: Record<string, number> = stats?.bloodlines || {};
    // Case and stray whitespace are noise from a dozen different sellers typing
    // the same word; the API matches case-insensitively, so merging is safe.
    const merged = new Map<string, { label: string; n: number }>();
    for (const [k, v] of Object.entries(raw)) {
      const label = String(k).replace(/\s+/g, " ").trim();
      if (!label) continue;
      const key = label.toLowerCase();
      const cur = merged.get(key);
      if (cur) cur.n += v as number;
      else merged.set(key, { label, n: v as number });
    }
    return [...merged.entries()]
      .filter(([key, { label, n }]) =>
        n >= 2 &&                       // a chip that narrows nothing is not a filter
        label.length <= 32 &&           // longer than this is a sentence, not a label
        !BL_PEDIGREE.test(label) &&
        !BL_JUNK.has(key))
      .map(([, v]) => v)
      .sort((a, b) => b.n - a.n || a.label.localeCompare(b.label));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats]);

  function setParam(k: string, v: string) {
    const p = new URLSearchParams(sp.toString());
    if (v) p.set(k, v); else p.delete(k);
    router.push(`/roundup?${p.toString()}`, { scroll: false });
  }

  // WagyuTank listings honor css/keyword/bloodline client-side; region/price-sort
  // are web-listing concepts, so natives ride along under "Worldwide"/recent only.
  let natives = wtRows;
  if (css) natives = natives.filter((l) => l.css_status === css);
  if (q) {
    const ql = q.toLowerCase();
    natives = natives.filter((l) => `${l.title} ${l.animal_reg || ""} ${l.sire_reg || ""} ${l.dam_reg || ""}`.toLowerCase().includes(ql));
  }
  if (bloodline) natives = [];  // native listings don't carry a bloodline field
  if (region || country || sort !== "recent") natives = [];
  if (source === "web") natives = [];
  const web = source === "wagyutank" ? [] : webRows;

  const merged: Row[] = [
    ...natives.map((l): Row => ({ kind: "wt", ts: l.created_at || "", l })),
    ...web.map((l): Row => ({ kind: "web", ts: l.source_updated_at || l.first_seen_at || "", l })),
  ];
  if (sort === "recent") merged.sort((a, b) => (b.ts > a.ts ? 1 : b.ts < a.ts ? -1 : 0));

  return (
    <div className="container section">
      <span className="pill roundup-pill">📡 The Roundup</span>
      <h1 style={{ fontSize: "2.2rem", marginTop: 12 }}>{copy.roundupTitle || "Every Wagyu genetics listing, one feed"}</h1>
      <div className="roundup-banner" style={{ maxWidth: "75ch", marginTop: 14 }}>
        <p className="muted" style={{ margin: 0, lineHeight: 1.7 }}>
          {copy.roundupIntro || (<>The Roundup brings the whole frozen-genetics market together: listings posted
          <strong className="gold"> on WagyuTank</strong> plus semen, embryo, and cloning listings we
          track from public sources <strong className="gold">across the web</strong> (marked 📡 — those
          link straight back to the original seller's page; web sellers pay nothing and can remove a
          listing anytime).</>)}
          {stats && <span className="faint"> Currently tracking {stats.active} web listings across {stats.sources} sources
            {stats.countries?.length ? ` in ${stats.countries.length} countries` : ""}
            {stats.css_export_eligible ? `, ${stats.css_export_eligible} export-eligible` : ""}.</span>}
        </p>
      </div>

      <WorldStrip />

      {country && (
        <div className="row" style={{ gap: 8, marginBottom: 16 }}>
          <span className="faint" style={{ fontSize: "0.82rem", alignSelf: "center" }}>Showing listings from</span>
          <CountryTag cc={country} />
          <button className="pill pill-dim" style={{ cursor: "pointer" }} onClick={() => setParam("country", "")}>clear ✕</button>
        </div>
      )}

      {/* Search box — sire name, registration number, or keyword */}
      <form onSubmit={(e) => { e.preventDefault(); setParam("q", qInput.trim()); }} className="searchbar" style={{ maxWidth: 640, marginTop: 20 }}>
        <span className="faint">🔍</span>
        <input value={qInput} onChange={(e) => setQInput(e.target.value)} placeholder="Search by sire, registration number, or keyword…" aria-label="Search listings" />
        {q && <button type="button" className="pill pill-dim" style={{ cursor: "pointer" }} onClick={() => setParam("q", "")}>clear ✕</button>}
        <button type="submit" className="btn btn-gold">Search</button>
      </form>

      {/* Bloodline facet — the ones that actually group listings. */}
      {usefulBloodlines.length > 0 && (() => {
        const shown = showAllBl ? usefulBloodlines : usefulBloodlines.slice(0, BL_VISIBLE);
        const rest = usefulBloodlines.length - shown.length;
        // A bloodline arrived at by URL or by search stays visible even when it
        // is not one of the common ones, so the active filter is never a chip
        // the reader cannot see.
        const activeMissing = bloodline && !shown.some((b) => b.label.toLowerCase() === bloodline.toLowerCase());
        return (
          <div className="row wrap" style={{ gap: 8, marginTop: 12 }}>
            <span className="faint" style={{ fontSize: "0.82rem", alignSelf: "center" }}>🩸 Bloodline:</span>
            <button className={`pill ${bloodline === "" ? "" : "pill-dim"}`} style={{ cursor: "pointer" }} onClick={() => setParam("bloodline", "")}>All</button>
            {activeMissing && (
              <button className="pill" style={{ cursor: "pointer", maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                title={bloodline} onClick={() => setParam("bloodline", "")}>{bloodline} ✕</button>
            )}
            {shown.map((b) => (
              <button key={b.label} className={`pill ${bloodline.toLowerCase() === b.label.toLowerCase() ? "" : "pill-dim"}`}
                style={{ cursor: "pointer" }}
                onClick={() => setParam("bloodline", bloodline.toLowerCase() === b.label.toLowerCase() ? "" : b.label)}>
                {b.label} ({b.n})
              </button>
            ))}
            {rest > 0 && (
              <button className="pill pill-dim" style={{ cursor: "pointer" }} onClick={() => setShowAllBl(true)}>
                +{rest} more
              </button>
            )}
            {showAllBl && (
              <button className="pill pill-dim" style={{ cursor: "pointer" }} onClick={() => setShowAllBl(false)}>
                show fewer
              </button>
            )}
          </div>
        );
      })()}

      <div className="row wrap" style={{ gap: 8, margin: "16px 0 10px" }}>
        <button className={`pill ${source === "" ? "" : "pill-dim"}`} style={{ cursor: "pointer" }} onClick={() => setParam("source", "")}>All sources</button>
        <button className={`pill ${source === "wagyutank" ? "" : "pill-dim"}`} style={{ cursor: "pointer" }} onClick={() => setParam("source", "wagyutank")}>🏷 On WagyuTank</button>
        <button className={`pill ${source === "web" ? "" : "pill-dim"}`} style={{ cursor: "pointer" }} onClick={() => setParam("source", "web")}>📡 Around the web</button>
        <span style={{ width: 10 }} />
        <button className={`pill ${product === "" ? "" : "pill-dim"}`} style={{ cursor: "pointer" }} onClick={() => setParam("product_type", "")}>All products</button>
        {products().map((p) => (
          <button key={p.key} className={`pill ${product === p.key ? "" : "pill-dim"}`} style={{ cursor: "pointer" }} onClick={() => setParam("product_type", p.key)}>
            {PRODUCT_LABEL[p.key]}
          </button>
        ))}
        <div className="spacer" />
        {(TANK as any).vocab?.export_program && (
          <select className="select" style={{ width: "auto" }} value={css} onChange={(e) => setParam("css", e.target.value)}
            title="Whether the frozen genetics themselves are certified for export from their country of origin — not based on where you are.">
            <option value="">Any export status</option>
            <option value="css">✈ {(TANK as any).vocab.export_program} export-eligible</option>
            <option value="domestic">Not export-certified (domestic only)</option>
          </select>
        )}
        <select className="select" style={{ width: "auto" }} value={sort} onChange={(e) => setParam("sort", e.target.value)}>
          <option value="recent">Most recent</option>
          <option value="price_asc">Price ↑</option>
          <option value="price_desc">Price ↓</option>
        </select>
      </div>
      <div className="row wrap" style={{ gap: 8, marginBottom: 20 }}>
        <span className="faint" style={{ fontSize: "0.82rem", alignSelf: "center" }}>🌍 Region:</span>
        <button className={`pill ${region === "" ? "" : "pill-dim"}`} style={{ cursor: "pointer" }} onClick={() => setParam("region", "")}>Worldwide</button>
        {WORLD_REGIONS.map((r) => (
          <button key={r.code} className={`pill ${region === r.code ? "" : "pill-dim"}`} style={{ cursor: "pointer" }}
            onClick={() => setParam("region", r.code)}>
            {r.flag} {r.label}{stats?.regions?.[r.code] ? ` (${stats.regions[r.code]})` : ""}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: 20 }}><AdSlot placement="banner" /></div>

      {loading ? (
        <div className="grid listings-grid">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="card roundup-card"><div className="lc-body"><div className="skeleton" style={{ width: "70%" }} /></div></div>)}</div>
      ) : merged.length ? (
        <div className="grid listings-grid">
          {merged.map((r) => r.kind === "wt"
            ? <ListingCard key={`wt${r.l.id}`} l={r.l} />
            : <RoundupCard key={`web${r.l.id}`} l={r.l} />)}
        </div>
      ) : (
        <div className="adslot">Nothing matches these filters yet — the daily crawler keeps adding web listings.</div>
      )}
    </div>
  );
}

export default function Roundup() {
  return <Suspense fallback={<div className="container section">Loading…</div>}><RoundupInner /></Suspense>;
}
