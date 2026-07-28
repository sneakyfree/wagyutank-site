"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api, money, countryFlag, freshness, PRODUCT_LABEL } from "../../../lib/api";
import { useLang } from "../../../lib/i18n";
import ExportInfo from "../../../components/ExportInfo";

// The page that closes the language gap on a click-out.
//
// A buyer browsing in Japanese used to hit a Roundup card, click through, and
// land on an English-only seller site in Texas. We cannot translate that site —
// same-origin forbids it, and proxying it would reproduce their content, break
// their contact form and blind their analytics, which is the opposite of the
// good-actor bargain the Roundup runs on.
//
// So this page translates what we DO lawfully hold: our own summary, plus the
// seller's buyer-relevant terms captured at crawl time (pedigree notes, health
// testing, shipping and export conditions, minimum order, how to make contact).
// The reader arrives at the seller's site already knowing what is on offer —
// going there to transact rather than to read. That helps the seller too: a
// buyer who understood the listing is a buyer who might actually email them.
//
// Attribution stays loud. This is our summary of a public listing, the seller is
// not a WagyuTank seller, and the original is one obvious click away.

function DetailInner() {
  const id = useSearchParams().get("id");
  const { lang } = useLang();
  const [l, setL] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    setL(null);
    api.roundupDetail(id).then(setL).catch(() => setL(false));
  }, [id, lang]);

  if (l === false) return (
    <div className="container section">
      <h1>Listing not found</h1>
      <p className="muted"><Link href="/roundup" className="gold">← Back to the Roundup</Link></p>
    </div>
  );
  if (!l) return <div className="container section">Loading…</div>;

  const f = freshness(l);
  const translated = l.translated_to && l.translated_to !== "en";

  return (
    <div className="container section">
      <Link href="/roundup" className="gold" style={{ fontSize: "0.85rem" }}>← The Roundup</Link>

      <div className="row wrap" style={{ gap: 28, marginTop: 14, alignItems: "flex-start" }}>
        <div style={{ flex: "1 1 560px", minWidth: 300 }}>
          <div className="row" style={{ gap: 8, marginBottom: 8 }}>
            <span className="pill roundup-pill">📡 {PRODUCT_LABEL?.[l.product_type] || l.product_type}</span>
            {l.country && <span className="pill pill-dim">{countryFlag(l.country)} {l.country}</span>}
          </div>
          <h1 style={{ fontSize: "1.5rem", lineHeight: 1.3 }}>{l.title}</h1>

          {l.summary && (
            <p style={{ marginTop: 10, lineHeight: 1.6 }}>{l.summary}</p>
          )}

          {l.details ? (
            <div className="card" style={{ marginTop: 16, padding: "1rem 1.1rem" }}>
              <div className="faint" style={{ fontSize: "0.74rem", marginBottom: 6 }}>
                From the seller's listing{translated ? " · translated for you" : ""}
              </div>
              <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.65, margin: 0 }}>{l.details}</p>
            </div>
          ) : (
            <p className="faint" style={{ marginTop: 14, fontSize: "0.85rem" }}>
              We haven't captured this seller's own wording yet — it fills in on the
              next crawl. The original listing has the full terms.
            </p>
          )}

          <div className="divider" style={{ margin: "18px 0" }} />
          <div className="faint" style={{ fontSize: "0.78rem", marginBottom: 10, lineHeight: 1.6 }}>
            This is WagyuTank's summary of a public listing on{" "}
            <strong style={{ color: "var(--text-dim)" }}>{l.source_site}</strong>
            {l.seller_name ? ` by ${l.seller_name}` : ""} — <strong>not a WagyuTank seller</strong>.
            {translated && " Machine-translated; the original is authoritative."}
          </div>
          <a href={api.roundupGoUrl(l.id)} target="_blank" rel="noopener noreferrer"
             className="btn btn-gold btn-block">View original listing ↗</a>
        </div>

        <aside style={{ flex: "0 1 300px", minWidth: 250 }}>
          <div className="card" style={{ padding: "1rem 1.1rem" }}>
            {l.price != null ? (
              <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>
                {money(l.price, l.currency)}
                {l.price_unit && <span className="faint" style={{ fontSize: "0.8rem", fontWeight: 400 }}> {l.price_unit}</span>}
              </div>
            ) : <div className="faint">Contact for price</div>}
            {l.quantity_text && <div className="faint" style={{ fontSize: "0.85rem", marginTop: 4 }}>{l.quantity_text}</div>}

            <div className="divider" style={{ margin: "12px 0" }} />
            <ExportInfo css={l.css_status} regions={l.export_regions} />

            <dl style={{ marginTop: 12, fontSize: "0.86rem", lineHeight: 1.8 }}>
              {l.animal_name && <><dt className="faint">Animal</dt><dd style={{ margin: 0 }}>{l.animal_name}</dd></>}
              {l.animal_reg && <><dt className="faint">Registration</dt><dd style={{ margin: 0 }}>{l.animal_reg}</dd></>}
              {l.bloodline && <><dt className="faint">Bloodline</dt><dd style={{ margin: 0 }}>{l.bloodline}</dd></>}
              {l.location && <><dt className="faint">Location</dt><dd style={{ margin: 0 }}>{l.location}</dd></>}
            </dl>

            {f && (
              <div className="row" style={{ gap: 6, marginTop: 10 }}>
                <span className={`fresh-dot ${f.cls}`} title={f.title} />
                <span className="faint" style={{ fontSize: "0.74rem" }} title={f.title}>{f.label}</span>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function RoundupListingPage() {
  return <Suspense fallback={<div className="container section">Loading…</div>}><DetailInner /></Suspense>;
}
