"use client";
import { useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";

export default function TwoFactorSetup() {
  const { refresh } = useAuth();
  const [setup, setSetup] = useState<any>(null);
  const [code, setCode] = useState("");
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [err, setErr] = useState("");
  const [disabling, setDisabling] = useState(false);

  async function start() {
    setErr("");
    try { const s = await api.twofaSetup(); setSetup(s); setEnabled(s.enabled); } catch (e: any) { setErr(e.message); }
  }
  async function enable() {
    setErr("");
    try { await api.twofaEnable(code); setEnabled(true); setSetup(null); setCode(""); refresh(); } catch (e: any) { setErr(e.message); }
  }
  async function disable() {
    setErr("");
    try { await api.twofaDisable(code); setEnabled(false); setDisabling(false); setCode(""); refresh(); } catch (e: any) { setErr(e.message); }
  }

  return (
    <div className="card card-pad" style={{ maxWidth: 460 }}>
      <div className="row"><strong>Two-factor authentication</strong><div className="spacer" />
        {enabled === true && <span className="pill pill-green">ON</span>}</div>
      <p className="faint" style={{ fontSize: "0.85rem" }}>Protect your account with a code from an authenticator app (Google Authenticator, Authy, 1Password).</p>

      {enabled === true ? (
        disabling ? (
          <div className="stack" style={{ gap: 8 }}>
            <input className="input" inputMode="numeric" placeholder="Current 6-digit code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} />
            <div className="row" style={{ gap: 8 }}><button className="btn danger" onClick={disable}>Turn off 2FA</button><button className="btn btn-ghost" onClick={() => setDisabling(false)}>Cancel</button></div>
          </div>
        ) : <button className="btn" onClick={() => setDisabling(true)}>Disable 2FA</button>
      ) : setup ? (
        <div className="stack" style={{ gap: 10 }}>
          <p className="faint" style={{ fontSize: "0.82rem" }}>1. Scan this with your authenticator app:</p>
          <img src={setup.qr_svg} alt="2FA QR" style={{ width: 168, height: 168, background: "#fff", borderRadius: 8, padding: 6 }} />
          <p className="faint" style={{ fontSize: "0.75rem" }}>Or enter this key manually: <code>{setup.secret}</code></p>
          <p className="faint" style={{ fontSize: "0.82rem" }}>2. Enter the 6-digit code it shows:</p>
          <input className="input" inputMode="numeric" placeholder="123456" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} />
          <button className="btn btn-gold" onClick={enable} disabled={code.length !== 6}>Verify & turn on</button>
        </div>
      ) : (
        <button className="btn btn-gold" onClick={start}>Enable 2FA</button>
      )}
      {err && <p className="help" style={{ color: "var(--red)" }}>{err}</p>}
    </div>
  );
}
