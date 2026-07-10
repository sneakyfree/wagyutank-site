"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth";

export default function Register() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ display_name: "", email: "", password: "", handle: "", phone: "", country: "", recovery_email: "", marketing_opt_in: true });
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr("");
    try {
      await register({
        ...form, handle: form.handle || undefined,
        phone: form.phone || undefined, country: form.country || undefined, recovery_email: form.recovery_email || undefined,
      });
      router.push("/dashboard");
    } catch (e: any) { setErr(e.message); }
  }

  return (
    <div className="container section" style={{ maxWidth: 460 }}>
      <h1>Create your account</h1>
      <p className="muted">One account to buy and sell. Free.</p>
      <form onSubmit={submit} className="stack" style={{ marginTop: 16 }}>
        <div className="field"><label>Ranch / display name</label><input className="input" value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} required /></div>
        <div className="field"><label>Storefront handle (optional)</label>
          <div className="row" style={{ gap: 4 }}><span className="faint">wagyutank.com/u/</span>
            <input className="input" value={form.handle} onChange={(e) => setForm({ ...form, handle: e.target.value.toLowerCase() })} placeholder="rockingw" /></div>
        </div>
        <div className="field"><label>Email</label><input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
        <div className="field"><label>Password</label><input className="input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} /></div>
        <div className="row" style={{ gap: 10 }}>
          <div className="field" style={{ flex: 1 }}><label>Country</label>
            <select className="select" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}>
              <option value="">Select…</option>
              {[["US","🇺🇸 United States"],["AU","🇦🇺 Australia"],["JP","🇯🇵 Japan"],["CA","🇨🇦 Canada"],["GB","🇬🇧 United Kingdom"],["BR","🇧🇷 Brazil"],["DE","🇩🇪 Germany"],["FR","🇫🇷 France"],["ES","🇪🇸 Spain"],["IT","🇮🇹 Italy"],["NL","🇳🇱 Netherlands"],["MX","🇲🇽 Mexico"],["AR","🇦🇷 Argentina"],["NZ","🇳🇿 New Zealand"],["ZA","🇿🇦 South Africa"],["CN","🇨🇳 China"],["KR","🇰🇷 South Korea"],["IE","🇮🇪 Ireland"],["OT","🌍 Other"]].map(([c,l]) => <option key={c} value={c}>{l}</option>)}
            </select>
            <p className="help">Your flag appears next to your comments worldwide.</p></div>
          <div className="field" style={{ flex: 1 }}><label>Phone (optional)</label><input className="input" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="for account recovery" /></div>
        </div>
        <label className="row" style={{ gap: 8, fontSize: "0.85rem", cursor: "pointer" }}>
          <input type="checkbox" checked={form.marketing_opt_in} onChange={(e) => setForm({ ...form, marketing_opt_in: e.target.checked })} />
          <span className="muted">Email me marketplace news and buyer leads. Unsubscribe anytime.</span>
        </label>
        {err && <p className="help" style={{ color: "var(--red)" }}>{err}</p>}
        <button className="btn btn-gold btn-block btn-lg" type="submit">Create account</button>
      </form>
      <p className="muted center" style={{ marginTop: 16 }}>
        Already have an account? <Link href="/login" className="gold">Sign in</Link>
      </p>
    </div>
  );
}
