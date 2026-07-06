"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "../../lib/api";

function ResetInner() {
  const token = useSearchParams().get("token") || "";
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr("");
    if (pw.length < 8) { setErr("Password must be at least 8 characters."); return; }
    if (pw !== pw2) { setErr("Passwords don't match."); return; }
    try { await api.resetPassword(token, pw); setDone(true); setTimeout(() => router.push("/login"), 1800); }
    catch (e: any) { setErr(e.message); }
  }

  if (!token) return <div className="container section" style={{ maxWidth: 420 }}><h1>Reset password</h1><p className="muted">This link is missing its token. <Link href="/forgot-password" className="gold">Request a new one.</Link></p></div>;

  return (
    <div className="container section" style={{ maxWidth: 420 }}>
      <h1>Set a new password</h1>
      {done ? (
        <div className="adslot" style={{ textAlign: "left", marginTop: 12 }}>✓ Password updated. Redirecting to sign in…</div>
      ) : (
        <form onSubmit={submit} className="stack" style={{ marginTop: 16 }}>
          <div className="field"><label>New password</label><input className="input" type="password" value={pw} onChange={(e) => setPw(e.target.value)} required minLength={8} /></div>
          <div className="field"><label>Confirm new password</label><input className="input" type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} required /></div>
          {err && <p className="help" style={{ color: "var(--red)" }}>{err}</p>}
          <button className="btn btn-gold btn-block btn-lg" type="submit">Update password</button>
        </form>
      )}
    </div>
  );
}

export default function ResetPassword() {
  return <Suspense fallback={<div className="container section">Loading…</div>}><ResetInner /></Suspense>;
}
