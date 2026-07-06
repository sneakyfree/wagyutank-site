"use client";
import { useState } from "react";
import { api, PRODUCT_LABEL, money, countryFlag, freshness } from "../lib/api";
import ExportInfo from "./ExportInfo";

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
