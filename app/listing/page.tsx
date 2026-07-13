"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api, PRODUCT_GLYPH, PRODUCT_LABEL, money, basisLabel, placeLine, ageFromDob } from "../../lib/api";
import { productFamily, productUnit } from "../../lib/tank";
import { useAuth } from "../../lib/auth";
import Checkout from "../../components/Checkout";
import ExportInfo from "../../components/ExportInfo";
import PeerLink from "../../components/PeerLink";

// "bred_heifer" → "Bred heifer" — enum values from the live/beef fields.
function pretty(s?: string | null): string {
  if (!s) return "";
  const t = String(s).replace(/_/g, " ");
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function ListingDetail() {
  const id = useSearchParams().get("id") || "";
  const { user } = useAuth();
  const [l, setL] = useState<any>(null);
  const [bid, setBid] = useState("");
  const [toast, setToast] = useState("");
  const [err, setErr] = useState("");
  const [checkout, setCheckout] = useState<{ secret: string | null; label: string } | null>(null);

  function load() { if (id) api.listing(id).then(setL).catch(() => setL(false as any)); }
  useEffect(() => { load(); if (id) api.track("listing_view", { id }); /* eslint-disable-next-line */ }, [id]);

  if (l === false) return <div className="container section">Listing not found.</div>;
  if (!l) return <div className="container section">Loading…</div>;

  const isAuction = l.sale_type === "auction";
  const isClone = l.product_type === "clone_rights";
  const family = productFamily(l.product_type);
  const isLive = family === "live";
  const isBeef = family === "beef";
  const isGenetics = family === "genetics";

  async function placeBid() {
    setErr("");
    try {
      const updated = await api.bid(l.id, parseFloat(bid));
      setL(updated); setBid(""); setToast("Bid placed!");
      setTimeout(() => setToast(""), 2500);
    } catch (e: any) { setErr(e.message); }
  }

  async function buyNow() {
    setErr("");
    try {
      const res = await api.buyIntent(l.id);
      if (res.dev_mode) { setToast("Test order created (Stripe not fully live)."); setTimeout(() => setToast(""), 2500); return; }
      setCheckout({ secret: res.client_secret, label: money(res.buyer_total_cents / 100, l.currency) });
    } catch (e: any) { setErr(e.message); }
  }

  function share() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) navigator.share({ title: l.title, url }).catch(() => {});
    else { navigator.clipboard.writeText(url); setToast("Link copied!"); setTimeout(() => setToast(""), 2000); }
  }

  const total = isClone && l.lab_production_cost ? (l.unit_price || 0) + l.lab_production_cost : null;

  return (
    <div className="container section">
      <div className="grid" style={{ gridTemplateColumns: "1fr", gap: 30 }}>
        <div className="grid" style={{ gridTemplateColumns: "minmax(0,1fr)", gap: 30 }}>
          <div style={{ display: "grid", gap: 30, gridTemplateColumns: "1fr" }}>
            <div className="row wrap" style={{ alignItems: "flex-start", gap: 30 }}>
              {/* Media */}
              <div style={{ flex: "1 1 320px", minWidth: 280 }}>
                <div className="card lc-media" style={{ aspectRatio: "4/3" }}>
                  {l.photo_url ? <img src={l.photo_url} alt={l.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <span className="glyph">{PRODUCT_GLYPH[l.product_type]}</span>}
                </div>
                {l.video_embed_url && (
                  <div className="card" style={{ marginTop: 14, aspectRatio: "16/9" }}>
                    <iframe src={l.video_embed_url} style={{ width: "100%", height: "100%", border: 0 }} allowFullScreen />
                  </div>
                )}
              </div>

              {/* Buy box */}
              <div style={{ flex: "1 1 340px", minWidth: 300 }}>
                <div className="row" style={{ gap: 6, marginBottom: 10 }}>
                  {l.is_sample && <span className="pill pill-sample">SAMPLE LISTING</span>}
                  <span className="pill pill-dim">{PRODUCT_LABEL[l.product_type]}</span>
                  {isAuction && <span className="pill pill-red">{l.no_reserve ? "No Reserve" : "Auction"}</span>}
                  {l.exclusive && <span className="pill">Exclusive</span>}
                  {l.featured && <span className="pill">★ Featured</span>}
                </div>
                {l.is_sample && (
                  <div className="sample-banner">
                    <b>This is a sample listing.</b> WagyuTank just launched — this ad shows what
                    yours will look like. Listing is free and takes about a minute.
                  </div>
                )}
                <h1 style={{ fontSize: "1.7rem" }}>{l.title}</h1>
                {l.seller_handle && (
                  <div className="muted" style={{ fontSize: "0.9rem", marginTop: 4 }}>
                    Sold by <Link href={`/u?handle=${l.seller_handle}`} className="gold">@{l.seller_handle}</Link>
                  </div>
                )}

                <div className="card card-pad" style={{ marginTop: 16 }}>
                  <div className="big-price">
                    {money(isAuction ? l.current_bid ?? l.start_price : l.unit_price, l.currency)}
                    <span className="faint" style={{ fontSize: "0.9rem", fontWeight: 500 }}>
                      {" "}{isAuction ? "current bid" : isClone ? "rights fee" : isLive || isBeef ? (basisLabel(l.price_basis) || `/ ${productUnit(l.product_type)}`) : l.product_type === "semen" ? "/ straw" : "/ embryo"}
                    </span>
                  </div>

                  {isClone && l.lab_production_cost != null && (
                    <div style={{ marginTop: 12 }}>
                      <div className="kv"><span className="k">Rights fee (to seller)</span><span>{money(l.unit_price, l.currency)}</span></div>
                      <div className="kv"><span className="k">Est. lab production (to cloning facility)</span><span>{money(l.lab_production_cost, l.currency)}</span></div>
                      <div className="kv" style={{ fontWeight: 700 }}><span>Estimated all-in</span><span className="gold">{money(total, l.currency)}</span></div>
                      <p className="help">A clone is a live birth via surrogate, produced months later at the cloning facility (typical success ~80%). You license the rights here; production is arranged with the facility.</p>
                    </div>
                  )}

                  <div className="faint" style={{ margin: "10px 0", fontSize: "0.88rem" }}>
                    {isLive && l.head_count ? `${l.head_count} head` : l.quantity_display}
                  </div>

                  {l.is_sample ? (
                    <Link href="/sell" className="btn btn-gold btn-block btn-lg" style={{ textAlign: "center" }}>
                      Post your own listing — free
                    </Link>
                  ) : isBeef ? (
                    // Beef is discovery-only — no on-site checkout; buyers order
                    // directly from the producer.
                    <div className="stack">
                      {l.external_url ? (
                        <a href={l.external_url} target="_blank" rel="noopener nofollow" className="btn btn-gold btn-block btn-lg" style={{ textAlign: "center" }}>
                          Contact the producer ↗
                        </a>
                      ) : l.seller_handle ? (
                        <Link href={`/u?handle=${l.seller_handle}`} className="btn btn-gold btn-block btn-lg" style={{ textAlign: "center" }}>
                          Contact the producer
                        </Link>
                      ) : null}
                      <p className="help">You order and pay directly with the producer — this listing is here so you can find them.</p>
                    </div>
                  ) : isAuction ? (
                    <div className="stack">
                      <div className="row">
                        <input className="input" placeholder="Your bid" value={bid} onChange={(e) => setBid(e.target.value)} inputMode="decimal" />
                        <button className="btn btn-gold" disabled={!user || !bid} onClick={placeBid}>Place bid</button>
                      </div>
                      {!user && <p className="help">Sign in and add a payment method to bid.</p>}
                    </div>
                  ) : (
                    <button className="btn btn-gold btn-block btn-lg" disabled={!user} onClick={buyNow}>
                      {user ? "Buy now" : "Sign in to buy"}
                    </button>
                  )}
                  {!isAuction && !l.is_sample && !isBeef && (
                    <p className="help">
                      {isLive
                        ? "Buyer covers card processing (shown at checkout). Transport is arranged with the seller."
                        : "Buyer covers card processing (shown at checkout). You pay the facility for shipping at cost."}
                    </p>
                  )}
                  <button className="btn btn-block" style={{ marginTop: 10 }} onClick={share}>↗ Share</button>
                  {err && <p className="help" style={{ color: "var(--red)" }}>{err}</p>}
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="row wrap" style={{ alignItems: "flex-start", gap: 30 }}>
              <div style={{ flex: "1 1 340px" }}>
                <h2 style={{ fontSize: "1.2rem" }}>About this listing</h2>
                <p className="muted">{l.description}</p>
                {(l.animal_reg || l.sire_reg) && (
                  <p style={{ marginTop: 14 }}>
                    <Link className="btn" href={`/animal?reg=${encodeURIComponent(l.animal_reg || l.sire_reg)}`}>
                      🧬 View pedigree & registry record →
                    </Link>
                  </p>
                )}
                <PeerLink reg={l.animal_reg || l.sire_reg || l.service_sire_reg} style={{ marginTop: 10 }} />
              </div>
              <div style={{ flex: "1 1 300px" }}>
                {isGenetics && (
                  <>
                    <h2 style={{ fontSize: "1.2rem" }}>Export eligibility</h2>
                    <div className="card card-pad" style={{ marginBottom: 16 }}>
                      <ExportInfo css={l.css_status} regions={l.export_eligibility} />
                    </div>
                    <h2 style={{ fontSize: "1.2rem" }}>Storage & shipping</h2>
                    <div className="kv"><span className="k">Who ships</span><span>Storage facility, on seller's release</span></div>
                    <div className="kv"><span className="k">Shipping cost</span><span>{l.who_pays_shipping === "buyer" ? "Buyer pays at cost" : l.who_pays_shipping}</span></div>
                    <p className="help">Frozen genetics stay in the facility's tank and ship tank-to-tank or in an IATA dry shipper. Buyer confirms a receiving account at checkout. Only CSS-collected semen (and embryos made from it) can be exported; destination protocols vary by country.</p>
                  </>
                )}
                {isLive && (
                  <>
                    <h2 style={{ fontSize: "1.2rem" }}>Animal details</h2>
                    {l.animal_class && <div className="kv"><span className="k">Class</span><span>{pretty(l.animal_class)}</span></div>}
                    {l.head_count != null && <div className="kv"><span className="k">Head count</span><span>{l.head_count}</span></div>}
                    {l.dob && <div className="kv"><span className="k">Age</span><span>{ageFromDob(l.dob) || "—"} (b. {new Date(l.dob).toLocaleDateString()})</span></div>}
                    {l.weight_lbs != null && <div className="kv"><span className="k">Weight</span><span>{Number(l.weight_lbs).toLocaleString()} lbs</span></div>}
                    {l.bred_status && <div className="kv"><span className="k">Bred status</span><span>{pretty(l.bred_status)}</span></div>}
                    {l.due_date && <div className="kv"><span className="k">Due date</span><span>{new Date(l.due_date).toLocaleDateString()}</span></div>}
                    {l.service_sire_reg && <div className="kv"><span className="k">Service sire</span><span>{l.service_sire_reg}</span></div>}
                    <div className="kv"><span className="k">Delivery</span><span>{l.delivery_available ? "Seller can arrange delivery" : "Buyer arranges transport"}</span></div>
                    {l.freight_note && <div className="kv"><span className="k">Freight</span><span style={{ maxWidth: "60%", textAlign: "right" }}>{l.freight_note}</span></div>}
                    {placeLine(l) && <div className="kv"><span className="k">Location</span><span>{placeLine(l)}{l.postal_code ? ` · ${l.postal_code}` : ""}</span></div>}
                    <p className="help">Live animals sell on the hoof — inspect before you buy where possible, and confirm health papers and transport with the seller.</p>
                  </>
                )}
                {isBeef && (
                  <>
                    <h2 style={{ fontSize: "1.2rem" }}>Product details</h2>
                    {l.beef_cut_type && <div className="kv"><span className="k">Cut</span><span>{pretty(l.beef_cut_type)}</span></div>}
                    {l.box_weight_lbs != null && <div className="kv"><span className="k">Box weight</span><span>{Number(l.box_weight_lbs).toLocaleString()} lbs</span></div>}
                    {l.fulfillment && <div className="kv"><span className="k">Fulfillment</span><span>{l.fulfillment === "both" ? "Ships or local pickup" : l.fulfillment === "ship" ? "Ships" : "Local pickup"}</span></div>}
                    {placeLine(l) && <div className="kv"><span className="k">Location</span><span>{placeLine(l)}{l.postal_code ? ` · ${l.postal_code}` : ""}</span></div>}
                    <h2 style={{ fontSize: "1.2rem", marginTop: 16 }}>Contact the producer</h2>
                    <div className="card card-pad">
                      {l.external_url && (
                        <a href={l.external_url} target="_blank" rel="noopener nofollow" className="btn btn-gold btn-block" style={{ textAlign: "center" }}>
                          Order from the producer ↗
                        </a>
                      )}
                      {l.seller_handle && (
                        <Link href={`/u?handle=${l.seller_handle}`} className="btn btn-block" style={{ textAlign: "center", marginTop: l.external_url ? 8 : 0 }}>
                          View @{l.seller_handle}'s storefront
                        </Link>
                      )}
                      <p className="help" style={{ marginTop: 8 }}>Orders and payment happen directly with the producer.</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {toast && <div className="toast">{toast}</div>}
      {checkout && (
        <Checkout
          clientSecret={checkout.secret}
          amountLabel={checkout.label}
          onClose={() => setCheckout(null)}
          onSuccess={() => { setCheckout(null); setToast("Purchase complete! 🎉"); load(); setTimeout(() => setToast(""), 3000); }}
        />
      )}
    </div>
  );
}

export default function ListingPage() {
  return <Suspense fallback={<div className="container section">Loading…</div>}><ListingDetail /></Suspense>;
}
