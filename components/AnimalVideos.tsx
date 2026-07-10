"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";

// Member video-share for a foundation animal — "here's my experience with this
// bloodline." Embeds a YouTube/Vimeo link (we never host video). Part of the
// per-animal media complex.
export default function AnimalVideos({ reg, name }: { reg: string; name: string }) {
  const { user } = useAuth();
  const [vids, setVids] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  function load() { api.animalVideos(reg).then(setVids).catch(() => {}); }
  useEffect(() => { if (reg) load(); /* eslint-disable-next-line */ }, [reg]);

  async function submit() {
    setErr(""); setBusy(true);
    try {
      await api.submitAnimalVideo(reg, title, url);
      setTitle(""); setUrl(""); setOpen(false); load();
    } catch (e: any) { setErr(e.message || "Couldn't add that video."); } finally { setBusy(false); }
  }

  return (
    <div className="section" style={{ paddingTop: 8 }}>
      <div className="section-head row" style={{ alignItems: "baseline" }}>
        <h2><span className="roundup-pill pill">🎥 {name} — breeder videos</span></h2>
        <div className="spacer" />
        {user
          ? <button className="btn" onClick={() => setOpen((o) => !o)}>{open ? "Cancel" : "+ Share a video"}</button>
          : <Link href={`/login?next=/animal?reg=${encodeURIComponent(reg)}`} className="faint" style={{ fontSize: "0.85rem" }}>Sign in to share a video</Link>}
      </div>
      <p className="muted" style={{ marginTop: -6, marginBottom: 14, fontSize: "0.92rem" }}>
        Working with {name} genetics? Share a YouTube or Vimeo video of your cattle, calves, or carcass results.
      </p>

      {open && (
        <div className="card card-pad" style={{ maxWidth: 560, marginBottom: 16 }}>
          <div className="field"><label>Video title</label><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={`Our ${name} F1 steers at 30 months`} /></div>
          <div className="field"><label>YouTube or Vimeo link</label><input className="input" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://youtu.be/…" /></div>
          {err && <p className="help" style={{ color: "var(--red)" }}>{err}</p>}
          <button className="btn btn-gold" disabled={busy || !title || !url} onClick={submit}>{busy ? "Adding…" : "Add video"}</button>
        </div>
      )}

      {vids.length ? (
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>
          {vids.map((v) => (
            <div key={v.id} className="card" style={{ overflow: "hidden" }}>
              <div style={{ aspectRatio: "16/9", background: "#000" }}>
                <iframe src={v.embed_url} title={v.title} style={{ width: "100%", height: "100%", border: 0 }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen loading="lazy" />
              </div>
              <div className="lc-body">
                <div className="lc-title" style={{ fontSize: "0.95rem" }}>{v.title}</div>
                <div className="faint" style={{ fontSize: "0.78rem" }}>shared by {v.submitter_name}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="adslot">No videos yet. {user ? "Be the first to share your experience with these genetics." : <>Sign in to be the first to share.</>}</div>
      )}
    </div>
  );
}
