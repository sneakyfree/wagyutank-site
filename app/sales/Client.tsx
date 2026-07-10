"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../../lib/api";

const SYM: Record<string, string> = { AUD: "A$", USD: "$", JPY: "¥", EUR: "€" };
const FLAG: Record<string, string> = { AU: "🇦🇺", JP: "🇯🇵", US: "🇺🇸", CA: "🇨🇦" };

function priceStr(s: any): string {
  const sym = SYM[s.currency] || "$";
  const v = s.currency === "JPY" ? (s.price / 1_000_000).toFixed(0) + "M" : s.price.toLocaleString();
  return `${sym}${v}`;
}

function SaleCard({ s, rank }: { s: any; rank?: number }) {
  return (
    <div className={`card card-pad sale-card ${s.is_record ? "sale-record" : ""}`}>
      <div className="row" style={{ alignItems: "baseline", gap: 10 }}>
        <div className="sale-price">{priceStr(s)}<span className="faint" style={{ fontSize: "0.8rem", fontWeight: 500 }}> {s.unit}</span></div>
        <div className="spacer" />
        {s.is_record && <span className="pill sale-badge">🏆 RECORD</span>}
        {rank && <span className="faint" style={{ fontSize: "0.9rem", fontWeight: 800 }}>#{rank}</span>}
      </div>
      <div className="sale-headline">{s.headline}</div>
      {s.animal_name && <div className="gold" style={{ fontSize: "0.9rem", fontWeight: 700, marginTop: 4 }}>{s.animal_name}</div>}
      {s.note && <p className="muted" style={{ fontSize: "0.85rem", lineHeight: 1.55, margin: "8px 0" }}>{s.note}</p>}
      <div className="sale-meta faint">
        {s.country && <span>{FLAG[s.country] || "🌍"} </span>}
        {[s.sale_venue, s.date_label].filter(Boolean).join(" · ")}
        {s.usd_approx && s.currency !== "USD" && <span> · ≈ ${s.usd_approx.toLocaleString()} USD</span>}
      </div>
      {(s.buyer || s.seller) && (
        <div className="faint" style={{ fontSize: "0.76rem", marginTop: 4 }}>
          {s.seller && <span>Sold by {s.seller}</span>}{s.seller && s.buyer && <span> → </span>}{s.buyer && <span>{s.buyer}</span>}
        </div>
      )}
      {s.source_url && <a href={s.source_url} target="_blank" rel="noopener noreferrer" className="faint sale-src">{s.source} ↗</a>}
    </div>
  );
}

const WINDOWS = [{ k: "", l: "All-time" }, { k: "decade", l: "This decade" }, { k: "year", l: "This year" }];

export default function Sales() {
  const [d, setD] = useState<any>(null);
  const [win, setWin] = useState("");
  useEffect(() => { api.sales(win).then(setD).catch(() => setD(false)); }, [win]);
  if (d === false) return <div className="container section">Sales data unavailable.</div>;
  if (!d) return <div className="container section">Loading the record books…</div>;
  const windowChips = (
    <div className="row wrap" style={{ gap: 8, margin: "18px 0 0" }}>
      {WINDOWS.map((w) => (
        <button key={w.k} className={`pill ${win === w.k ? "" : "pill-dim"}`} style={{ cursor: "pointer" }} onClick={() => setWin(w.k)}>{w.l}</button>
      ))}
    </div>
  );

  return (
    <div className="container section">
      <span className="pill sale-badge">🏆 HALL OF RECORDS</span>
      <h1 style={{ fontSize: "2.2rem", marginTop: 12 }}>The biggest Wagyu sales ever recorded</h1>
      <div className="roundup-banner" style={{ maxWidth: "78ch", marginTop: 14 }}>
        <p className="muted" style={{ margin: 0, lineHeight: 1.7 }}>
          The straws, embryos, and animals that made headlines — the record-setting prices that show
          just how far the world will go for elite Wagyu genetics. <strong className="gold">Every
          figure is sourced.</strong>
        </p>
      </div>
      {windowChips}

      {/* Record leaderboard */}
      <div className="section" style={{ paddingTop: 22, paddingBottom: 0 }}>
        <h2 style={{ fontSize: "1.3rem" }}>🥇 {win === "year" ? "This year's" : win === "decade" ? "This decade's" : "The all-time"} records</h2>
        {d.records.length ? (
          <div className="sale-grid">
            {d.records.map((s: any, i: number) => <SaleCard key={s.id} s={s} rank={i + 1} />)}
          </div>
        ) : (
          <div className="adslot">
            No documented sales recorded for {win === "year" ? "this year" : "this decade"} yet — Wagyu results publish on a lag, and many private-treaty sales are never reported.
            {" "}<button onClick={() => setWin("")} className="gold" style={{ background: "none", border: "none", cursor: "pointer", font: "inherit", padding: 0 }}>See all-time records →</button>
          </div>
        )}
      </div>

      {d.categories.map((c: any) => (
        (d.data[c.key]?.length > 0) && (
          <div key={c.key} className="section" style={{ paddingTop: 22, paddingBottom: 0 }}>
            <h2 style={{ fontSize: "1.2rem" }}>{c.icon} {c.label}</h2>
            <div className="sale-grid">
              {d.data[c.key].map((s: any) => <SaleCard key={s.id} s={s} />)}
            </div>
          </div>
        )
      ))}

      <p className="help" style={{ marginTop: 30 }}>
        Prices as reported by the cited sources; Australian sales in AUD, Japanese in JPY, with an
        approximate USD conversion for comparison. Know a record we're missing?{" "}
        <Link href="/advertise" className="gold">Tell us.</Link>
      </p>
    </div>
  );
}
