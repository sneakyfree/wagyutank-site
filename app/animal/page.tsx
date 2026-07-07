"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "../../lib/api";
import ListingCard from "../../components/ListingCard";
import RoundupCard from "../../components/RoundupCard";
import Discussion from "../../components/Discussion";

function AnimalView() {
  const reg = useSearchParams().get("reg") || "";
  const [a, setA] = useState<any>(null);
  const [offers, setOffers] = useState<any[]>([]);
  const [webOffers, setWebOffers] = useState<any[]>([]);
  const [bullNews, setBullNews] = useState<any[]>([]);
  const [bullSales, setBullSales] = useState<any[]>([]);

  useEffect(() => {
    if (!reg) { setA(false as any); return; }
    api.animal(reg).then(setA).catch(() => setA(false as any));
    api.animalOffers(reg).then(setOffers).catch(() => {});
    api.roundup({ animal: reg, limit: 12 }).then(setWebOffers).catch(() => {});
  }, [reg]);

  // Media center: news + record sales that mention this animal (match on the first name token)
  useEffect(() => {
    if (!a || !a.name) return;
    const token = String(a.name).split(/[\s(]/)[0].toLowerCase();
    if (token.length < 4) return;
    api.news({ q: token, limit: 5 }).then(setBullNews).catch(() => {});
    api.sales().then((d: any) => {
      const all = Object.values(d.data || {}).flat() as any[];
      setBullSales(all.filter((s) => (s.animal_name || "").toLowerCase().includes(token)));
    }).catch(() => {});
  }, [a]);

  if (a === false) return <div className="container section">Animal not found.</div>;
  if (!a) return <div className="container section">Loading…</div>;

  return (
    <div className="container section">
      <div className="row wrap" style={{ gap: 8, marginBottom: 8 }}>
        {a.is_foundation && <span className="pill">Foundation animal</span>}
        {a.bloodline && <span className="pill pill-dim">{a.bloodline}</span>}
        <span className="pill pill-dim">{a.breed}</span>
      </div>
      <h1 style={{ fontSize: "2.2rem" }}>{a.name}</h1>
      <div className="muted" style={{ fontSize: "1rem" }}>
        {a.registration_no && <span>Reg. {a.registration_no} · </span>}
        {a.animal_type}{a.birth_year ? ` · b. ${a.birth_year}` : ""}
      </div>

      {a.notable && <p className="gold" style={{ maxWidth: "70ch", marginTop: 14, fontSize: "1.08rem", fontWeight: 600 }}>{a.notable}</p>}

      {a.photo_url && (
        <div className="card" style={{ marginTop: 18, maxWidth: 640, overflow: "hidden" }}>
          <img src={a.photo_url} alt={a.name} style={{ width: "100%", display: "block" }} />
          {a.photo_note && <div className="faint" style={{ padding: "8px 14px", fontSize: "0.78rem" }}>{a.photo_note}</div>}
        </div>
      )}

      {a.bio && (
        <div className="prose" style={{ margin: "22px 0 0", maxWidth: "72ch" }}>
          {a.bio.split(/\n\n+/).map((p: string, i: number) => (
            <p key={i} className="muted" style={{ fontSize: "1.05rem", lineHeight: 1.75 }}>{p}</p>
          ))}
        </div>
      )}

      <div className="row wrap" style={{ gap: 30, marginTop: 24, alignItems: "flex-start" }}>
        <div style={{ flex: "1 1 300px" }}>
          <h2 style={{ fontSize: "1.2rem" }}>Registry record</h2>
          {a.prefecture && <div className="kv"><span className="k">Prefecture of origin</span><span>{a.prefecture}</span></div>}
          <div className="kv"><span className="k">Bloodline</span><span>{a.bloodline_detail || a.bloodline || "—"}</span></div>
          <div className="kv"><span className="k">Breed</span><span>{a.breed || "—"}</span></div>
          {a.importer && <div className="kv"><span className="k">Importer</span><span>{a.importer}</span></div>}
          {a.import_year && <div className="kv"><span className="k">Imported</span><span>{a.import_year}</span></div>}
          {a.au_progeny != null && <div className="kv"><span className="k">AU progeny</span><span>{a.au_progeny.toLocaleString()}</span></div>}
          {a.marbling_note && <div className="kv"><span className="k">Carcass / marbling</span><span style={{ maxWidth: "60%", textAlign: "right" }}>{a.marbling_note}</span></div>}
          {(a.sire_name || a.dam_name) && (
            <>
              <div className="kv"><span className="k">Sire</span><span>{a.sire_name || a.sire_reg || "—"}</span></div>
              <div className="kv"><span className="k">Dam</span><span>{a.dam_name || a.dam_reg || "—"}</span></div>
            </>
          )}
        </div>
        <div style={{ flex: "1 1 300px" }}>
          <div className="adslot" style={{ textAlign: "left" }}>
            <strong className="gold">Own genetics from {a.name}?</strong>
            <p className="muted" style={{ marginTop: 6 }}>List your straws, embryos, or cloning rights in under a minute.</p>
            <Link href="/sell" className="btn btn-gold" style={{ marginTop: 8 }}>List {a.name} genetics →</Link>
          </div>
        </div>
      </div>

      <div className="section" style={{ paddingBottom: 0 }}>
        <div className="section-head">
          <h2>{offers.length} {offers.length === 1 ? "offer" : "offers"} for {a.name}</h2>
        </div>
        {offers.length ? (
          <div className="grid listings-grid">{offers.map((l) => <ListingCard key={l.id} l={l} />)}</div>
        ) : (
          <div className="adslot">No live offers for {a.name} right now. <Link href="/sell" className="gold">Be the first to list →</Link></div>
        )}
      </div>

      {webOffers.length > 0 && (
        <div className="section" style={{ paddingTop: 8 }}>
          <div className="section-head">
            <h2><span className="roundup-pill pill">📡 Also around the web</span></h2>
          </div>
          <p className="muted" style={{ marginTop: -10, marginBottom: 18, fontSize: "0.92rem" }}>
            {a.name} genetics found for sale on other sites — links go to the original listing.
          </p>
          <div className="grid listings-grid">{webOffers.map((l) => <RoundupCard key={l.id} l={l} />)}</div>
        </div>
      )}

      {bullSales.length > 0 && (
        <div className="section" style={{ paddingTop: 8 }}>
          <div className="section-head"><h2><span className="sale-badge pill">🏆 {a.name} in the record books</span></h2></div>
          <div className="sale-grid">
            {bullSales.map((s) => (
              <div key={s.id} className={`card card-pad sale-card ${s.is_record ? "sale-record" : ""}`}>
                <div className="sale-price">{s.currency === "JPY" ? "¥" : s.currency === "AUD" ? "A$" : "$"}{s.currency === "JPY" ? (s.price / 1e6).toFixed(0) + "M" : s.price.toLocaleString()}<span className="faint" style={{ fontSize: "0.78rem", fontWeight: 500 }}> {s.unit}</span></div>
                <div className="sale-headline">{s.headline}</div>
                {s.source_url && <a href={s.source_url} target="_blank" rel="noopener noreferrer" className="faint sale-src">{s.source} ↗</a>}
              </div>
            ))}
          </div>
        </div>
      )}

      {bullNews.length > 0 && (
        <div className="section" style={{ paddingTop: 8 }}>
          <div className="section-head"><h2><span className="roundup-pill pill">📰 {a.name} in the news</span></h2></div>
          <div className="stack" style={{ gap: 10 }}>
            {bullNews.map((n) => (
              <a key={n.id} href={api.newsGoUrl(n.id)} target="_blank" rel="noopener noreferrer" className="card card-pad news-item">
                <div className="row wrap" style={{ gap: 8, marginBottom: 4 }}>
                  <span className="news-region">{({ US: "🇺🇸", AU: "🇦🇺", JP: "🇯🇵", EU: "🇪🇺", SA: "🌎" } as any)[n.region] || "🌍"} {n.region}</span>
                  {n.is_translated && <span className="pill roundup-pill" style={{ fontSize: "0.62rem" }}>🌐 Translated</span>}
                  <span className="faint" style={{ fontSize: "0.74rem" }}>{n.source_name}</span>
                </div>
                <div className="news-title" style={{ fontSize: "0.95rem" }}>{n.title}</div>
              </a>
            ))}
          </div>
        </div>
      )}

      <Discussion reg={a.registration_no || reg} name={a.name} />
    </div>
  );
}

export default function AnimalPage() {
  return <Suspense fallback={<div className="container section">Loading…</div>}><AnimalView /></Suspense>;
}
