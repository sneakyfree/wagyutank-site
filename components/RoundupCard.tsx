"use client";
import { useState } from "react";
import { api, PRODUCT_LABEL, money, countryFlag, freshness } from "../lib/api";
import ExportInfo from "./ExportInfo";
import ProductBadge from "./ProductBadge";

/** One seller photograph, loaded from the seller's own server.
 *  A hotlink that fails is expected and unremarkable -- sellers block hotlinking,
 *  swap files, or take listings down -- so a failure hides the image silently
 *  rather than leaving a broken-image icon on the card, and tells the strip so
 *  it can drop the credit line once nothing is left to credit. */
function SellerPhoto({ url, wide, onDead }: { url: string; wide: boolean; onDead: () => void }) {
  const [dead, setDead] = useState(false);
  if (dead) return null;
  return (
    <img
      src={url}
      alt=""
      loading="lazy"
      decoding="async"
      onError={() => { setDead(true); onDead(); }}
      style={{
        flex: wide ? "1 1 100%" : "1 1 0",
        minWidth: 0, height: "100%", objectFit: "cover",
        display: "block", background: "var(--bg-elev)",
      }}
    />
  );
}

/** The strip across the top of a card. Two photos sit side by side -- an embryo
 *  lot's page usually pictures both parents -- but they are deliberately left
 *  unlabelled: from the page's HTML we cannot honestly say which animal is in
 *  which photograph, and a wrong caption is worse than no caption. */
function ListingPhotos({ images, source }: { images: any[]; source: string }) {
  const urls = (images || []).map((im: any) => im?.url).filter(Boolean).slice(0, 2);
  const [failed, setFailed] = useState(0);
  if (!urls.length || failed >= urls.length) return null;
  return (
    <div>
      {/* Same 4:3 media block a WagyuTank listing card uses, so a photographed
          web listing lines up with its neighbours instead of standing proud. */}
      <div style={{ display: "flex", gap: 2, overflow: "hidden", aspectRatio: "4 / 3" }}>
        {urls.map((u: string, i: number) => (
          <SellerPhoto key={u + i} url={u} wide={urls.length === 1} onDead={() => setFailed((n) => n + 1)} />
        ))}
      </div>
      <div className="faint" style={{ fontSize: "0.68rem", padding: "4px 12px 0" }}>
        Photo hosted by {source}
      </div>
    </div>
  );
}

export default function RoundupCard({ l }: { l: any }) {
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); e.stopPropagation();
    if (busy) return;
    setBusy(true); setError(null);
    try {
      const r = await api.roundupFlag(l.id, email.trim());
      setDone(r?.message || "Request received.");
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card roundup-card">
      <ListingPhotos images={l.listing_images} source={l.source_site} />
      <div className="lc-body">
        <div className="row wrap" style={{ gap: 6, marginBottom: 8 }}>
          <ProductBadge type={l.product_type} />
          <span className="pill roundup-pill">📡 Web listing</span>
          {l.country && <span title={l.country} style={{ fontSize: "0.95rem" }}>{countryFlag(l.country)}</span>}
        </div>
        <div className="lc-title">{l.animal_name || l.title}</div>
        <p className="faint" style={{ fontSize: "0.82rem", margin: "4px 0 10px", lineHeight: 1.5 }}>
          {l.summary}
        </p>
        <div className="row">
          {l.price != null ? (
            <div>
              <span className="lc-price" style={{ fontSize: "1rem" }}>{money(l.price, l.currency)}</span>
              <span className="faint" style={{ fontSize: "0.75rem" }}> {l.price_unit || ""}</span>
            </div>
          ) : <span className="faint" style={{ fontSize: "0.82rem" }}>Contact for price</span>}
          <div className="spacer" />
          <ExportInfo css={l.css_status} regions={l.export_regions} compact />
        </div>
        {(() => { const f = freshness(l); return f ? (
          <div className="row" style={{ gap: 6, marginTop: 10 }}>
            <span className={`fresh-dot ${f.cls}`} title={f.title} />
            <span className="faint" style={{ fontSize: "0.74rem" }} title={f.title}>{f.label}</span>
          </div>
        ) : null; })()}
        <div className="divider" style={{ margin: "10px 0" }} />
        <div className="faint" style={{ fontSize: "0.74rem", marginBottom: 8 }}>
          Listed on <strong style={{ color: "var(--text-dim)" }}>{l.source_site}</strong>
          {l.seller_name ? ` · ${l.seller_name}` : ""} · not a WagyuTank seller
        </div>
        <a href={api.roundupGoUrl(l.id)} target="_blank" rel="noopener noreferrer" className="btn btn-block">
          View original listing ↗
        </a>
        {done ? (
          <p className="help" style={{ marginTop: 8 }}>{done}</p>
        ) : showForm ? (
          <form onSubmit={submit} style={{ marginTop: 8 }} onClick={(e) => e.stopPropagation()}>
            <p className="faint" style={{ fontSize: "0.72rem", marginBottom: 6, lineHeight: 1.5 }}>
              Enter an email on <strong style={{ color: "var(--text-dim)" }}>{l.source_site}</strong> and
              we'll send a one-click removal link there. (Other addresses go to manual review.)
            </p>
            <div className="row" style={{ gap: 6 }}>
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder={`you@${l.source_site}`} disabled={busy}
                style={{ flex: 1, minWidth: 0, fontSize: "0.8rem", padding: "6px 8px" }}
              />
              <button type="submit" className="btn" disabled={busy} style={{ fontSize: "0.78rem" }}>
                {busy ? "…" : "Request"}
              </button>
            </div>
            {error && <p className="help" style={{ marginTop: 6, color: "#c0392b" }}>{error}</p>}
          </form>
        ) : (
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowForm(true); }}
            className="faint roundup-flag" title="Is this your listing? Request removal.">
            This is my listing — remove it
          </button>
        )}
      </div>
    </div>
  );
}
