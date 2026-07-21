"use client";
import { useEffect, useState } from "react";
import { API_BASE } from "../lib/api";

// The weekly letter is the best reason to come back to the site, and until now
// the only way to get it was to notice a checkbox while registering an account.
// This asks for an email and a language — nothing else.

const LANGS: { code: string; label: string }[] = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "pt", label: "Português" },
  { code: "de", label: "Deutsch" },
  { code: "ja", label: "日本語" },
  { code: "zh", label: "中文" },
];

export default function NewsletterSignup({
  source = "site", compact = false,
}: { source?: string; compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [lang, setLang] = useState("en");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    // Default the dropdown to whatever language they're already reading in.
    try {
      const saved = localStorage.getItem("wt_lang");
      if (saved && LANGS.some((l) => l.code === saved)) setLang(saved);
    } catch { /* private mode — English is a fine default */ }
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setState("busy"); setMsg("");
    try {
      const res = await fetch(`${API_BASE}/api/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), lang, source }),
      });
      if (res.ok) {
        setState("done");
        setMsg(lang === "en"
          ? "You're on the list — the next edition goes out Monday."
          : "You're on the list. Your first edition will arrive in your language.");
      } else if (res.status === 429) {
        setState("error"); setMsg("Too many signups from this connection — try again later.");
      } else if (res.status === 422) {
        setState("error"); setMsg("That doesn't look like a valid email address.");
      } else {
        setState("error"); setMsg("Something went wrong. Please try again.");
      }
    } catch {
      setState("error"); setMsg("Couldn't reach the server. Please try again.");
    }
  }

  if (state === "done") {
    return (
      <div className="card card-pad" style={{ borderColor: "var(--gold)" }}>
        <strong className="gold">✓ Subscribed</strong>
        <p className="muted" style={{ margin: "6px 0 0" }}>{msg}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={compact ? "" : "card card-pad"}
          style={compact ? undefined : { borderColor: "var(--gold)" }}>
      {!compact && (
        <>
          <h3 style={{ marginTop: 0 }}>📬 The State of the Wagyu Weekly</h3>
          <p className="muted" style={{ lineHeight: 1.65, marginTop: 4 }}>
            Every Monday: the week's most important Wagyu news from every market —
            Japan, Australia, the Americas, Europe — plus the genetics price index,
            new listings and record sales. <strong className="gold">Delivered in your
            language.</strong> Free, and you don't need an account.
          </p>
        </>
      )}
      <div className="row wrap" style={{ gap: 8, marginTop: compact ? 0 : 12 }}>
        <input
          type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="you@ranch.com" aria-label="Email address"
          style={{ flex: "2 1 220px", minWidth: 0 }}
        />
        <select value={lang} onChange={(e) => setLang(e.target.value)}
                aria-label="Newsletter language" style={{ flex: "1 1 130px" }}>
          {LANGS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
        </select>
        <button className="btn btn-gold" disabled={state === "busy"} style={{ flex: "0 0 auto" }}>
          {state === "busy" ? "…" : "Subscribe"}
        </button>
      </div>
      {msg && <p className="faint" style={{ marginTop: 8, color: state === "error" ? "var(--red)" : undefined }}>{msg}</p>}
      {!compact && (
        <p className="faint" style={{ fontSize: "0.78rem", marginTop: 10 }}>
          One email a week. Unsubscribe in one click, any time.
        </p>
      )}
    </form>
  );
}
