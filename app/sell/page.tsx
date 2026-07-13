"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, PRODUCT_GLYPH, PRODUCT_LABEL, money, EXPORT_REGIONS } from "../../lib/api";
import { products, productFamily, productOptions, hasFamily } from "../../lib/tank";
import { useAuth } from "../../lib/auth";

// Product cards come from this tank's baked config; the fallbacks below only
// fill gaps for configs that predate the glyph/blurb fields.
const FALLBACK_BLURB: Record<string, string> = {
  semen: "Straws from a proven sire",
  embryo: "Full-blood sire × dam",
  clone_rights: "License a banked cell line",
  live_animal: "Cattle on the hoof — singles, pairs, or pens",
  beef: "Direct-from-producer boxes, quarters & halves",
};
const PRODUCTS = products().map((p) => ({
  key: p.key,
  glyph: p.glyph || PRODUCT_GLYPH[p.key] || "🐄",
  label: p.label || PRODUCT_LABEL[p.key] || p.key,
  blurb: p.blurb || FALLBACK_BLURB[p.key] || "",
}));

// Per-family enum options — config `options` wins, these are the defaults.
const ANIMAL_CLASSES = ["bull", "cow", "bred_heifer", "open_heifer", "bull_calf", "heifer_calf", "pair", "feeder", "steer"];
const BEEF_CUTS = ["quarter", "half", "whole", "box", "cuts", "ground"];
const COUNTRIES = ["US", "CA", "MX", "AU", "NZ", "GB", "IE", "BR", "AR", "UY", "ZA"];
const prettyOpt = (s: string) => s.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());

export default function Sell() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);

  // draft state
  const [productType, setProductType] = useState("");
  const [animalQuery, setAnimalQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [animal, setAnimal] = useState<any>(null);
  const [dam, setDam] = useState<any>(null);
  const [description, setDescription] = useState("");
  const [genErr, setGenErr] = useState("");

  const [form, setForm] = useState<any>({
    sale_type: "fixed", unit_price: "", currency: "USD",
    start_price: "", no_reserve: false, quantity_available: 1,
    quantity_visibility: "in_stock_only", semen_type: "conventional",
    exclusive: false, rights_count: 1, lab_production_cost: "",
    export_eligibility: [] as string[], css_status: "unknown",
    // live-animal fields
    animal_class: "", head_count: "", dob: "", weight_lbs: "",
    bred_status: "open", due_date: "", service_sire_reg: "",
    delivery_available: false, freight_note: "",
    // Cattle auctions run days, not the frozen-genetics default — 7-day floor.
    auction_days: "7",
    // beef fields (discovery-only)
    beef_cut_type: "", box_weight_lbs: "", fulfillment: "both", external_url: "",
    // shared live/beef: pricing basis + seller location
    price_basis: "", country: "US", state_region: "", postal_code: "",
  });
  const [facilityQuery, setFacilityQuery] = useState("");
  const [facilities, setFacilities] = useState<any[]>([]);
  const [facility, setFacility] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractNote, setExtractNote] = useState("");

  async function onScreenshot(file: File) {
    setExtracting(true); setExtractNote("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const data = await api.extractPedigree(fd);
      if (data._needs_manual_entry || !data.name) {
        setExtractNote("Couldn't auto-read this image — type the registration number or confirm the details manually.");
      } else {
        setAnimal(data); setAnimalQuery(data.name);
        setExtractNote(`Read ${data.name}${data.registration_no ? ` (${data.registration_no})` : ""} from your screenshot.`);
      }
    } catch {
      setExtractNote("Extraction failed — you can still type the registration number.");
    } finally { setExtracting(false); }
  }

  useEffect(() => {
    if (animalQuery.length < 2) { setSuggestions([]); return; }
    const t = setTimeout(() => api.suggestAnimals(animalQuery).then(setSuggestions).catch(() => {}), 200);
    return () => clearTimeout(t);
  }, [animalQuery]);

  useEffect(() => {
    if (facilityQuery.length < 1) { setFacilities([]); return; }
    const t = setTimeout(() => api.facilities(facilityQuery).then(setFacilities).catch(() => {}), 200);
    return () => clearTimeout(t);
  }, [facilityQuery]);

  if (loading) return <div className="container section">Loading…</div>;
  if (!user) return (
    <div className="container section center">
      <h1>{hasFamily("live") || hasFamily("beef") ? "Create your listing" : "List your genetics"}</h1>
      <p className="muted">Sign in to create a listing — it takes under a minute, and it's free.</p>
      <Link href="/login?next=/sell" className="btn btn-gold btn-lg" style={{ marginTop: 12 }}>Sign in to sell</Link>
    </div>
  );

  const isClone = productType === "clone_rights";
  const isEmbryo = productType === "embryo";
  const isSemen = productType === "semen";
  const family = productFamily(productType);
  const isLive = family === "live";
  const isBeef = family === "beef";
  const opts = productOptions(productType);
  const animalClasses = opts.animal_class?.length ? opts.animal_class : ANIMAL_CLASSES;
  const beefCuts = opts.beef_cut_type?.length ? opts.beef_cut_type : BEEF_CUTS;

  async function pickAnimal(a: any, which: "sire" | "dam" = "sire") {
    if (which === "dam") { setDam(a); return; }
    setAnimal(a); setSuggestions([]); setAnimalQuery(a.name);
  }

  async function generateAd() {
    setGenErr("");
    try {
      // Live/beef listings usually have no registered animal — give the ad
      // writer the class/cut instead so it still has something to work with.
      const fallbackName = isLive ? prettyOpt(form.animal_class || "") : isBeef ? prettyOpt(form.beef_cut_type || "") : "";
      const res = await api.adCopy({
        product_type: productType,
        animal: {
          name: animal?.name || animalQuery || fallbackName,
          registration_no: animal?.registration_no || null,
          bloodline: animal?.bloodline, bloodline_detail: animal?.bloodline_detail,
          breed: animal?.breed, sire_name: isEmbryo ? animal?.name : null,
        },
      });
      setDescription(res.description);
    } catch (e: any) { setGenErr(e.message); }
  }

  function toggleExport(code: string) {
    setForm((f: any) => ({
      ...f,
      export_eligibility: f.export_eligibility.includes(code)
        ? f.export_eligibility.filter((c: string) => c !== code)
        : [...f.export_eligibility, code],
    }));
  }

  async function publish() {
    setSubmitting(true);
    try {
      if (!user!.is_seller) await api.becomeSeller();
      const payload: any = {
        product_type: productType,
        description,
        sale_type: form.sale_type,
        currency: form.currency,
        quantity_available: Number(form.quantity_available) || 1,
        quantity_visibility: form.quantity_visibility,
        export_eligibility: form.export_eligibility,
        css_status: form.css_status,
        storage_facility_id: facility?.id,
      };
      if (isEmbryo) { payload.sire_reg = animal?.registration_no; payload.dam_reg = dam?.registration_no; }
      else { payload.animal_reg = animal?.registration_no; }
      if (isSemen) payload.semen_type = form.semen_type;
      if (isClone) { payload.rights_count = Number(form.rights_count); payload.exclusive = form.exclusive; payload.lab_production_cost = Number(form.lab_production_cost) || null; payload.cloning_facility_id = facility?.id; }
      if (form.sale_type === "fixed") payload.unit_price = Number(form.unit_price);
      else { payload.start_price = Number(form.start_price); payload.no_reserve = form.no_reserve; }

      // Live/beef families carry their own spec + seller location; genetics
      // payloads are untouched.
      if (isLive || isBeef) {
        payload.price_basis = form.price_basis || null;
        payload.country = form.country || null;
        payload.state_region = form.state_region || null;
        payload.postal_code = form.postal_code || null;
      }
      if (isLive) {
        payload.animal_class = form.animal_class || null;
        payload.head_count = Number(form.head_count) || 1;
        payload.quantity_available = Number(form.head_count) || 1;
        payload.dob = form.dob || null;
        payload.weight_lbs = Number(form.weight_lbs) || null;
        payload.bred_status = form.bred_status || null;
        payload.due_date = (form.bred_status === "bred" || form.bred_status === "exposed") ? form.due_date || null : null;
        payload.service_sire_reg = form.service_sire_reg || null;
        payload.delivery_available = !!form.delivery_available;
        payload.freight_note = form.freight_note || null;
        // Cattle auctions run days, not hours — 7-day default end.
        if (form.sale_type === "auction") {
          payload.ends_at = new Date(Date.now() + (Number(form.auction_days) || 7) * 86400000).toISOString();
        }
      }
      if (isBeef) {
        payload.sale_type = "fixed"; // discovery-only, no auctions
        payload.beef_cut_type = form.beef_cut_type || null;
        payload.box_weight_lbs = Number(form.box_weight_lbs) || null;
        payload.fulfillment = form.fulfillment || null;
        payload.external_url = form.external_url.trim();
        payload.unit_price = form.unit_price ? Number(form.unit_price) : null;
      }

      const listing = await api.createListing(payload);
      router.push(`/listing?id=${listing.id}`);
    } catch (e: any) { setGenErr(e.message); setSubmitting(false); }
  }

  const steps = ["Product", "Animal", "Ad", "Price", "Storage", "Publish"];

  return (
    <div className="container section" style={{ maxWidth: 720 }}>
      <div className="steps">
        {steps.map((_, i) => <div key={i} className={`step-dot ${i <= step ? "active" : ""}`} />)}
      </div>

      {/* Step 0 — product */}
      {step === 0 && (
        <div>
          <h1>What are you selling?</h1>
          <div className="cats" style={{ marginTop: 20 }}>
            {PRODUCTS.map((p) => (
              <button key={p.key} className="cat" style={{ textAlign: "left", cursor: "pointer" }}
                onClick={() => {
                  const fam = productFamily(p.key);
                  setProductType(p.key);
                  // Sensible per-family defaults; beef is discovery-only (no auctions).
                  setForm((f: any) => ({
                    ...f,
                    price_basis: fam === "live" ? "per_head" : fam === "beef" ? "per_lb" : "",
                    sale_type: fam === "beef" ? "fixed" : f.sale_type,
                  }));
                  setStep(1);
                }}>
                <div className="glyph">{p.glyph}</div>
                <h3>{p.label}</h3>
                <p className="muted">{p.blurb}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 1 — animal (genetics families: semen / embryo / clone rights) */}
      {step === 1 && !isLive && !isBeef && (
        <div>
          <h1>{isEmbryo ? "Which sire?" : "Which animal?"}</h1>
          <p className="muted">Type the registration number (FB…) or name. Foundation animals fill in instantly.</p>
          <div className="field" style={{ marginTop: 16, position: "relative" }}>
            <input className="input" placeholder="e.g. FB1615 or Michifuku" value={animalQuery}
              onChange={(e) => { setAnimalQuery(e.target.value); setAnimal(null); }} />
            {suggestions.length > 0 && !animal && (
              <div className="card" style={{ position: "absolute", zIndex: 20, width: "100%", marginTop: 4 }}>
                {suggestions.map((s) => (
                  <button key={s.id} className="row" style={{ width: "100%", background: "none", border: "none", borderBottom: "1px solid var(--border-soft)", padding: "10px 14px", cursor: "pointer", color: "var(--text)" }}
                    onClick={() => pickAnimal(s)}>
                    <span style={{ fontWeight: 600 }}>{s.name}</span>
                    <span className="faint" style={{ fontSize: "0.8rem" }}>{s.registration_no} · {s.bloodline}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {animal && (
            <div className="card card-pad" style={{ borderColor: "var(--gold)" }}>
              <div className="row"><span className="pill">Found</span><strong>{animal.name}</strong>
                <span className="faint">{animal.registration_no} · {animal.bloodline}</span></div>
              {animal.notable && <p className="muted" style={{ marginTop: 8, fontSize: "0.9rem" }}>{animal.notable}</p>}
            </div>
          )}

          <div className="card card-pad" style={{ marginTop: 14, background: "var(--bg-elev)" }}>
            <div className="row" style={{ gap: 10 }}>
              <div style={{ fontSize: "1.6rem" }}>📸</div>
              <div style={{ flex: 1 }}>
                <strong>No notes handy?</strong>
                <p className="muted" style={{ fontSize: "0.88rem", margin: "2px 0 0" }}>
                  Open your animal on the registry, screenshot the pedigree, and we'll read it for you.
                </p>
              </div>
              <label className="btn" style={{ cursor: "pointer" }}>
                {extracting ? "Reading…" : "Upload screenshot"}
                <input type="file" accept="image/*" style={{ display: "none" }}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) onScreenshot(f); }} />
              </label>
            </div>
            {extractNote && <p className="help" style={{ marginTop: 8 }}>{extractNote}</p>}
          </div>

          {isEmbryo && animal && (
            <div className="field" style={{ marginTop: 18 }}>
              <label>Dam (optional)</label>
              <input className="input" placeholder="Dam reg # or name"
                onChange={(e) => api.lookupAnimal(e.target.value).then((d) => d && setDam(d)).catch(() => {})} />
              {dam && <p className="help">Dam: <strong className="gold">{dam.name}</strong> ({dam.registration_no})</p>}
            </div>
          )}

          <div className="row" style={{ marginTop: 22 }}>
            <button className="btn" onClick={() => setStep(0)}>Back</button>
            <div className="spacer" />
            <button className="btn btn-gold" disabled={!animal && animalQuery.length < 2}
              onClick={() => { if (!animal && animalQuery) setAnimal({ name: animalQuery, registration_no: null }); setStep(2); }}>
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* Step 1 — live animals: describe what's on the hoof */}
      {step === 1 && isLive && (
        <div>
          <h1>Describe the animals</h1>
          <p className="muted">Class, head count, and the basics buyers ask first.</p>

          <div className="row wrap" style={{ gap: 12, marginTop: 16 }}>
            <div className="field" style={{ flex: 2, minWidth: 180 }}>
              <label>Class</label>
              <select className="select" value={form.animal_class} onChange={(e) => setForm({ ...form, animal_class: e.target.value })}>
                <option value="">Select…</option>
                {animalClasses.map((c) => <option key={c} value={c}>{prettyOpt(c)}</option>)}
              </select>
            </div>
            <div className="field" style={{ flex: 1, minWidth: 120 }}>
              <label>Head count</label>
              <input className="input" inputMode="numeric" value={form.head_count} onChange={(e) => setForm({ ...form, head_count: e.target.value })} placeholder="1" />
            </div>
          </div>

          <div className="row wrap" style={{ gap: 12 }}>
            <div className="field" style={{ flex: 1, minWidth: 160 }}>
              <label>Date of birth (oldest, if a group)</label>
              <input className="input" type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
            </div>
            <div className="field" style={{ flex: 1, minWidth: 140 }}>
              <label>Weight (lbs, approx.)</label>
              <input className="input" inputMode="decimal" value={form.weight_lbs} onChange={(e) => setForm({ ...form, weight_lbs: e.target.value })} placeholder="e.g. 1100" />
            </div>
          </div>

          <div className="row wrap" style={{ gap: 12 }}>
            <div className="field" style={{ flex: 1, minWidth: 160 }}>
              <label>Bred status</label>
              <select className="select" value={form.bred_status} onChange={(e) => setForm({ ...form, bred_status: e.target.value })}>
                <option value="open">Open</option>
                <option value="exposed">Exposed</option>
                <option value="bred">Bred (confirmed)</option>
                <option value="pair">Pair (calf at side)</option>
              </select>
            </div>
            {(form.bred_status === "bred" || form.bred_status === "exposed") && (
              <div className="field" style={{ flex: 1, minWidth: 160 }}>
                <label>Due date {form.bred_status === "exposed" ? "(est.)" : ""}</label>
                <input className="input" type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
              </div>
            )}
          </div>

          {(form.bred_status === "bred" || form.bred_status === "exposed") && (
            <div className="field">
              <label>Service sire registration # (optional)</label>
              <input className="input" value={form.service_sire_reg} onChange={(e) => setForm({ ...form, service_sire_reg: e.target.value })} placeholder="e.g. FB1615" />
            </div>
          )}

          <div className="field" style={{ position: "relative" }}>
            <label>Registration # or name (optional, if registered)</label>
            <input className="input" placeholder="e.g. FB1615 or Michifuku" value={animalQuery}
              onChange={(e) => { setAnimalQuery(e.target.value); setAnimal(null); }} />
            {suggestions.length > 0 && !animal && (
              <div className="card" style={{ position: "absolute", zIndex: 20, width: "100%", marginTop: 4 }}>
                {suggestions.map((s) => (
                  <button key={s.id} className="row" style={{ width: "100%", background: "none", border: "none", borderBottom: "1px solid var(--border-soft)", padding: "10px 14px", cursor: "pointer", color: "var(--text)" }}
                    onClick={() => pickAnimal(s)}>
                    <span style={{ fontWeight: 600 }}>{s.name}</span>
                    <span className="faint" style={{ fontSize: "0.8rem" }}>{s.registration_no} · {s.bloodline}</span>
                  </button>
                ))}
              </div>
            )}
            {animal && <p className="help">Registered: <strong className="gold">{animal.name}</strong>{animal.registration_no ? ` (${animal.registration_no})` : ""}</p>}
          </div>

          <div className="row" style={{ marginTop: 22 }}>
            <button className="btn" onClick={() => setStep(0)}>Back</button>
            <div className="spacer" />
            <button className="btn btn-gold" disabled={!form.animal_class || !form.head_count}
              onClick={() => setStep(2)}>
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* Step 1 — beef: what's in the box (discovery-only) */}
      {step === 1 && isBeef && (
        <div>
          <h1>What are you offering?</h1>
          <p className="muted">Beef listings are discovery-only — buyers order and pay directly with you.</p>

          <div className="row wrap" style={{ gap: 12, marginTop: 16 }}>
            <div className="field" style={{ flex: 2, minWidth: 180 }}>
              <label>Cut / share type</label>
              <select className="select" value={form.beef_cut_type} onChange={(e) => setForm({ ...form, beef_cut_type: e.target.value })}>
                <option value="">Select…</option>
                {beefCuts.map((c) => <option key={c} value={c}>{prettyOpt(c)}</option>)}
              </select>
            </div>
            <div className="field" style={{ flex: 1, minWidth: 140 }}>
              <label>Box weight (lbs, optional)</label>
              <input className="input" inputMode="decimal" value={form.box_weight_lbs} onChange={(e) => setForm({ ...form, box_weight_lbs: e.target.value })} placeholder="e.g. 20" />
            </div>
          </div>

          <div className="field">
            <label>Fulfillment</label>
            <select className="select" value={form.fulfillment} onChange={(e) => setForm({ ...form, fulfillment: e.target.value })}>
              <option value="ship">Ships (insulated box)</option>
              <option value="pickup">Local pickup only</option>
              <option value="both">Ships or local pickup</option>
            </select>
          </div>

          <div className="row" style={{ marginTop: 22 }}>
            <button className="btn" onClick={() => setStep(0)}>Back</button>
            <div className="spacer" />
            <button className="btn btn-gold" disabled={!form.beef_cut_type} onClick={() => setStep(2)}>
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* Step 2 — ad */}
      {step === 2 && (
        <div>
          <h1>Your ad, written for you</h1>
          <p className="muted">We drafted this from the pedigree. Tweak it, or regenerate.</p>
          <div className="field" style={{ marginTop: 16 }}>
            {!description && (
              <button className="btn btn-gold" onClick={generateAd}>✨ Write my ad</button>
            )}
            {description && (
              <>
                <textarea className="textarea" style={{ minHeight: 160 }} value={description} onChange={(e) => setDescription(e.target.value)} />
                <button className="btn" style={{ marginTop: 8 }} onClick={generateAd}>↻ Regenerate</button>
              </>
            )}
            {genErr && <p className="help" style={{ color: "var(--red)" }}>{genErr}</p>}
          </div>
          <div className="row" style={{ marginTop: 22 }}>
            <button className="btn" onClick={() => setStep(1)}>Back</button>
            <div className="spacer" />
            <button className="btn btn-gold" onClick={() => setStep(3)}>Continue →</button>
          </div>
        </div>
      )}

      {/* Step 3 — price (genetics) */}
      {step === 3 && !isLive && !isBeef && (
        <div>
          <h1>Set your price</h1>

          {isSemen && (
            <div className="field"><label>Semen type</label>
              <select className="select" value={form.semen_type} onChange={(e) => setForm({ ...form, semen_type: e.target.value })}>
                <option value="conventional">Conventional</option>
                <option value="sexed_female">Sexed — female</option>
                <option value="sexed_male">Sexed — male</option>
              </select></div>
          )}

          <div className="row wrap" style={{ gap: 12 }}>
            <div className="field" style={{ flex: 1, minWidth: 160 }}>
              <label>Sale type</label>
              <select className="select" value={form.sale_type} onChange={(e) => setForm({ ...form, sale_type: e.target.value })}>
                <option value="fixed">Fixed price</option>
                <option value="auction">Auction</option>
              </select>
            </div>
            <div className="field" style={{ flex: 1, minWidth: 120 }}>
              <label>Currency</label>
              <select className="select" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
                {["USD", "AUD", "EUR", "GBP", "BRL", "CAD"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {form.sale_type === "fixed" ? (
            <div className="field"><label>{isClone ? "Rights fee" : "Price"} ({isSemen ? "per straw" : isClone ? "per clone right" : "per embryo"})</label>
              <input className="input" inputMode="decimal" value={form.unit_price} onChange={(e) => setForm({ ...form, unit_price: e.target.value })} placeholder="0.00" /></div>
          ) : (
            <div>
              <div className="field"><label>Starting bid</label>
                <input className="input" inputMode="decimal" value={form.start_price} onChange={(e) => setForm({ ...form, start_price: e.target.value })} placeholder="Try $1 for a no-reserve auction" /></div>
              <label className="row" style={{ gap: 8 }}>
                <input type="checkbox" checked={form.no_reserve} onChange={(e) => setForm({ ...form, no_reserve: e.target.checked })} />
                <span>No reserve — sells to the highest bid, no minimum</span>
              </label>
            </div>
          )}

          {isClone && (
            <div className="card card-pad" style={{ marginTop: 8 }}>
              <div className="field"><label>Est. cloning lab production cost (paid by buyer to the facility)</label>
                <input className="input" inputMode="decimal" value={form.lab_production_cost} onChange={(e) => setForm({ ...form, lab_production_cost: e.target.value })} placeholder="e.g. 20000" />
                <p className="help">Buyers see the two-part total: your rights fee + this lab cost.</p>
              </div>
              <label className="row" style={{ gap: 8 }}>
                <input type="checkbox" checked={form.exclusive} onChange={(e) => setForm({ ...form, exclusive: e.target.checked })} />
                <span>Exclusive — the only clone ever made</span>
              </label>
            </div>
          )}

          {!isClone && (
            <div className="row wrap" style={{ gap: 12 }}>
              <div className="field" style={{ flex: 1, minWidth: 140 }}><label>Quantity</label>
                <input className="input" inputMode="numeric" value={form.quantity_available} onChange={(e) => setForm({ ...form, quantity_available: e.target.value })} /></div>
              <div className="field" style={{ flex: 1, minWidth: 180 }}><label>Show quantity as</label>
                <select className="select" value={form.quantity_visibility} onChange={(e) => setForm({ ...form, quantity_visibility: e.target.value })}>
                  <option value="in_stock_only">In stock (hide count)</option>
                  <option value="exact">Exact count</option>
                  <option value="range">Range (10+, 50+…)</option>
                  <option value="hidden">Hidden — contact for availability</option>
                </select></div>
            </div>
          )}

          <div className="row" style={{ marginTop: 16 }}>
            <button className="btn" onClick={() => setStep(2)}>Back</button>
            <div className="spacer" />
            <button className="btn btn-gold" onClick={() => setStep(4)}>Continue →</button>
          </div>
        </div>
      )}

      {/* Step 3 — price (live animals) */}
      {step === 3 && isLive && (
        <div>
          <h1>Set your price</h1>

          <div className="row wrap" style={{ gap: 12 }}>
            <div className="field" style={{ flex: 1, minWidth: 160 }}>
              <label>Priced</label>
              <select className="select" value={form.price_basis} onChange={(e) => setForm({ ...form, price_basis: e.target.value })}>
                <option value="per_head">Per head</option>
                <option value="per_cwt">Per cwt (hundredweight)</option>
                <option value="per_lb">Per lb</option>
              </select>
            </div>
            <div className="field" style={{ flex: 1, minWidth: 160 }}>
              <label>Sale type</label>
              <select className="select" value={form.sale_type} onChange={(e) => setForm({ ...form, sale_type: e.target.value })}>
                <option value="fixed">Fixed price</option>
                <option value="auction">Auction</option>
              </select>
            </div>
            <div className="field" style={{ flex: 1, minWidth: 120 }}>
              <label>Currency</label>
              <select className="select" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
                {["USD", "AUD", "EUR", "GBP", "BRL", "CAD"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {form.sale_type === "fixed" ? (
            <div className="field"><label>Price ({form.price_basis === "per_cwt" ? "per cwt" : form.price_basis === "per_lb" ? "per lb" : "per head"})</label>
              <input className="input" inputMode="decimal" value={form.unit_price} onChange={(e) => setForm({ ...form, unit_price: e.target.value })} placeholder="0.00" /></div>
          ) : (
            <div>
              <div className="field"><label>Starting bid</label>
                <input className="input" inputMode="decimal" value={form.start_price} onChange={(e) => setForm({ ...form, start_price: e.target.value })} placeholder="Try $1 for a no-reserve auction" /></div>
              <div className="field"><label>Auction length</label>
                <select className="select" value={form.auction_days} onChange={(e) => setForm({ ...form, auction_days: e.target.value })}>
                  {["7", "10", "14", "21"].map((d) => <option key={d} value={d}>{d} days</option>)}
                </select>
                <p className="help">Cattle auctions need time for buyers to look, ask, and arrange transport — 7 days minimum.</p>
              </div>
              <label className="row" style={{ gap: 8 }}>
                <input type="checkbox" checked={form.no_reserve} onChange={(e) => setForm({ ...form, no_reserve: e.target.checked })} />
                <span>No reserve — sells to the highest bid, no minimum</span>
              </label>
            </div>
          )}

          <div className="row" style={{ marginTop: 16 }}>
            <button className="btn" onClick={() => setStep(2)}>Back</button>
            <div className="spacer" />
            <button className="btn btn-gold" onClick={() => setStep(4)}>Continue →</button>
          </div>
        </div>
      )}

      {/* Step 3 — price (beef, discovery-only: price is informational) */}
      {step === 3 && isBeef && (
        <div>
          <h1>Set your price</h1>
          <p className="muted">Shown for discovery only — buyers order and pay with you directly.</p>

          <div className="row wrap" style={{ gap: 12, marginTop: 8 }}>
            <div className="field" style={{ flex: 1, minWidth: 160 }}>
              <label>Priced</label>
              <select className="select" value={form.price_basis} onChange={(e) => setForm({ ...form, price_basis: e.target.value })}>
                <option value="per_lb">Per lb</option>
                <option value="per_box">Per box</option>
                <option value="flat">Flat price</option>
              </select>
            </div>
            <div className="field" style={{ flex: 1, minWidth: 120 }}>
              <label>Currency</label>
              <select className="select" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
                {["USD", "AUD", "EUR", "GBP", "BRL", "CAD"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="field"><label>Price (optional — leave blank for “contact for pricing”)</label>
            <input className="input" inputMode="decimal" value={form.unit_price} onChange={(e) => setForm({ ...form, unit_price: e.target.value })} placeholder="0.00" /></div>

          <div className="row" style={{ marginTop: 16 }}>
            <button className="btn" onClick={() => setStep(2)}>Back</button>
            <div className="spacer" />
            <button className="btn btn-gold" onClick={() => setStep(4)}>Continue →</button>
          </div>
        </div>
      )}

      {/* Step 4 — storage (genetics) */}
      {step === 4 && !isLive && !isBeef && (
        <div>
          <h1>{isClone ? "Where is the cell line banked?" : "Where is it stored?"}</h1>
          <p className="muted">{isClone ? "The cloning company holding the banked cell line." : "Your genetics stay put — the facility ships to the buyer, who pays shipping at cost."}</p>
          <div className="field" style={{ marginTop: 16, position: "relative" }}>
            <input className="input" placeholder="Type 'Ha' for Hawkeye…" value={facilityQuery}
              onChange={(e) => { setFacilityQuery(e.target.value); setFacility(null); }} />
            {facilities.length > 0 && !facility && (
              <div className="card" style={{ position: "absolute", zIndex: 20, width: "100%", marginTop: 4 }}>
                {facilities.map((f) => (
                  <button key={f.id} className="row" style={{ width: "100%", background: "none", border: "none", borderBottom: "1px solid var(--border-soft)", padding: "10px 14px", cursor: "pointer", color: "var(--text)" }}
                    onClick={() => { setFacility(f); setFacilityQuery(f.name); setFacilities([]); }}>
                    <span style={{ fontWeight: 600 }}>{f.name}</span>
                    <span className="faint" style={{ fontSize: "0.8rem" }}>{f.city}, {f.state}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {facility && <p className="help">Stored at <strong className="gold">{facility.name}</strong> — {facility.city}, {facility.state}.</p>}

          {!isClone && (
            <div className="card card-pad" style={{ marginTop: 8 }}>
              <label style={{ fontWeight: 700, display: "block", marginBottom: 8 }}>✈ Export eligibility</label>
              <div className="field">
                <label>Is it CSS-collected? (Certified Semen Services — required to export)</label>
                <select className="select" value={form.css_status} onChange={(e) => setForm({ ...form, css_status: e.target.value })}>
                  <option value="unknown">Not sure / not stated</option>
                  <option value="css">Yes — CSS-collected (export-eligible)</option>
                  <option value="domestic">No — domestic only (non-CSS)</option>
                </select>
                <p className="help">Only CSS semen — and embryos made from CSS semen — can be exported. Non-CSS is domestic-only.</p>
              </div>
              {form.css_status === "css" && (
                <div className="field" style={{ marginBottom: 0 }}>
                  <label>Cleared for export to (optional)</label>
                  <div className="row wrap" style={{ gap: 8 }}>
                    {EXPORT_REGIONS.map((r) => (
                      <button key={r.code} type="button" className={`pill ${form.export_eligibility.includes(r.code) ? "" : "pill-dim"}`} style={{ cursor: "pointer" }} onClick={() => toggleExport(r.code)}>{r.flag} {r.code}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="row" style={{ marginTop: 16 }}>
            <button className="btn" onClick={() => setStep(3)}>Back</button>
            <div className="spacer" />
            <button className="btn btn-gold" onClick={() => setStep(5)}>Review →</button>
          </div>
        </div>
      )}

      {/* Step 4 — location & delivery (live animals) */}
      {step === 4 && isLive && (
        <div>
          <h1>Where are the animals?</h1>
          <p className="muted">Location drives “near me” search — buyers filter by state and distance.</p>

          <div className="row wrap" style={{ gap: 12, marginTop: 16 }}>
            <div className="field" style={{ flex: 1, minWidth: 120 }}>
              <label>Country</label>
              <select className="select" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}>
                {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="field" style={{ flex: 1, minWidth: 160 }}>
              <label>State / region</label>
              <input className="input" value={form.state_region} onChange={(e) => setForm({ ...form, state_region: e.target.value })} placeholder="e.g. TX" />
            </div>
            <div className="field" style={{ flex: 1, minWidth: 140 }}>
              <label>ZIP / postal code</label>
              <input className="input" value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} placeholder="e.g. 76028" />
            </div>
          </div>

          <div className="card card-pad" style={{ marginTop: 8 }}>
            <label className="row" style={{ gap: 8 }}>
              <input type="checkbox" checked={form.delivery_available} onChange={(e) => setForm({ ...form, delivery_available: e.target.checked })} />
              <span>I can arrange delivery / hauling</span>
            </label>
            <div className="field" style={{ marginTop: 10, marginBottom: 0 }}>
              <label>Freight note (optional)</label>
              <input className="input" value={form.freight_note} onChange={(e) => setForm({ ...form, freight_note: e.target.value })} placeholder="e.g. Free delivery within 100 miles" />
            </div>
          </div>

          <div className="row" style={{ marginTop: 16 }}>
            <button className="btn" onClick={() => setStep(3)}>Back</button>
            <div className="spacer" />
            <button className="btn btn-gold" disabled={!form.postal_code && !form.state_region} onClick={() => setStep(5)}>Review →</button>
          </div>
        </div>
      )}

      {/* Step 4 — location & ordering (beef) */}
      {step === 4 && isBeef && (
        <div>
          <h1>Where do buyers order?</h1>
          <p className="muted">Beef is discovery-only: we send buyers to your store, form, or contact page.</p>

          <div className="field" style={{ marginTop: 16 }}>
            <label>Order / contact link (required)</label>
            <input className="input" type="url" value={form.external_url} onChange={(e) => setForm({ ...form, external_url: e.target.value })} placeholder="https://yourranch.com/shop" />
            <p className="help">Your farm store, order form, or contact page — the “Contact the producer” button points here.</p>
          </div>

          <div className="row wrap" style={{ gap: 12 }}>
            <div className="field" style={{ flex: 1, minWidth: 120 }}>
              <label>Country</label>
              <select className="select" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}>
                {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="field" style={{ flex: 1, minWidth: 160 }}>
              <label>State / region</label>
              <input className="input" value={form.state_region} onChange={(e) => setForm({ ...form, state_region: e.target.value })} placeholder="e.g. TX" />
            </div>
            <div className="field" style={{ flex: 1, minWidth: 140 }}>
              <label>ZIP / postal code</label>
              <input className="input" value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} placeholder="e.g. 76028" />
            </div>
          </div>

          <div className="row" style={{ marginTop: 16 }}>
            <button className="btn" onClick={() => setStep(3)}>Back</button>
            <div className="spacer" />
            <button className="btn btn-gold" disabled={!form.external_url.trim()} onClick={() => setStep(5)}>Review →</button>
          </div>
        </div>
      )}

      {/* Step 5 — publish */}
      {step === 5 && (
        <div>
          <h1>Ready to publish</h1>
          <div className="card card-pad" style={{ marginTop: 12 }}>
            <div className="kv"><span className="k">Product</span><span>{PRODUCT_LABEL[productType]}</span></div>
            {isLive ? (
              <div className="kv"><span className="k">Animals</span><span>{prettyOpt(form.animal_class)}{form.head_count ? ` × ${form.head_count} head` : ""}{animal?.name ? ` · ${animal.name}` : ""}</span></div>
            ) : isBeef ? (
              <div className="kv"><span className="k">Offering</span><span>{prettyOpt(form.beef_cut_type)}{form.box_weight_lbs ? ` · ${form.box_weight_lbs} lb box` : ""}</span></div>
            ) : (
              <div className="kv"><span className="k">Animal</span><span>{animal?.name}{isEmbryo && dam ? ` × ${dam.name}` : ""}</span></div>
            )}
            <div className="kv"><span className="k">Sale</span><span>{isBeef ? (form.unit_price ? `${money(Number(form.unit_price), form.currency)} ${form.price_basis === "per_box" ? "per box" : form.price_basis === "flat" ? "flat" : "per lb"} — ordered direct` : "Contact for pricing — ordered direct") : form.sale_type === "fixed" ? `Buy now — ${money(Number(form.unit_price), form.currency)}${isLive ? ` ${form.price_basis === "per_cwt" ? "per cwt" : form.price_basis === "per_lb" ? "per lb" : "per head"}` : ""}` : `Auction from ${money(Number(form.start_price), form.currency)}${form.no_reserve ? " · no reserve" : ""}${isLive ? ` · ${form.auction_days} days` : ""}`}</span></div>
            {isClone && form.lab_production_cost && <div className="kv"><span className="k">All-in for buyer</span><span className="gold">{money(Number(form.unit_price) + Number(form.lab_production_cost), form.currency)}</span></div>}
            {isLive || isBeef ? (
              <div className="kv"><span className="k">Location</span><span>{[form.state_region, form.country].filter(Boolean).join(", ")}{form.postal_code ? ` · ${form.postal_code}` : ""}</span></div>
            ) : (
              <div className="kv"><span className="k">Storage</span><span>{facility?.name || "—"}</span></div>
            )}
            {isBeef && <div className="kv"><span className="k">Order link</span><span style={{ maxWidth: "60%", textAlign: "right", overflowWrap: "anywhere" }}>{form.external_url}</span></div>}
          </div>
          <p className="help" style={{ marginTop: 10 }}>
            {isLive ? "By publishing you confirm you own or are authorized to sell these animals and that the details are accurate."
              : isBeef ? "By publishing you confirm this is your product and the ordering link is yours."
              : "By publishing you confirm you own or are authorized to sell these genetics and that the pedigree is accurate."}
          </p>
          {genErr && <p className="help" style={{ color: "var(--red)" }}>{genErr}</p>}
          <div className="row" style={{ marginTop: 16 }}>
            <button className="btn" onClick={() => setStep(4)}>Back</button>
            <div className="spacer" />
            <button className="btn btn-gold btn-lg" disabled={submitting} onClick={publish}>
              {submitting ? "Publishing…" : "Publish listing →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
