"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";

function timeAgo(iso: string): string {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  const d = Math.floor(s / 86400);
  return d < 30 ? `${d}d ago` : `${Math.floor(d / 30)}mo ago`;
}

function Avatar({ handle }: { handle: string }) {
  const hue = [...handle].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return <span className="cmt-avatar" style={{ background: `hsl(${hue} 45% 30%)` }}>{handle[0]?.toUpperCase()}</span>;
}

function CommentBody({ c, onReply, onLike }: any) {
  return (
    <div className="cmt">
      <Avatar handle={c.author_handle} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="cmt-head">
          <span className="cmt-author">@{c.author_handle}</span>
          {c.author_name && <span className="faint" style={{ fontSize: "0.76rem" }}>· {c.author_name}</span>}
          <span className="faint" style={{ fontSize: "0.72rem" }}>· {timeAgo(c.created_at)}</span>
        </div>
        <p className="cmt-text">{c.body}</p>
        <div className="cmt-actions">
          <button className="cmt-link" onClick={() => onLike(c)}>♥ {c.likes || 0}</button>
          {onReply && <button className="cmt-link" onClick={() => onReply(c)}>Reply</button>}
        </div>
      </div>
    </div>
  );
}

export default function Discussion({ reg, name }: { reg: string; name: string }) {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  function load() { api.animalComments(reg).then(setData).catch(() => setData({ count: 0, threads: [] })); }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [reg]);

  async function post() {
    if (!text.trim()) return;
    setBusy(true);
    try { await api.postComment(reg, text, replyTo?.id); setText(""); setReplyTo(null); load(); }
    catch (e: any) { alert(e.message); } finally { setBusy(false); }
  }
  async function like(c: any) { try { await api.likeComment(c.id); load(); } catch {} }

  if (!data) return null;
  return (
    <div className="section" style={{ paddingTop: 8 }}>
      <div className="section-head"><h2>Discussion <span className="faint" style={{ fontWeight: 400 }}>· {data.count}</span></h2></div>
      <p className="muted" style={{ marginTop: -8, marginBottom: 18, fontSize: "0.92rem" }}>
        Share your experience with {name}'s genetics, ask the community, or add to the record.
      </p>

      {user ? (
        <div className="card card-pad" style={{ marginBottom: 20 }}>
          {replyTo && <div className="faint" style={{ fontSize: "0.8rem", marginBottom: 6 }}>Replying to @{replyTo.author_handle} · <button className="cmt-link" onClick={() => setReplyTo(null)}>cancel</button></div>}
          <textarea className="input" rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder={`What's your take on ${name}?`} />
          <div className="row" style={{ marginTop: 8 }}><div className="spacer" /><button className="btn btn-gold" onClick={post} disabled={busy || !text.trim()}>Post</button></div>
        </div>
      ) : (
        <div className="adslot" style={{ marginBottom: 20 }}><Link href="/login" className="gold">Sign in</Link> to join the discussion.</div>
      )}

      {data.threads.length ? (
        <div className="stack" style={{ gap: 18 }}>
          {data.threads.map((t: any) => (
            <div key={t.id} className="cmt-thread">
              <CommentBody c={t} onReply={user ? setReplyTo : null} onLike={like} />
              {t.replies?.length > 0 && (
                <div className="cmt-replies">
                  {t.replies.map((r: any) => <CommentBody key={r.id} c={r} onReply={user ? setReplyTo : null} onLike={like} />)}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="adslot">Be the first to comment on {name}.</div>
      )}
    </div>
  );
}
