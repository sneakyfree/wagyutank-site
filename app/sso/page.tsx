"use client";
// Sister-site SSO landing: the peer tank sends a signed-in user here with a
// 90-second single-use token in the URL FRAGMENT (#token=…, never sent to any
// server or logged). We redeem it immediately on load for a normal local
// session — first visit creates the local account.
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { brand } from "../../lib/tank";

export default function SsoPage() {
  const { loginWithToken, verify2fa } = useAuth();
  const router = useRouter();
  const [state, setState] = useState<"working" | "twofa" | "error">("working");
  const [err, setErr] = useState("");
  const [challenge, setChallenge] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const redeemed = useRef(false); // tokens are single-use — never redeem twice (StrictMode double-mount)

  useEffect(() => {
    if (redeemed.current) return;
    redeemed.current = true;
    const m = (window.location.hash || "").match(/token=([^&]+)/);
    const token = m ? decodeURIComponent(m[1]) : "";
    // Scrub the token from the address bar/history immediately.
    if (window.location.hash) history.replaceState(null, "", window.location.pathname);
    if (!token) { setErr("No sign-in token found."); setState("error"); return; }
    api.ssoRedeem(token)
      .then((res: any) => {
        if (res?.twofa_required) { setChallenge(res.challenge); setState("twofa"); return; }
        if (res?.access_token) { loginWithToken(res.access_token, res.user); router.replace("/dashboard"); return; }
        setErr("Unexpected response."); setState("error");
      })
      .catch((e: any) => { setErr(e.message || ""); setState("error"); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submitCode(e: React.FormEvent) {
    e.preventDefault(); setErr("");
    try { await verify2fa(challenge!, code); router.replace("/dashboard"); }
    catch (e: any) { setErr(e.message); }
  }

  if (state === "twofa") return (
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

  if (state === "error") return (
    <div className="container section center" style={{ maxWidth: 480 }}>
      <h1>Sign-in link expired</h1>
      <p className="muted">This cross-site sign-in link expired or was already used — go back to the other site and try again.</p>
      {err && <p className="help" style={{ color: "var(--red)" }}>{err}</p>}
      <p style={{ marginTop: 14 }}>
        <Link href="/login" className="btn btn-gold">Sign in to {brand.name}</Link>
      </p>
    </div>
  );

  return <div className="container section center">Signing you in…</div>;
}
