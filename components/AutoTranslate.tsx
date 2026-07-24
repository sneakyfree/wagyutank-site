"use client";
// Whole-page machine translation. The hand-written dictionary in lib/i18n only
// covers the nav and a few hero strings; everything else — headings, buttons,
// body copy, market-data labels — stayed English. This walks the rendered DOM
// when a non-English language is active and translates every visible string via
// the cached /api/translate/batch endpoint, so a German or Japanese visitor
// reads the whole site, not 15% of it. Results are cached (memory + localStorage
// + the server's permanent cache), so it is a one-time cost per string per lang.
import { useEffect } from "react";
import { useLang } from "../lib/i18n";
import { api } from "../lib/api";

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "TEXTAREA",
  "SVG", "CANVAS", "INPUT", "SELECT", "OPTION"]);
const ATTRS = ["placeholder", "title", "aria-label", "alt"];
const HAS_LETTER = /\p{L}/u;

// Per-node bookkeeping (WeakMaps so detached nodes are GC'd).
const origText = new WeakMap<Text, string>();   // first English seen
const lastOut = new WeakMap<Text, string>();    // last value WE set
let touched = new Set<Text>();                  // nodes we translated (for restore)
const origAttr = new WeakMap<Element, Record<string, string>>();
const lastAttr = new WeakMap<Element, Record<string, string>>();
let touchedEls = new Set<Element>();

// lang -> { english : translated }
const cacheByLang: Record<string, Record<string, string>> = {};
function cacheFor(lang: string): Record<string, string> {
  if (!cacheByLang[lang]) {
    let c: Record<string, string> = {};
    try { c = JSON.parse(localStorage.getItem("wt_tr_" + lang) || "{}"); } catch { /* ignore */ }
    cacheByLang[lang] = c;
  }
  return cacheByLang[lang];
}
function persist(lang: string) {
  try { localStorage.setItem("wt_tr_" + lang, JSON.stringify(cacheByLang[lang])); } catch { /* ignore */ }
}

function translatable(s: string): boolean {
  const t = s.trim();
  if (t.length < 2) return false;
  if (!HAS_LETTER.test(t)) return false;                 // pure numbers / symbols / emoji
  if (/^[\d\s.,:;$€£¥%+\-/()#·×→↗]+$/.test(t)) return false;
  return true;
}
function skip(el: Element | null): boolean {
  for (let n: Element | null = el; n; n = n.parentElement) {
    if (SKIP_TAGS.has(n.tagName)) return true;
    if (n.hasAttribute && n.hasAttribute("data-noloc")) return true;
    if ((n as HTMLElement).isContentEditable) return true;
  }
  return false;
}

export default function AutoTranslate() {
  const { lang } = useLang();
  useEffect(() => {
    if (typeof document === "undefined") return;

    // --- switch back to English: restore every string we changed ---
    if (lang === "en") {
      touched.forEach((n) => { const o = origText.get(n); if (o != null) n.nodeValue = o; });
      touchedEls.forEach((el) => { const o = origAttr.get(el); if (o) for (const a in o) el.setAttribute(a, o[a]); });
      touched = new Set(); touchedEls = new Set();
      return;
    }

    const cache = cacheFor(lang);
    let cancelled = false;
    let flushing = false;
    let observer: MutationObserver | null = null;
    const needNodes = new Map<string, Text[]>();
    const needAttrs = new Map<string, { el: Element; attr: string }[]>();
    const push = <T,>(m: Map<string, T[]>, k: string, v: T) => { const a = m.get(k); if (a) a.push(v); else m.set(k, [v]); };

    function scan() {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node: Node | null;
      while ((node = walker.nextNode())) {
        const tn = node as Text;
        const raw = tn.nodeValue || "";
        if (lastOut.get(tn) === raw) continue;             // still our translation
        if (skip(tn.parentElement)) continue;
        if (!translatable(raw)) continue;
        origText.set(tn, raw);
        const key = raw.trim();
        const hit = cache[key];
        if (hit) { tn.nodeValue = raw.replace(key, hit); lastOut.set(tn, tn.nodeValue); touched.add(tn); }
        else push(needNodes, key, tn);
      }
      for (const attr of ATTRS) {
        document.querySelectorAll("[" + attr + "]").forEach((el) => {
          if (skip(el)) return;
          const raw = el.getAttribute(attr) || "";
          const last = lastAttr.get(el); if (last && last[attr] === raw) return;
          if (!translatable(raw)) return;
          const store = origAttr.get(el) || {}; if (!(attr in store)) { store[attr] = raw; origAttr.set(el, store); }
          const key = raw.trim();
          const hit = cache[key];
          if (hit) { el.setAttribute(attr, hit); const lo = lastAttr.get(el) || {}; lo[attr] = hit; lastAttr.set(el, lo); touchedEls.add(el); }
          else push(needAttrs, key, { el, attr });
        });
      }
    }

    function apply(keys: string[]) {
      observer?.disconnect();
      for (const key of keys) {
        const tr = cache[key]; if (!tr) { needNodes.delete(key); needAttrs.delete(key); continue; }
        (needNodes.get(key) || []).forEach((tn) => {
          const o = origText.get(tn) ?? tn.nodeValue ?? ""; tn.nodeValue = o.replace(key, tr);
          lastOut.set(tn, tn.nodeValue); touched.add(tn);
        });
        (needAttrs.get(key) || []).forEach(({ el, attr }) => {
          el.setAttribute(attr, tr); const lo = lastAttr.get(el) || {}; lo[attr] = tr; lastAttr.set(el, lo); touchedEls.add(el);
        });
        needNodes.delete(key); needAttrs.delete(key);
      }
      if (!cancelled) observer?.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
    }

    async function flush() {
      if (flushing) return; flushing = true;
      try {
        const keys = Array.from(new Set([...needNodes.keys(), ...needAttrs.keys()]));
        const short = keys.filter((k) => k.length <= 500);
        const long = keys.filter((k) => k.length > 500);
        for (let i = 0; i < short.length && !cancelled; i += 50) {
          const group = short.slice(i, i + 50);
          let res: any = null;
          try { res = await api.translateBatch(group.map((text, id) => ({ id, text })), lang); } catch { /* ignore */ }
          if (cancelled) return;
          const tr = res?.translations || {};
          group.forEach((key, id) => { if (tr[id] && tr[id] !== key) cache[key] = tr[id]; });
          apply(group);
        }
        for (const key of long) {
          if (cancelled) return;
          try { const r: any = await api.translate(key, lang); if (r?.text && r.text !== key) cache[key] = r.text; } catch { /* ignore */ }
          apply([key]);
        }
        persist(lang);
      } finally { flushing = false; }
      if (!cancelled && (needNodes.size || needAttrs.size)) schedule();
    }

    let timer: any;
    const schedule = () => { clearTimeout(timer); timer = setTimeout(() => { if (!cancelled) { scan(); flush(); } }, 300); };

    scan(); flush();
    const fallbacks = [1200, 3500, 7000].map((ms) => setTimeout(() => { if (!cancelled) { scan(); flush(); } }, ms));
    observer = new MutationObserver(schedule);
    observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
    return () => { cancelled = true; clearTimeout(timer); fallbacks.forEach(clearTimeout); observer?.disconnect(); };
  }, [lang]);

  return null;
}
