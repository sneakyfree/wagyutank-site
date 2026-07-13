"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../../../lib/api";
import { useAuth } from "../../../lib/auth";

export default function CatalogSubmit() {
  const { user, loading } = useAuth();
  const [info, setInfo] = useState<any>(null);
  const [mine, setMine] = useState<any[]>([]);
  const [f, setF] = useState<any>({ product_type: "semen", ship_country: "USA" });
  const [done, setDone] = useState<string>("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { api.catalogInfo().then(setInfo).catch(() => {}); }, []);
  useEffect(() => { if (user) api.catalogMySubmissions().then(setMine).catch(() => {}); }, [user, done]);

  if (loading) return <div className="container section">Loading…</div>;
  if (!user) return (
    <div className="container section" style={{ maxWidth: 560 }}>
      <h1>Submit to the Catalog</h1>
      <p className="muted">Please <Link href="/login?next=/catalog/submit" className="gold">sign in</Link> to submit your genetics.</p>
    </div>
  );

  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  async function submit() {
    setErr(""); setBusy(true);
    try {
      const r = await api.catalogSubmit(f);
      setDone(r.message || "Submitted!");
      setF({ product_type: "semen", ship_country: "USA" });
    } catch (e: any) { setErr(e.message || "Could not submit."); } finally { setBusy(false); }
  }

  return (
    <div className="container section" style={{ maxWidth: 680 }}>
      <Link href="/catalog" className="gold" style={{ fontSize: "0.85rem" }}>← Back to the Catalog</Link>
      <h1 style={{ fontSize: "2rem", marginTop: 8 }}>Submit to the Catalog</h1>
      {info && <p className="muted">You're submitting to the <strong className="gold">{info.catalog_edition_label}</strong> — deadline {info.catalog_deadline}, mails {info.catalog_mail_month}.</p>}

      {done && <div className="card card-pad" style={{ borderColor: "var(--gold)", marginBottom: 16 }}>✅ {done}</div>}

      <div className="card card-pad stack" style={{ gap: 4 }}>
        <h3 style={{ marginTop: 0 }}>Your genetics</h3>
        <div className="field"><label>Ranch / seller name *</label><input className="input" value={f.ranch_name || ""} onChange={set("ranch_name")} placeholder={user.display_name} /></div>
        <div className="row" style={{ gap: 10 }}>
          <div className="field" style={{ flex: 2 }}><label>Bull / animal name</label><input className="input" value={f.animal_name || ""} onChange={set("animal_name")} placeholder="animal name" /></div>
          <div className="field" style={{ flex: 1 }}><label>Reg #</label><input className="input" value={f.animal_reg || ""} onChange={set("animal_reg")} placeholder="FB1615" /></div>
        </div>
        <div className="row" style={{ gap: 10 }}>
          <div className="field" style={{ flex: 1 }}><label>What are you listing?</label>
            <select className="select" value={f.product_type} onChange={set("product_type")}>
              <option value="semen">Semen</option><option value="embryo">Embryos</option><option value="bull">Bull (whole animal)</option><option value="ranch">My ranch / program</option>
            </select></div>
          <div className="field" style={{ flex: 1 }}><label>Bloodline</label><input className="input" value={f.bloodline || ""} onChange={set("bloodline")} placeholder="bloodline" /></div>
        </div>
        <div className="field"><label>Price note (optional)</label><input className="input" value={f.price_note || ""} onChange={set("price_note")} placeholder="$120/straw · volume discounts" /></div>
        <div className="field"><label>Description</label><textarea className="input" rows={4} value={f.description || ""} onChange={set("description")} placeholder="Marbling, EBVs, CSS/export status, what makes this bull worth breeding to…" /></div>
      </div>

      <div className="card card-pad stack" style={{ gap: 4, marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>Contact & mailing address</h3>
        <p className="faint" style={{ fontSize: "0.82rem", marginTop: -6 }}>Add a mailing address to receive a printed copy. Left blank, you'll still get the digital edition.</p>
        <div className="row" style={{ gap: 10 }}>
          <div className="field" style={{ flex: 1 }}><label>Contact email</label><input className="input" value={f.contact_email ?? user.email} onChange={set("contact_email")} /></div>
          <div className="field" style={{ flex: 1 }}><label>Phone</label><input className="input" value={f.contact_phone || ""} onChange={set("contact_phone")} /></div>
        </div>
        <div className="field"><label>Website</label><input className="input" value={f.website || ""} onChange={set("website")} placeholder="https://…" /></div>
        <div className="field"><label>Ship printed copy to (name)</label><input className="input" value={f.ship_name || ""} onChange={set("ship_name")} /></div>
        <div className="field"><label>Street address</label><input className="input" value={f.ship_address || ""} onChange={set("ship_address")} /></div>
        <div className="row" style={{ gap: 10 }}>
          <div className="field" style={{ flex: 2 }}><label>City</label><input className="input" value={f.ship_city || ""} onChange={set("ship_city")} /></div>
          <div className="field" style={{ flex: 1 }}><label>State/Region</label><input className="input" value={f.ship_region || ""} onChange={set("ship_region")} /></div>
        </div>
        <div className="row" style={{ gap: 10 }}>
          <div className="field" style={{ flex: 1 }}><label>Postal code</label><input className="input" value={f.ship_postal || ""} onChange={set("ship_postal")} /></div>
          <div className="field" style={{ flex: 1 }}><label>Country</label><input className="input" value={f.ship_country || ""} onChange={set("ship_country")} /></div>
        </div>
      </div>

      {err && <p className="help" style={{ color: "var(--red)", marginTop: 10 }}>{err}</p>}
      <div style={{ marginTop: 16 }}>
        <button className="btn btn-gold btn-lg" disabled={busy || !(f.ranch_name || user.display_name) || !(f.animal_name || f.description)} onClick={submit}>
          {busy ? "Submitting…" : "Submit to the catalog"}
        </button>
      </div>

      {mine.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <h3 style={{ fontSize: "1.1rem" }}>Your submissions</h3>
          <div className="stack" style={{ gap: 8 }}>
            {mine.map((s) => (
              <div key={s.id} className="card card-pad row" style={{ gap: 10 }}>
                <div><b>{s.animal_name || s.ranch_name}</b> <span className="faint">· {s.product_type} · {s.edition}</span></div>
                <div className="spacer" />
                <span className={`pill ${s.status === "approved" ? "pill-green" : s.status === "rejected" ? "pill-red" : "pill-dim"}`}>{s.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
