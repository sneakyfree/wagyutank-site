"use client";
import { useEffect, useState } from "react";
import { useLang, LANGUAGES } from "../lib/i18n";

// One dismissible nudge, shown once per language, to a reader who is browsing in
// something other than English and is about to leave for a seller's site.
//
// Why this exists and why it is only a hint: we CANNOT translate someone else's
// website. Same-origin means no JavaScript of ours ever runs on a seller's page,
// and proxying their site through our domain would mean reproducing their content,
// breaking their contact forms and blinding their analytics — the opposite of the
// good-actor bargain the Roundup depends on.
//
// What we CAN do is two things. Translate everything we lawfully hold, which the
// listing detail now does. And tell the reader the truth: their own browser
// already translates arbitrary pages, and it does it well. That is the only thing
// that genuinely covers every seller site on earth, and it is one setting away.
//
// Deliberately not a modal, not on first paint, and never shown twice.

const HOW: Record<string, string> = {
  chrome: "Right-click the page → Translate to…",
  safari: "Tap the ⓐA in the address bar → Translate to…",
  edge: "Click the translate icon in the address bar",
  firefox: "Settings → General → Translations",
};

function browserKey(): string {
  if (typeof navigator === "undefined") return "chrome";
  const ua = navigator.userAgent;
  if (/Edg\//.test(ua)) return "edge";
  if (/Firefox\//.test(ua)) return "firefox";
  if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) return "safari";
  return "chrome";
}

export default function BrowserTranslateHint() {
  const { lang } = useLang();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (lang === "en") return;
    const key = `wt_xlate_hint_${lang}`;
    let seen = true;
    try { seen = !!localStorage.getItem(key); } catch { /* ignore */ }
    if (seen) return;
    // Let the page settle first — this is a footnote, not an interruption.
    const t = setTimeout(() => setShow(true), 6000);
    return () => clearTimeout(t);
  }, [lang]);

  if (!show) return null;
  const label = LANGUAGES.find((l) => l.code === lang)?.label || lang;

  function dismiss() {
    try { localStorage.setItem(`wt_xlate_hint_${lang}`, "1"); } catch { /* ignore */ }
    setShow(false);
  }

  return (
    <div role="status" style={{
      position: "fixed", right: 16, bottom: 16, zIndex: 9000, maxWidth: 330,
      background: "var(--card, #17130f)", border: "1px solid var(--gold, #d9a441)",
      borderRadius: 10, padding: "0.85rem 0.95rem", boxShadow: "0 8px 28px rgba(0,0,0,0.55)",
      fontSize: "0.83rem", lineHeight: 1.5,
    }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>🌐 {label}</div>
      <p style={{ margin: "0 0 8px", opacity: 0.88 }}>
        Seller sites we link to are written in their own language. Your browser can
        translate any of them automatically — {HOW[browserKey()]}.
      </p>
      <button onClick={dismiss} className="btn-ghost" style={{
        fontSize: "0.78rem", padding: "0.28rem 0.7rem", cursor: "pointer",
      }}>Got it</button>
    </div>
  );
}
