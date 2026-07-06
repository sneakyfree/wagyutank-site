"use client";
import { EXPORT_REGIONS, cssLabel } from "../lib/api";

export default function ExportInfo({
  css, regions, compact = false,
}: { css?: string; regions?: string[]; compact?: boolean }) {
  const c = cssLabel(css);
  const dests = (regions || []).map((r) => EXPORT_REGIONS.find((x) => x.code === r)).filter(Boolean) as any[];
  if (compact) {
    return (
      <div className="row wrap" style={{ gap: 5 }}>
        <span className={`pill ${c.cls}`} style={{ fontSize: "0.62rem" }}>{css === "css" ? "✈ CSS" : css === "domestic" ? "Domestic" : "Export ?"}</span>
        {dests.map((d) => <span key={d.code} title={d.label} style={{ fontSize: "0.85rem" }}>{d.flag}</span>)}
      </div>
    );
  }
  return (
    <div className="export-info">
      <div className="row" style={{ gap: 8, marginBottom: dests.length ? 8 : 0 }}>
        <span className="faint" style={{ fontSize: "0.8rem", minWidth: 60 }}>✈ Export</span>
        <span className={`pill ${c.cls}`}>{c.text}</span>
      </div>
      {dests.length > 0 && (
        <div className="row wrap" style={{ gap: 6, paddingLeft: 68 }}>
          <span className="faint" style={{ fontSize: "0.78rem" }}>Eligible to:</span>
          {dests.map((d) => (
            <span key={d.code} className="pill pill-dim" style={{ fontSize: "0.7rem" }}>{d.flag} {d.code}</span>
          ))}
        </div>
      )}
      {css === "css" && dests.length === 0 && (
        <p className="help" style={{ paddingLeft: 68, marginTop: 6 }}>CSS-collected — destination protocols vary; confirm per country.</p>
      )}
    </div>
  );
}
