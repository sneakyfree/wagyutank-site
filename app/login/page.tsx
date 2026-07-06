"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../lib/auth";

function LoginInner() {
  const { login, verify2fa } = useAuth();
  const router = useRouter();
  const next = useSearchParams().get("next") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [challenge, setChallenge] = useState<string | null>(null);
  const [code, setCode] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr("");
    try {
      const res = await login(email, password);
      if (res?.twofa_required) { setChallenge(res.challenge); return; }
      router.push(next);
    } catch (e: any) { setErr(e.message); }
  }
  async function submitCode(e: React.FormEvent) {
    e.preventDefault(); setErr("");
    try { await verify2fa(challenge!, code); router.push(next); }
    catch (e: any) { setErr(e.message); }
  }

  if (challenge) return (
    <div className="container section" style={{ maxWidth: 420 }}>
      <h1>Two-factor code</h1>
      <p className="muted">Enter the 6-digit code from your authenticator app.</p>
      <form onSubmit={submitCode} className="stack" style={{ marginTop: 16 }}>
        <input className="input" inputMode="numeric" autoFocus value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="123456" style={{ fontSize: "1.4rem", letterSpacing: "0.3em", textAlign: "center" }} />
        {err && <p className="help" style={{ color: "var(--red)" }}>{err}</p>}
        <button className="btn btn-gold btn-block btn-lg" type="submit" disabled={code.length !== 6}>Verify</button>
      </form>
    </div>
  );

  return (
    <div className="container section" style={{ maxWidth: 420 }}>
      <h1>Sign in</h1>
      <form onSubmit={submit} className="stack" style={{ marginTop: 16 }}>
        <div className="field"><label>Email</label><input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
        <div className="field"><label>Password</label><input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
        {err && <p className="help" style={{ color: "var(--red)" }}>{err}</p>}
        <button className="btn btn-gold btn-block btn-lg" type="submit">Sign in</button>
      </form>
      <p className="muted center" style={{ marginTop: 14 }}>
        <Link href="/forgot-password" className="gold">Forgot password?</Link>
      </p>
      <p className="muted center" style={{ marginTop: 6 }}>
        New here? <Link href="/register" className="gold">Create an account</Link>
      </p>
    </div>
  );
}

export default function Login() {
  return <Suspense fallback={<div className="container section">Loading…</div>}><LoginInner /></Suspense>;
}
