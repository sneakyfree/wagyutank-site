"use client";
// Whole-page machine translation. The hand-written dictionary in lib/i18n only
// covers the nav; this walks the rendered DOM when a non-English language is
// active and translates every visible string via the cached /api/translate/batch
// endpoint, so a German or Japanese visitor reads the whole site.
//
// Critically it RESTORES to English before re-translating on every language
// change — otherwise elements that persist across navigation (the ticker bars)
// stay stuck in a previously-selected language.
import { useEffect } from "react";
import { useLang } from "../lib/i18n";
import { api } from "../lib/api";

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "TEXTAREA",
  "SVG", "CANVAS", "INPUT", "SELECT", "OPTION"]);
const ATTRS = ["placeholder", "title", "aria-label", "alt"];
const HAS_LETTER = /\p{L}/u;

const origText = new WeakMap<Text, string>();
const lastOut = new WeakMap<Text, string>();
let touched = new Set<Text>();
const origAttr = new WeakMap<Element, Record<string, string>>();
const lastAttr = new WeakMap<Element, Record<string, string>>();
let touchedEls = new Set<Element>();

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
  if (!HAS_LETTER.test(t)) return false;
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

// --- progress store for the on-screen status banner ---
type Prog = { busy: boolean; lang: string; done: number; total: number };
let prog: Prog = { busy: false, lang: "en", done: 0, total: 0 };
const subs = new Set<() => void>();
function emit(p: Partial<Prog>) { prog = { ...prog, ...p }; subs.forEach((s) => s()); }
export function subscribeProgress(cb: () => void) { subs.add(cb); return () => { subs.delete(cb); }; }
export function getProgress(): Prog { return prog; }

export default function AutoTranslate() {
  const { lang } = useLang();
  useEffect(() => {
    if (typeof document === "undefined") return;

    // Always restore prior translations to English first, so a lang→lang switch
    // re-translates from a clean English baseline (fixes tickers stuck in an old lang).
    touched.forEach((n) => { const o = origText.get(n); if (o != null) n.nodeValue = o; });
    touched = new Set();
    touchedEls.forEach((el) => { const o = origAttr.get(el); if (o) for (const a in o) el.setAttribute(a, o[a]); });
    touchedEls = new Set();
    if (lang === "en") { emit({ busy: false, lang: "en", done: 0, total: 0 }); return; }

    const cache = cacheFor(lang);
    let cancelled = false;
    let observer: MutationObserver | null = null;
    const allKeys = new Set<string>();
    const doneKeys = new Set<string>();
    const needNodes = new Map<string, Text[]>();
    const needAttrs = new Map<string, { el: Element; attr: string }[]>();
    const attempts = new Map<string, number>();
    emit({ busy: true, lang, done: 0, total: 0 });
    const bump = () => emit({ done: doneKeys.size, total: allKeys.size });

    function scan() {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node: Node | null;
      while ((node = walker.nextNode())) {
        const tn = node as Text;
        const raw = tn.nodeValue || "";
        if (lastOut.get(tn) === raw) continue;
        if (skip(tn.parentElement)) continue;
        if (!translatable(raw)) continue;
        origText.set(tn, raw);
        const key = raw.trim();
        allKeys.add(key);
        const hit = cache[key];
        if (hit) { tn.nodeValue = raw.replace(key, hit); lastOut.set(tn, tn.nodeValue); touched.add(tn); doneKeys.add(key); }
        else { const a = needNodes.get(key); if (a) a.push(tn); else needNodes.set(key, [tn]); }
      }
      for (const attr of ATTRS) {
        document.querySelectorAll("[" + attr + "]").forEach((el) => {
          if (skip(el)) return;
          const raw = el.getAttribute(attr) || "";
          const la = lastAttr.get(el); if (la && la[attr] === raw) return;
          if (!translatable(raw)) return;
          const store = origAttr.get(el) || {}; if (!(attr in store)) { store[attr] = raw; origAttr.set(el, store); }
          const key = raw.trim(); allKeys.add(key);
          const hit = cache[key];
          if (hit) { el.setAttribute(attr, hit); const lo = lastAttr.get(el) || {}; lo[attr] = hit; lastAttr.set(el, lo); touchedEls.add(el); doneKeys.add(key); }
          else { const a = needAttrs.get(key); if (a) a.push({ el, attr }); else needAttrs.set(key, [{ el, attr }]); }
        });
      }
      bump();
    }

    function apply(keys: string[]) {
      for (const key of keys) {
        const tr = cache[key];
        if (tr === undefined) continue;   // failed this round — leave queued for retry
        (needNodes.get(key) || []).forEach((tn) => {
          const o = origText.get(tn) ?? tn.nodeValue ?? ""; tn.nodeValue = o.replace(key, tr);
          lastOut.set(tn, tn.nodeValue); if (tr !== key) touched.add(tn);
        });
        (needAttrs.get(key) || []).forEach(({ el, attr }) => {
          el.setAttribute(attr, tr); const lo = lastAttr.get(el) || {}; lo[attr] = tr; lastAttr.set(el, lo); if (tr !== key) touchedEls.add(el);
        });
        doneKeys.add(key);
        needNodes.delete(key); needAttrs.delete(key);
      }
      bump();
    }

    async function translateGroups() {
      const keys = Array.from(new Set([...needNodes.keys(), ...needAttrs.keys()]));
      const short = keys.filter((k) => k.length <= 500);
      const long = keys.filter((k) => k.length > 500);
      const groups: string[][] = [];
      for (let i = 0; i < short.length; i += 30) groups.push(short.slice(i, i + 30));
      let gi = 0;
      const worker = async () => {
        while (gi < groups.length && !cancelled) {
          const g = groups[gi++];
          let res: any = null;
          try { res = await api.translateBatch(g.map((text, id) => ({ id, text })), lang); } catch { /* ignore */ }
          if (cancelled) return;
          if (res && res.translations) {
            const tr = res.translations;
            // Cache the translation OR the source itself when it translates to
            // itself (sire names, prices). Not caching those made every scan
            // re-request them forever — the endless spinner Grant saw.
            g.forEach((k, id) => { cache[k] = (tr[id] && tr[id] !== k) ? tr[id] : k; });
          } else {
            g.forEach((k) => { const a = (attempts.get(k) || 0) + 1; attempts.set(k, a); if (a >= 3) cache[k] = k; });
          }
          apply(g);
        }
      };
      await Promise.all(Array.from({ length: Math.min(4, groups.length) }, worker));  // parallel for speed
      for (const k of long) {
        if (cancelled) return;
        try { const r: any = await api.translate(k, lang); if (r?.text && r.text !== k) cache[k] = r.text; } catch { /* ignore */ }
        apply([k]);
      }
      persist(lang);
    }

    let running = false, rerun = false;
    async function flush() {
      if (running) { rerun = true; return; }
      running = true;
      do { rerun = false; await translateGroups(); } while (rerun && !cancelled);
      running = false;
      if (!cancelled && (needNodes.size || needAttrs.size)) { flush(); return; }
      if (!cancelled) emit({ busy: false, done: doneKeys.size, total: allKeys.size });
    }

    let timer: any;
    const kick = () => { scan(); if (needNodes.size || needAttrs.size) { emit({ busy: true }); flush(); } else emit({ busy: false }); };
    const schedule = () => { clearTimeout(timer); timer = setTimeout(() => { if (!cancelled) kick(); }, 200); };

    kick();
    const fallbacks = [800, 2000, 4500, 8000].map((ms) => setTimeout(() => { if (!cancelled) kick(); }, ms));
    observer = new MutationObserver(schedule);
    observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
    return () => { cancelled = true; clearTimeout(timer); fallbacks.forEach(clearTimeout); observer?.disconnect(); };
  }, [lang]);

  return null;
}
