"use client";
import { useState } from "react";
import { api, PRODUCT_GLYPH, PRODUCT_LABEL, money } from "../lib/api";

export default function RoundupCard({ l }: { l: any }) {
  const [flagged, setFlagged] = useState(false);

  async function flag(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    try { await api.roundupFlag(l.id); setFlagged(true); } catch {}
  }

  return (
    <div className="card roundup-card">
      <div className="lc-body">
        <div className="row wrap" style={{ gap: 6, marginBottom: 8 }}>
          <span className="pill pill-dim">{PRODUCT_LABEL[l.product_type]}</span>
          <span className="pill roundup-pill">📡 Web listing</span>
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
        </div>
        <div className="divider" style={{ margin: "12px 0 10px" }} />
        <div className="faint" style={{ fontSize: "0.74rem", marginBottom: 8 }}>
          Listed on <strong style={{ color: "var(--text-dim)" }}>{l.source_site}</strong>
          {l.seller_name ? ` · ${l.seller_name}` : ""} · not a WagyuTank seller
        </div>
        <a href={api.roundupGoUrl(l.id)} target="_blank" rel="noopener noreferrer" className="btn btn-block">
          View original listing ↗
        </a>
        {flagged ? (
          <p className="help" style={{ marginTop: 6 }}>Flagged — hidden pending review. Thank you.</p>
        ) : (
          <button onClick={flag} className="faint roundup-flag" title="Is this your listing? Remove it.">
            This is my listing — remove it
          </button>
        )}
      </div>
    </div>
  );
}
