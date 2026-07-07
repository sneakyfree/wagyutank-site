"use client";
import { useEffect, useRef, useState } from "react";
import { LANGUAGES, useLang } from "../lib/i18n";

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

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
          {LANGUAGES.map((l) => (
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
