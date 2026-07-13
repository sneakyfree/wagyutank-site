"use client";
import { useEffect, useRef, useState } from "react";
import { LANGUAGES, useLang } from "../lib/i18n";
import { TANK } from "../lib/tank";

// Offer only the languages this tank declares in tank.json `langs` (intersected
// with the languages the UI dictionary actually supports). A clone that lists
// fewer langs shows fewer options; an unsupported lang (e.g. one with no dict)
// is silently omitted rather than promising a translation that can't render.
const OFFERED = (() => {
  const declared: string[] = Array.isArray((TANK as any).langs) ? (TANK as any).langs : [];
  const set = new Set(declared.length ? declared : LANGUAGES.map((l) => l.code));
  const offered = LANGUAGES.filter((l) => set.has(l.code));
  return offered.length ? offered : LANGUAGES;
})();

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = OFFERED.find((l) => l.code === lang) || OFFERED[0];

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div className="lang-switch" ref={ref}>
      <button className="lang-switch-btn" onClick={() => setOpen((o) => !o)} aria-label="Change language" title="Language">
        <span className="lang-flag">{current.flag}</span>
        <span className="lang-code">{current.code.toUpperCase()}</span>
        <span className="lang-caret">▾</span>
      </button>
      {open && (
        <div className="lang-menu">
          {OFFERED.map((l) => (
            <button key={l.code} className={`lang-item ${l.code === lang ? "on" : ""}`}
              onClick={() => { setLang(l.code); setOpen(false); }}>
              <span className="lang-flag">{l.flag}</span>
              <span className="lang-item-label">{l.label}</span>
              <span className="lang-item-en">{l.english}</span>
              {l.code === lang && <span className="lang-check">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
