"use client";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import AdSlot from "../../components/AdSlot";

const TIERS = [
  { key: "bronze", name: "Bronze", price: "$49", per: "/mo", featured: false,
    perks: ["In-feed ad card, rotated site-wide", "Click & impression reporting", "Cancel anytime"] },
  { key: "silver", name: "Silver", price: "$99", per: "/mo", featured: true,
    perks: ["Feed + sidebar placement", "2× rotation priority", "“Sponsored” brand badge", "Monthly performance report"] },
  { key: "gold", name: "Gold", price: "$199", per: "/mo", featured: false,
    perks: ["Top banner + feed + sidebar", "Highest rotation priority", "Featured on the Roundup", "Priority support"] },
];

export default function Advertise() {
  const [form, setForm] = useState<any>({
    advertiser_name: "", contact_email: "", headline: "", body: "",
    image_url: "", link_url: "", placement: "feed", tier: "silver",
  });
  const [done, setDone] = useState<string>("");
  const [err, setErr] = useState("");
  const [freeLaunch, setFreeLaunch] = useState(true);

  useEffect(() => { api.adsPricing().then((p: any) => setFreeLaunch(!!p.free_launch)).catch(() => {}); }, []);

  function set(k: string, v: string) { setForm({ ...form, [k]: v }); }

  async function submit() {
    setErr("");
    if (!form.advertiser_name || !form.contact_email || !form.headline || !form.link_url) {
      setErr("Please fill in advertiser, email, headline, and link."); return;
    }
    try {
      const res = await api.submitAd(form);
      setDone(res.message || "Submitted for review.");
    } catch (e: any) { setErr(e.message || "Something went wrong."); }
  }

  return (
    <div className="container section">
      <h1 style={{ fontSize: "2.3rem" }}>Advertise on <span className="gold">WagyuTank</span></h1>
      <p className="muted" style={{ maxWidth: "68ch", fontSize: "1.05rem", lineHeight: 1.7 }}>
        Put your ranch, semen program, or vendor brand in front of Wagyu and Akaushi buyers
        worldwide — the people actively shopping for genetics, embryos, and cloning. Simple flat
        monthly pricing, real click and impression reporting, and you can change or cancel anytime.
      </p>

      {freeLaunch && (
        <div className="roundup-banner" style={{ maxWidth: "68ch", borderColor: "var(--gold)" }}>
          <strong className="gold">🎉 Advertising is free during our launch.</strong>
          <span className="muted"> We're building the audience — get your ad in front of buyers now at
            no charge and lock in an early spot. Paid tiers (below) kick in later; you'll be grandfathered
            in at a founder's rate.</span>
        </div>
      )}

      <div style={{ margin: "26px 0 10px" }}>
        <span className="ad-tag">A live example — this is a feed placement</span>
        <div style={{ maxWidth: 340, marginTop: 8 }}><AdSlot placement="feed" /></div>
      </div>

      <h2 style={{ fontSize: "1.5rem", marginTop: 30 }}>Placements & pricing</h2>
      <p className="faint" style={{ fontSize: "0.85rem" }}>
        {freeLaunch ? "Free during launch — the prices below are what tiers will cost once we exit launch." : "Flat monthly, no per-click fees."}
      </p>
      <div className="tier-grid">
        {TIERS.map((t) => (
          <div key={t.key} className={`tier-card ${t.featured ? "tier-featured" : ""}`}>
            {t.featured && <span className="pill" style={{ marginBottom: 8, display: "inline-block" }}>Most popular</span>}
            <div style={{ fontWeight: 700, fontSize: "1.2rem" }}>{t.name}</div>
            {freeLaunch ? (
              <div className="tier-price">Free <span className="faint" style={{ fontSize: "0.9rem", fontWeight: 500, textDecoration: "line-through" }}>{t.price}{t.per}</span></div>
            ) : (
              <div className="tier-price">{t.price}<span className="faint" style={{ fontSize: "0.9rem", fontWeight: 500 }}>{t.per}</span></div>
            )}
            <ul>{t.perks.map((p) => <li key={p}>{p}</li>)}</ul>
            <button className={`btn ${t.featured ? "btn-gold" : ""} btn-block`} style={{ marginTop: 16 }}
              onClick={() => { set("tier", t.key); document.getElementById("ad-form")?.scrollIntoView({ behavior: "smooth" }); }}>
              Choose {t.name}
            </button>
          </div>
        ))}
      </div>
      <p className="faint" style={{ fontSize: "0.85rem" }}>
        Also available: <strong style={{ color: "var(--text-dim)" }}>featured listings</strong> — boost your own
        WagyuTank listing to the top of search and browse. Ask us about volume and annual rates.
      </p>

      <div id="ad-form" className="card card-pad" style={{ marginTop: 34, maxWidth: 640 }}>
        <h2 style={{ fontSize: "1.4rem", marginTop: 0 }}>Submit your ad</h2>
        {done ? (
          <div className="adslot" style={{ textAlign: "left" }}>
            <strong className="gold">✓ Received.</strong> {done}
          </div>
        ) : (
          <div className="stack" style={{ gap: 12 }}>
            <div className="field"><label>Advertiser / ranch name *</label>
              <input className="input" value={form.advertiser_name} onChange={(e) => set("advertiser_name", e.target.value)} /></div>
            <div className="field"><label>Contact email *</label>
              <input className="input" value={form.contact_email} onChange={(e) => set("contact_email", e.target.value)} placeholder="you@ranch.com" /></div>
            <div className="field"><label>Headline *</label>
              <input className="input" value={form.headline} onChange={(e) => set("headline", e.target.value)} placeholder="Fullblood Wagyu semen — export-eligible" maxLength={120} /></div>
            <div className="field"><label>Body (optional)</label>
              <textarea className="input" rows={2} value={form.body} onChange={(e) => set("body", e.target.value)} maxLength={300} /></div>
            <div className="field"><label>Link URL *</label>
              <input className="input" value={form.link_url} onChange={(e) => set("link_url", e.target.value)} placeholder="https://yourranch.com" /></div>
            <div className="field"><label>Image URL (optional)</label>
              <input className="input" value={form.image_url} onChange={(e) => set("image_url", e.target.value)} placeholder="https://.../banner.jpg" /></div>
            <div className="row" style={{ gap: 12 }}>
              <div className="field" style={{ flex: 1 }}><label>Placement</label>
                <select className="select" value={form.placement} onChange={(e) => set("placement", e.target.value)}>
                  <option value="feed">In-feed card</option>
                  <option value="sidebar">Sidebar</option>
                  <option value="banner">Top banner</option>
                </select></div>
              <div className="field" style={{ flex: 1 }}><label>Tier</label>
                <select className="select" value={form.tier} onChange={(e) => set("tier", e.target.value)}>
                  <option value="bronze">Bronze — $49/mo</option>
                  <option value="silver">Silver — $99/mo</option>
                  <option value="gold">Gold — $199/mo</option>
                </select></div>
            </div>
            {err && <p className="help" style={{ color: "var(--red)" }}>{err}</p>}
            <button className="btn btn-gold btn-lg" onClick={submit}>Submit for review</button>
            <p className="help">No charge yet — we review every ad and email you to confirm placement and invoicing before it goes live.</p>
          </div>
        )}
      </div>
    </div>
  );
}
