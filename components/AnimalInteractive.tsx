"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../lib/api";
import ListingCard from "./ListingCard";
import RoundupCard from "./RoundupCard";
import Discussion from "./Discussion";

// The live/interactive parts of an animal page — fetched client-side so they stay
// current, while the SEO-critical core is server-rendered by AnimalCore.
export default function AnimalInteractive({ reg, name }: { reg: string; name: string }) {
  const [offers, setOffers] = useState<any[]>([]);
  const [webOffers, setWebOffers] = useState<any[]>([]);
  const [bullNews, setBullNews] = useState<any[]>([]);
  const [bullSales, setBullSales] = useState<any[]>([]);

  useEffect(() => {
    if (!reg) return;
    api.animalOffers(reg).then(setOffers).catch(() => {});
    api.roundup({ animal: reg, limit: 12 }).then(setWebOffers).catch(() => {});
  }, [reg]);

  useEffect(() => {
    if (!name) return;
    const token = String(name).split(/[\s(]/)[0].toLowerCase();
    if (token.length < 4) return;
    api.news({ q: token, limit: 5 }).then(setBullNews).catch(() => {});
    api.sales().then((d: any) => {
      const all = Object.values(d.data || {}).flat() as any[];
      setBullSales(all.filter((s) => (s.animal_name || "").toLowerCase().includes(token)));
    }).catch(() => {});
  }, [name]);

  return (
    <>
      <div className="section" style={{ paddingBottom: 0 }}>
        <div className="section-head">
          <h2>{offers.length} {offers.length === 1 ? "offer" : "offers"} for {name}</h2>
        </div>
        {offers.length ? (
          <div className="grid listings-grid">{offers.map((l) => <ListingCard key={l.id} l={l} />)}</div>
        ) : (
          <div className="adslot">No live offers for {name} right now. <Link href="/sell" className="gold">Be the first to list →</Link></div>
        )}
      </div>

      {webOffers.length > 0 && (
        <div className="section" style={{ paddingTop: 8 }}>
          <div className="section-head"><h2><span className="roundup-pill pill">📡 Also around the web</span></h2></div>
          <p className="muted" style={{ marginTop: -10, marginBottom: 18, fontSize: "0.92rem" }}>
            {name} genetics found for sale on other sites — links go to the original listing.
          </p>
          <div className="grid listings-grid">{webOffers.map((l) => <RoundupCard key={l.id} l={l} />)}</div>
        </div>
      )}

      {bullSales.length > 0 && (
        <div className="section" style={{ paddingTop: 8 }}>
          <div className="section-head"><h2><span className="sale-badge pill">🏆 {name} in the record books</span></h2></div>
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
          <div className="section-head"><h2><span className="roundup-pill pill">📰 {name} in the news</span></h2></div>
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

      <Discussion reg={reg} name={name} />
    </>
  );
}
