import Link from "next/link";
import FollowButton from "./FollowButton";
import PeerLink from "./PeerLink";
import { BlendDonut } from "./BloodBlend";
import { originFlag, originLong } from "./Origin";

// Presentational (no hooks) — the SEO-critical content, server-renderable.
export default function AnimalCore({ a }: { a: any }) {
  return (
    <>
      {a.is_foundation && (
        <div style={{ marginBottom: 10 }}>
          <Link href="/foundation" className="nav-link" style={{ paddingLeft: 0, fontSize: "0.85rem" }}>
            ← All foundation animals
          </Link>
        </div>
      )}
      <div className="row wrap" style={{ gap: 8, marginBottom: 8 }}>
        {a.is_foundation && <span className="pill">Foundation animal</span>}
        {a.bloodline && <span className="pill pill-dim">{a.bloodline}</span>}
        {a.breed && <span className="pill pill-dim">{a.breed}</span>}
      </div>
      <div className="row wrap" style={{ gap: 12, alignItems: "flex-start" }}>
        <h1 style={{ fontSize: "2.2rem" }}>{a.name}</h1>
        <div className="spacer" />
        <FollowButton targetType="animal" targetKey={a.slug || a.registration_no || a.name} label={a.name} small />
      </div>
      <div className="muted" style={{ fontSize: "1rem" }}>
        {a.registration_no && <span>Reg. {a.registration_no} · </span>}
        {a.animal_type}{a.birth_year ? ` · b. ${a.birth_year}` : ""}
      </div>
      {/* Cross-site flywheel: same animal on the sister tank (null on standalone tanks) */}
      <PeerLink reg={a.registration_no} style={{ marginTop: 10 }} />

      {a.notable && <p className="gold" style={{ maxWidth: "70ch", marginTop: 14, fontSize: "1.08rem", fontWeight: 600 }}>{a.notable}</p>}

      {a.photo_url && (
        <figure className="card" style={{ marginTop: 18, maxWidth: 640, overflow: "hidden", margin: "18px 0 0" }}>
          <img src={a.photo_url} alt={a.name} style={{ width: "100%", display: "block" }} />
          {a.photo_note && (
            <figcaption className="faint" style={{ fontSize: "0.78rem", padding: "8px 10px", lineHeight: 1.5 }}>{a.photo_note}</figcaption>
          )}
        </figure>
      )}

      {a.photos?.length > 0 && (
        <div className="row wrap" style={{ gap: 12, marginTop: 12, maxWidth: 640 }}>
          {a.photos.map((p: any, i: number) => (
            <figure key={i} className="card" style={{ margin: 0, overflow: "hidden", flex: "1 1 240px", maxWidth: 320 }}>
              <img src={p.url} alt={`${a.name} — additional photograph`} style={{ width: "100%", display: "block" }} />
              {p.attribution && (
                <figcaption className="faint" style={{ fontSize: "0.75rem", padding: "6px 9px", lineHeight: 1.5 }}>{p.attribution}</figcaption>
              )}
            </figure>
          ))}
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
          {a.birth_country && (
            <div className="kv"><span className="k">Born</span>
              <span>{originFlag(a)} {originLong(a)}</span></div>
          )}
          {a.prefecture && <div className="kv"><span className="k">Prefecture of origin</span><span>{a.prefecture}</span></div>}
          <div className="kv"><span className="k">Bloodline</span><span>{a.bloodline_detail || a.bloodline || "—"}</span></div>
          <div className="kv"><span className="k">Breed</span><span>{a.breed || "—"}</span></div>
          {a.importer && <div className="kv"><span className="k">Importer</span><span>{a.importer}</span></div>}
          {a.import_year && (
            <div className="kv"><span className="k">{a.semen_only ? "Semen imported" : "Imported"}</span>
              <span>{a.import_year}{a.importer ? ` · ${a.importer}` : ""}{a.semen_only ? " — bull never left Japan" : ""}</span></div>
          )}
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
          {a.blend && (
            <div style={{ marginBottom: 22 }}>
              <h2 style={{ fontSize: "1.2rem" }}>Bloodline analysis</h2>
              <BlendDonut blend={a.blend} group={a.blend_group}
                          source={a.blend_source} total={a.blend_total} />
            </div>
          )}
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
