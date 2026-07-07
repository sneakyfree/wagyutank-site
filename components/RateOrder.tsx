"use client";
import { useState } from "react";
import { api } from "../lib/api";

export default function RateOrder({ order, onRated }: { order: any; onRated: () => void }) {
  const [score, setScore] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit() {
    if (!score) return;
    setBusy(true); setErr("");
    try { await api.rateOrder(order.order_id, score, comment); onRated(); }
    catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  }

  return (
    <div className="card card-pad" style={{ marginTop: 8 }}>
      <div className="faint" style={{ fontSize: "0.85rem", marginBottom: 6 }}>
        Rate your {order.rate_role} <strong style={{ color: "var(--text)" }}>{order.counterparty}</strong>
        {" "}for "{order.listing_title}"
      </div>
      <div className="rate-stars" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} className={`rate-star ${(hover || score) >= n ? "on" : ""}`}
            onMouseEnter={() => setHover(n)} onClick={() => setScore(n)} aria-label={`${n} stars`}>★</button>
        ))}
      </div>
      <textarea className="input" rows={2} value={comment} onChange={(e) => setComment(e.target.value)}
        placeholder="Add a comment (optional)" style={{ marginTop: 8 }} />
      {err && <p className="help" style={{ color: "var(--red)" }}>{err}</p>}
      <button className="btn btn-gold" onClick={submit} disabled={!score || busy} style={{ marginTop: 8 }}>
        Submit rating
      </button>
    </div>
  );
}
