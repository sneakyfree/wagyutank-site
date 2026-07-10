"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_BASE, api } from "../lib/api";
import { useAuth } from "../lib/auth";

// Native upload — the file goes straight from the browser to WagyuTank's
// storage (presigned PUT); our server never touches the bytes.
export default function UploadVideo({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [reg, setReg] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [pct, setPct] = useState<number | null>(null);
  const [err, setErr] = useState("");

  async function go() {
    if (!file || !title.trim()) return;
    setErr(""); setPct(0);
    try {
      const intent = await api.videoUploadIntent(file.type, file.size);
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", intent.upload_url);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.upload.onprogress = (e) => { if (e.lengthComputable) setPct(Math.round((e.loaded / e.total) * 100)); };
        xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed (${xhr.status})`)));
        xhr.onerror = () => reject(new Error("Upload failed — check your connection."));
        xhr.send(file);
      });
      const done = await api.videoUploadComplete(intent.key, title.trim(), reg.trim() || undefined);
      router.push(`/video?id=${done.id}`);
    } catch (e: any) { setErr(e.message || "Something went wrong."); setPct(null); }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginTop: 0 }}>⬆ Share your video on WagyuTank</h3>
        {!user ? (
          <p className="muted">Please <Link href="/login?next=/videos" className="gold">sign in</Link> to upload. You can also share a YouTube link from any animal's page.</p>
        ) : (
          <>
            <p className="faint" style={{ fontSize: "0.85rem", marginTop: -6 }}>
              MP4, WebM, or MOV up to 500 MB. It publishes on WagyuTank with your name on it — and if a
              registration number is in the title, it joins the pedigree video registry automatically.
            </p>
            <div className="field"><label>Title *</label>
              <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Our Michifuku FB1615 heifers on spring pasture" /></div>
            <div className="field"><label>Animal registration # (optional)</label>
              <input className="input" value={reg} onChange={(e) => setReg(e.target.value)} placeholder="FB1615" /></div>
            <div className="field"><label>Video file *</label>
              <input className="input" type="file" accept="video/mp4,video/webm,video/quicktime" onChange={(e) => setFile(e.target.files?.[0] || null)} /></div>
            {pct != null && (
              <div style={{ margin: "10px 0" }}>
                <div style={{ background: "var(--border)", borderRadius: 6, height: 10, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, background: "var(--gold)", height: "100%", transition: "width 0.2s" }} />
                </div>
                <div className="faint" style={{ fontSize: "0.78rem", marginTop: 4 }}>{pct < 100 ? `Uploading… ${pct}%` : "Publishing…"}</div>
              </div>
            )}
            {err && <p className="help" style={{ color: "var(--red)" }}>{err}</p>}
            <div className="row" style={{ gap: 8, justifyContent: "flex-end" }}>
              <button className="btn" onClick={onClose}>Cancel</button>
              <button className="btn btn-gold" disabled={!file || !title.trim() || pct != null} onClick={go}>
                {pct != null ? "Uploading…" : "Upload & publish"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
