"use client";
// The "we're translating the whole site, hang tight" banner. Sits in the
// BOTTOM-RIGHT (never over the nav), is draggable, and can be dismissed. Shows a
// spinner + progress in the target language AND English, then fades out when
// translation settles.
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { subscribeProgress, getProgress } from "./AutoTranslate";
import { LANGUAGES } from "../lib/i18n";

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
  const [dismissed, setDismissed] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const drag = useRef<{ dx: number; dy: number } | null>(null);

  // New language = fresh banner (undo a prior dismissal).
  useEffect(() => { setDismissed(false); }, [p.lang]);

  // Keep it up briefly after work settles so it doesn't flicker between batches.
  useEffect(() => {
    if (p.busy && p.lang !== "en") { setShow(true); return; }
    const t = setTimeout(() => setShow(false), 700);
    return () => clearTimeout(t);
  }, [p.busy, p.lang]);

  useEffect(() => {
    if (!drag.current) return;
    const move = (e: PointerEvent) => {
      if (!drag.current) return;
      setPos({ left: e.clientX - drag.current.dx, top: e.clientY - drag.current.dy });
    };
    const up = () => { drag.current = null; window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
  });

  if (!show || dismissed || p.lang === "en") return null;
  const meta = LANGUAGES.find((l) => l.code === p.lang);
  const pct = p.total ? Math.min(100, Math.round((p.done / p.total) * 100)) : 0;

  const onDown = (e: React.PointerEvent) => {
    const el = (e.currentTarget as HTMLElement).getBoundingClientRect();
    drag.current = { dx: e.clientX - el.left, dy: e.clientY - el.top };
    setPos({ left: el.left, top: el.top });
  };

  return (
    <div
      className={"tr-status" + (p.busy ? "" : " tr-status-done")}
      role="status" data-noloc
      style={pos ? { left: pos.left, top: pos.top, right: "auto", bottom: "auto" } : undefined}
      onPointerDown={onDown}
    >
      <span className={"tr-spin" + (p.busy ? "" : " tr-spin-done")} aria-hidden />
      <div className="tr-status-body">
        <b>{meta?.flag} {PHRASE[p.lang] || `Translating the site to ${meta?.english}`}</b>
        <span className="tr-status-en">Switching the entire site to {meta?.english} — one moment{p.total ? ` · ${pct}%` : ""}</span>
        <div className="tr-bar"><div className="tr-bar-fill" style={{ width: (p.busy ? Math.max(6, pct) : 100) + "%" }} /></div>
      </div>
      <button className="tr-close" aria-label="Dismiss" title="Dismiss"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => setDismissed(true)}>✕</button>
    </div>
  );
}
