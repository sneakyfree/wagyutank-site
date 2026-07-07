import Link from "next/link";

// Presentational (no hooks) — the SEO-critical content, server-renderable.
export default function AnimalCore({ a }: { a: any }) {
  return (
    <>
      <div className="row wrap" style={{ gap: 8, marginBottom: 8 }}>
        {a.is_foundation && <span className="pill">Foundation animal</span>}
        {a.bloodline && <span className="pill pill-dim">{a.bloodline}</span>}
        {a.breed && <span className="pill pill-dim">{a.breed}</span>}
      </div>
      <h1 style={{ fontSize: "2.2rem" }}>{a.name}</h1>
      <div className="muted" style={{ fontSize: "1rem" }}>
        {a.registration_no && <span>Reg. {a.registration_no} · </span>}
        {a.animal_type}{a.birth_year ? ` · b. ${a.birth_year}` : ""}
      </div>

      {a.notable && <p className="gold" style={{ maxWidth: "70ch", marginTop: 14, fontSize: "1.08rem", fontWeight: 600 }}>{a.notable}</p>}

      {a.photo_url && (
        <div className="card" style={{ marginTop: 18, maxWidth: 640, overflow: "hidden" }}>
          <img src={a.photo_url} alt={a.name} style={{ width: "100%", display: "block" }} />
          {a.photo_note && <div className="faint" style={{ padding: "8px 14px", fontSize: "0.78rem" }}>{a.photo_note}</div>}
        </div>
      )}

      {a.bio && (
        <div className="prose" style={{ margin: "22px 0 0", maxWidth: "72ch" }}>
          {a.bio.split(/\n\n+/).map((p: string, i: number) => (
            <p key={i} className="muted" style={{ fontSize: "1.05rem", lineHeight: 1.75 }}>{p}</p>
          ))}
        </div>
      )}

      <div className="row wrap" style={{ gap: 30, marginTop: 24, alignItems: "flex-start" }}>
        <div style={{ flex: "1 1 300px" }}>
          <h2 style={{ fontSize: "1.2rem" }}>Registry record</h2>
          {a.prefecture && <div className="kv"><span className="k">Prefecture of origin</span><span>{a.prefecture}</span></div>}
          <div className="kv"><span className="k">Bloodline</span><span>{a.bloodline_detail || a.bloodline || "—"}</span></div>
          <div className="kv"><span className="k">Breed</span><span>{a.breed || "—"}</span></div>
          {a.importer && <div className="kv"><span className="k">Importer</span><span>{a.importer}</span></div>}
          {a.import_year && <div className="kv"><span className="k">Imported</span><span>{a.import_year}</span></div>}
          {a.au_progeny != null && <div className="kv"><span className="k">AU progeny</span><span>{a.au_progeny.toLocaleString()}</span></div>}
          {a.marbling_note && <div className="kv"><span className="k">Carcass / marbling</span><span style={{ maxWidth: "60%", textAlign: "right" }}>{a.marbling_note}</span></div>}
          {(a.sire_name || a.dam_name) && (
            <>
              <div className="kv"><span className="k">Sire</span><span>{a.sire_name || a.sire_reg || "—"}</span></div>
              <div className="kv"><span className="k">Dam</span><span>{a.dam_name || a.dam_reg || "—"}</span></div>
            </>
          )}
        </div>
        <div style={{ flex: "1 1 300px" }}>
          <div className="adslot" style={{ textAlign: "left" }}>
            <strong className="gold">Own genetics from {a.name}?</strong>
            <p className="muted" style={{ marginTop: 6 }}>List your straws, embryos, or cloning rights in under a minute.</p>
            <Link href="/sell" className="btn btn-gold" style={{ marginTop: 8 }}>List {a.name} genetics →</Link>
          </div>
        </div>
      </div>
    </>
  );
}
