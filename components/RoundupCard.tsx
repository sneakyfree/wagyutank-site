"use client";
import { useState } from "react";
import { api, PRODUCT_LABEL, money, countryFlag, freshness } from "../lib/api";
import ExportInfo from "./ExportInfo";
import ProductBadge from "./ProductBadge";

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
