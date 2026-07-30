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
import { useLang, K } from "../lib/i18n";
import { api } from "../lib/api";

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "TEXTAREA",
  "SVG", "CANVAS", "INPUT", "SELECT", "OPTION"]);
// Form controls are skipped for TEXT (we must never rewrite a user's typed value),
// but their placeholder/title/aria-label ARE user-facing copy and must translate.
// Without this split the homepage search box stayed English in all six languages
// even though lib/i18n already had a correct translation for it.
const SKIP_TAGS_ATTRS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "SVG", "CANVAS"]);
const ATTRS = ["placeholder", "title", "aria-label", "alt"];
const HAS_LETTER = /\p{L}/u;
// Scripts an English reader cannot read: CJK, kana, Hangul, Cyrillic, Greek,
// Thai, Hebrew, Arabic, Devanagari, fullwidth. Accented Latin is deliberately
// excluded — ä/ö/ß/× do not need a round trip to the translator.
const FOREIGN_SCRIPT =
  /[Ͱ-ϿЀ-ӿ֐-׿؀-ۿऀ-ॿ฀-๿　-ヿ㐀-䶿一-鿿가-힯＀-￯]/;

// Never machine-translate these — a wrong guess is worse than leaving English.
// Country names are the sharp edge: the translator rendered "Czechia" as
// クロアチア (Croatia) and "Hungary" as チェコ (Czech) on the live site.
const DNT = new Set<string>([
  "A5", "A4", "BMS", "EPD", "EBV", "IMF", "CSS", "USDA", "JMGA", "IVF", "ET", "SCD",
  "Choice", "Prime", "Select", "Choice Boxed Beef Cutout", "CME Feeder Cattle Index",
  "United States", "Australia", "Austria", "Germany", "Japan", "Brazil", "Canada",
  "United Kingdom", "Denmark", "Netherlands", "Spain", "France", "Italy", "Colombia",
  "Mexico", "South Africa", "Norway", "Thailand", "Czechia", "Hungary", "New Zealand",
  "Türkiye", "Vietnam", "Ireland", "China", "South Korea", "Argentina", "Belgium",
  "Poland", "Portugal", "Sweden", "Switzerland", "Paraguay", "Uruguay", "Ecuador",
  "Peru", "Bolivia", "Venezuela", "Kenya", "India", "Pakistan", "Indonesia",
  "Estonia", "Finland", "Bulgaria", "Romania", "Guatemala", "Panama", "United Nations",
]);

const origText = new WeakMap<Text, string>();
const lastOut = new WeakMap<Text, string>();
let touched = new Set<Text>();
const origAttr = new WeakMap<Element, Record<string, string>>();
const lastAttr = new WeakMap<Element, Record<string, string>>();
let touchedEls = new Set<Element>();

// Bump when the dictionary or the backend translation prompt changes, so a
// returning visitor's browser drops its stale copies instead of serving the old
// wording forever. Mirrors _PROMPT_VERSION in backend/app/services/translate.py.
const CACHE_NS = "wt_tr_v3_";
const cacheByLang: Record<string, Record<string, string>> = {};
function cacheFor(lang: string): Record<string, string> {
  if (!cacheByLang[lang]) {
    let c: Record<string, string> = {};
    try { c = JSON.parse(localStorage.getItem(CACHE_NS + lang) || "{}"); } catch { /* ignore */ }
    // Pre-seed the hand-crafted dictionary translations (hero, home copy, common
    // labels) so the fixed parts of the site render INSTANTLY in every language,
    // shipped with the bundle — no live LLM wait "before their eyes".
    for (const key in K) {
      const row = (K as any)[key];
      if (row && row.en && row[lang]) c[row.en] = row[lang];
    }
    cacheByLang[lang] = c;
  }
  return cacheByLang[lang];
}
function persist(lang: string) {
  try { localStorage.setItem(CACHE_NS + lang, JSON.stringify(cacheByLang[lang])); } catch { /* ignore */ }
}

function translatable(s: string): boolean {
  const t = s.trim();
  if (t.length < 2) return false;
  if (!HAS_LETTER.test(t)) return false;
  if (/^[\d\s.,:;$€£¥%+\-/()#·×→↗]+$/.test(t)) return false;
  if (DNT.has(t)) return false;
  return true;
}
function skipWith(el: Element | null, tags: Set<string>): boolean {
  for (let n: Element | null = el; n; n = n.parentElement) {
    if (tags.has(n.tagName)) return true;
    if (n.hasAttribute && n.hasAttribute("data-noloc")) return true;
    if ((n as HTMLElement).isContentEditable) return true;
  }
  return false;
}
function skip(el: Element | null): boolean { return skipWith(el, SKIP_TAGS); }
function skipAttr(el: Element | null): boolean { return skipWith(el, SKIP_TAGS_ATTRS); }

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
    // English used to return here, which meant an English reader got NO
    // translation of anything — including seller copy in a script they cannot
    // read. Browsing the Roundup's Japan shelf in English showed 黒毛和牛 and
    // アニマルジェネティックスジャパン株式会社 verbatim on every card. English was
    // being treated as a source language only, never as a reader language; the
    // biggest audience got the rawest page. (Same shape as the missing English
    // video subtitles.) English now runs the sweep too — but the per-node and
    // per-attribute gates below skip anything already readable, so an all-English
    // page walks its own DOM, finds nothing, and issues zero requests.
    //
    // Do NOT try to shortcut this by testing document.body for foreign text here:
    // this effect runs on mount, BEFORE the client-side listing fetch has painted
    // any cards, so the body is still all-English and the whole sweep — including
    // the MutationObserver that would have caught the cards arriving — was
    // skipped for good. That is precisely why the first attempt at this fix
    // issued zero translate requests.
    // (No early emit needed — the emit below covers it, and TranslationStatus
    // renders nothing for English regardless, so no banner appears.)

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
        // For an English reader, only foreign-script text is worth sending —
        // everything else on the page is already English.
        if (lang === "en" && !FOREIGN_SCRIPT.test(raw)) continue;
        origText.set(tn, raw);
        const key = raw.trim();
        allKeys.add(key);
        const hit = cache[key];
        if (hit) { tn.nodeValue = raw.replace(key, hit); lastOut.set(tn, tn.nodeValue); touched.add(tn); doneKeys.add(key); }
        else { const a = needNodes.get(key); if (a) a.push(tn); else needNodes.set(key, [tn]); }
      }
      for (const attr of ATTRS) {
        document.querySelectorAll("[" + attr + "]").forEach((el) => {
          if (skipAttr(el)) return;
          const raw = el.getAttribute(attr) || "";
          if (lang === "en" && !FOREIGN_SCRIPT.test(raw)) return;
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
