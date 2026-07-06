"use client";
import { useState } from "react";
import Link from "next/link";
import { api } from "../../lib/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [devUrl, setDevUrl] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await api.forgotPassword(email);
      setDone(true);
      if (res.dev_reset_url) setDevUrl(res.dev_reset_url);
    } catch { setDone(true); }
  }

  return (
    <div className="container section" style={{ maxWidth: 420 }}>
      <h1>Reset password</h1>
      {done ? (
        <div className="stack" style={{ marginTop: 12 }}>
          <div className="adslot" style={{ textAlign: "left" }}>
            If an account exists for <strong>{email}</strong>, we've emailed a reset link. It expires in 45 minutes.
          </div>
          {devUrl && <p className="help">Dev link: <a href={devUrl} className="gold">{devUrl}</a></p>}
          <Link href="/login" className="gold center">← Back to sign in</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="stack" style={{ marginTop: 16 }}>
          <p className="muted">Enter your email and we'll send you a link to set a new password.</p>
          <div className="field"><label>Email</label><input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <button className="btn btn-gold btn-block btn-lg" type="submit">Send reset link</button>
          <Link href="/login" className="muted center">← Back to sign in</Link>
        </form>
      )}
    </div>
  );
}
