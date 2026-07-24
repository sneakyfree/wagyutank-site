"use client";
// The "we're translating the whole site, hang tight" banner. Machine-translating
// a full page the first time takes a while; without feedback a visitor thinks
// nothing is happening. Shows a spinner + progress in the target language AND
// English, and fades out when translation settles.
import { useEffect, useState, useSyncExternalStore } from "react";
import { subscribeProgress, getProgress } from "./AutoTranslate";
import { LANGUAGES } from "../lib/i18n";

// "Switching the entire site to <your language>" — in that language.
const PHRASE: Record<string, string> = {
  es: "Traduciendo todo el sitio al español",
  pt: "Traduzindo todo o site para o português",
  de: "Die gesamte Website wird ins Deutsche übersetzt",
  ja: "サイト全体を日本語に翻訳しています",
  zh: "正在将整个网站翻译成中文",
};

export default function TranslationStatus() {
  const p = useSyncExternalStore(subscribeProgress, getProgress, getProgress);
  const [show, setShow] = useState(false);
  // Keep the banner up briefly after work settles so it doesn't flicker between batches.
  useEffect(() => {
    if (p.busy && p.lang !== "en") { setShow(true); return; }
    const t = setTimeout(() => setShow(false), 600);
    return () => clearTimeout(t);
  }, [p.busy, p.lang]);

  if (!show || p.lang === "en") return null;
  const meta = LANGUAGES.find((l) => l.code === p.lang);
  const pct = p.total ? Math.min(100, Math.round((p.done / p.total) * 100)) : 0;
  return (
    <div className={"tr-status" + (p.busy ? "" : " tr-status-done")} role="status" data-noloc>
      <span className="tr-spin" aria-hidden />
      <div className="tr-status-body">
        <b>{meta?.flag} {PHRASE[p.lang] || `Translating the site to ${meta?.english}`}</b>
        <span className="tr-status-en">Switching the entire site to {meta?.english} — one moment{p.total ? ` · ${pct}%` : ""}</span>
        <div className="tr-bar"><div className="tr-bar-fill" style={{ width: (p.busy ? Math.max(6, pct) : 100) + "%" }} /></div>
      </div>
    </div>
  );
}
