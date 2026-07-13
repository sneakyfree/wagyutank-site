"use client";
import Link from "next/link";
import { PRODUCT_GLYPH, PRODUCT_LABEL, money, basisLabel, placeLine } from "../lib/api";
import { productFamily, productUnit } from "../lib/tank";
import ExportInfo from "./ExportInfo";
import ProductBadge, { ProductMark } from "./ProductBadge";

// The price sub-line under the number. Genetics keeps its exact historic strings;
// live/beef read the seller's price basis (falling back to the config unit).
function priceSubline(l: any, isAuction: boolean, family: string): string {
  if (isAuction) return "current bid";
  if (family === "live" || family === "beef") {
    return basisLabel(l.price_basis) || `per ${productUnit(l.product_type)}`;
  }
  return l.product_type === "semen" ? "per straw" : l.product_type === "clone_rights" ? "rights fee" : "per embryo";
}

export default function ListingCard({ l }: { l: any }) {
  const isAuction = l.sale_type === "auction";
  const family = productFamily(l.product_type);
  const price = isAuction ? l.current_bid ?? l.start_price : l.unit_price;
  const place = family === "genetics" ? "" : placeLine(l);
  return (
    <Link href={`/listing?id=${l.id}`} className="card">
      <div className="lc-media">
        {l.photo_url ? (
          <img src={l.photo_url} alt={l.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span className="glyph">{PRODUCT_GLYPH[l.product_type] || "🧬"}</span>
        )}
        {l.is_sample ? <span className="pill pill-sample badge-featured">SAMPLE</span>
          : l.featured && <span className="pill badge-featured">★ Featured</span>}
        <ProductMark type={l.product_type} />
      </div>
      <div className="lc-body">
        <div className="row" style={{ gap: 6, marginBottom: 8 }}>
          <ProductBadge type={l.product_type} />
          {isAuction && <span className="pill pill-red">{l.no_reserve ? "No Reserve" : "Auction"}</span>}
          {l.exclusive && <span className="pill">Exclusive</span>}
        </div>
        <div className="lc-title">{l.title}</div>
        <div className="row">
          <div>
            <div className="lc-price">{money(price, l.currency)}</div>
            <div className="faint" style={{ fontSize: "0.78rem" }}>
              {priceSubline(l, isAuction, family)}
            </div>
          </div>
          <div className="spacer" />
          <div className="faint" style={{ fontSize: "0.78rem", textAlign: "right" }}>
            {family === "live" && l.head_count ? `${l.head_count} head` : l.quantity_display}
          </div>
        </div>
        {place && (
          <div className="faint" style={{ marginTop: 6, fontSize: "0.78rem" }}>📍 {place}</div>
        )}
        {family === "genetics" &&
        ((l.css_status && l.css_status !== "unknown") || (l.export_eligibility && l.export_eligibility.length)) ? (
          <div style={{ marginTop: 8 }}>
            <ExportInfo css={l.css_status} regions={l.export_eligibility} compact />
          </div>
        ) : null}
      </div>
    </Link>
  );
}
