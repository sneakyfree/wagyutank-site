// POST-BUILD: rebrand the whole built site from the source tank (Wagyu) to this
// tank, in ONE pass — so every hardcoded "Wagyu"/"WagyuTank" across every page
// becomes the clone's breed automatically. No per-page hand-editing.
//
// Runs as `postbuild` (npm runs it after `next build`). Skips the wagyu source
// tank (nothing to change). Only touches capitalized brand/breed terms (all UI
// text) + the specific domain/email strings — never lowercase identifiers like
// `black_wagyu` (a data key) or `e.wagyu` (code), which are left untouched.
import { readFileSync, writeFileSync, readdirSync, statSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const cfg = JSON.parse(readFileSync(new URL("./lib/tank.config.json", import.meta.url)));
const B = cfg.brand || {};
const key = cfg.key || "wagyu";
if (key === "wagyu") { console.log("tankify: source tank (wagyu) — no rebranding."); process.exit(0); }

const OUT = fileURLToPath(new URL("./out", import.meta.url));

// ---- PRUNE: physically remove disabled-feature routes from the build. FeatureGate
// only stubs the page BODY; the Next.js `metadata` export, the RSC flight payload,
// and ungated sibling subroutes (zenkyo/event, catalog/submit) still bake into out/
// and are reachable by direct URL. Deleting the route dir is the only thing that
// guarantees a disabled section is truly absent (404, no head leak, no subroute).
const FEATURE_ROUTES = {
  zenkyo: ["zenkyo"], catalog: ["catalog"], market_data: ["market"],
  japan_hub: ["japan"], feeding: ["feeding"], great_sires: ["great-sires"],
  history: ["history"], price_index: ["price"], sale_reports: ["sale-reports"],
  videos: ["videos", "video"], directory: ["directory"], news: ["news"],
  roundup: ["roundup"],
};
const features = cfg.features || {};
const pruned = [];
for (const [feat, routes] of Object.entries(FEATURE_ROUTES)) {
  if (features[feat] === false) {
    for (const r of routes) {
      const rp = join(OUT, r);
      if (existsSync(rp)) { rmSync(rp, { recursive: true, force: true }); pruned.push(r); }
    }
  }
}
// Wagyu foundation bull photos live in the source repo's public/foundation and get
// copied into every build. A clone ships ITS OWN foundation photos (or none) — never
// Wagyu's — so strip the source images from a clone (keep index.html/.txt).
const foundDir = join(OUT, "foundation");
if (existsSync(foundDir)) {
  for (const f of readdirSync(foundDir)) {
    if (/\.(jpe?g|png|webp|avif)$/i.test(f)) rmSync(join(foundDir, f), { force: true });
  }
}
if (pruned.length) console.log(`tankify: pruned disabled routes → ${pruned.join(", ")}`);

const breed = B.breed || "cattle";      // e.g. "Murray Grey"
const name = B.name || "Tank";          // e.g. "MurrayGreyTank"
const domain = B.domain || "";          // e.g. "murraygreytank.com"
const email = B.contactEmail || "";     // e.g. "office@murraygreytank.com"

// Ordered. Specific strings first (plain), then whole-word breed terms (regex).
// Capitalized-only for the breed word so lowercase code identifiers stay intact.
// Clone-only copy fixes: Wagyu's Japanese-origin framing has no universal
// target (gir→India, dexter→Ireland), so the safe, breed-agnostic fix is to DROP
// the Japan-specific clauses — the sentences read correctly without them. These
// run for EVERY clone (tankify already exits early for the wagyu source), so no
// per-breed substitution upkeep. Match the BUILT form (JSX collapses whitespace).
const CLONE_DROPS = [
  [", all regions ex-Japan", ""],
  ["Japanese farms and technique. ", ""],
  ["Australian sales in AUD, Japanese in JPY, with an approximate USD conversion for comparison.",
   "In local currencies, with an approximate USD conversion for comparison."],
  ["AWA Elite Wagyu Sale — average price by year", "Elite genetics sale — average price by year"],
  ["Matsusaka champion cow — auction price by year", "Champion female — auction price by year"],
  ["Japanese reporting translated into English, found nowhere else.",
   "global reporting translated into your language."],
  // page <head> metadata descriptions (SEO) — drop the Japan/CSS clauses
  ["Japanese farm and technique videos, ", ""],
  ["Australia, Japan, the US, Europe, and Brazil", "Australia, the US, Europe, and South America"],
  [" — plus Japanese Wagyu reporting translated into English, found nowhere else", ""],
  ["& Translated Japanese Reporting", ""],
  ["CSS export eligibility, ", ""],
  // home/news wire subtitle — the "Japanese reporting" clause in every locale
  // (tankify's other drops were EN-only; these cover es/pt/de/ja/zh).
  [" — including Japanese reporting translated into English, found nowhere else", ""],
  [" — incluyendo reportajes japoneses traducidos, que no encontrarás en ningún otro lugar", ""],
  [" — incluindo reportagens japonesas traduzidas, que você não encontra em nenhum outro lugar", ""],
  [" — inklusive übersetzter japanischer Berichte, die es sonst nirgends gibt", ""],
  [" — 他では読めない日本語報道の翻訳も", ""],
  ["——包括别处找不到的日本报道翻译", ""],
];
const PLAIN = [
  ...CLONE_DROPS,
  ["office@wagyutank.com", email],
  ["WagyuTank", name],
  ["wagyutank.com", domain],
  ["Wagyu & Akaushi", breed],
  ["Wagyu and Akaushi", breed],
  ["Wagyu/Akaushi", breed],
  // CJK: ja/zh i18n strings + Japan-page copy write Wagyu as 和牛 — a Latin-only
  // regex can't catch it. Clones show the English breed name in those locales.
  ["和牛", breed],
];
const REGEX = [
  [/\bAkaushi\b/g, breed],   // capital only; lowercase `akaushi` (a breed key) untouched
  [/\bWagyu\b/g, breed],     // capital only; lowercase `wagyu` (black_wagyu, e.wagyu) untouched
  // ALL-CAPS display strings (hero eyebrow "THE GLOBAL WAGYU CROSSROADS",
  // "WAGYU SEMEN INDEX" ticker, pills) — \bWagyu\b never matches these.
  [/\bWAGYU\b/g, breed.toUpperCase()],
  [/\bAKAUSHI\b/g, breed.toUpperCase()],
];
// Optional per-tank extra substitutions for deeper source-specific content
// (e.g. a tank can map "Japanese farms" -> "Australian studs"). From tank.json.
const EXTRA = Array.isArray(cfg.substitutions) ? cfg.substitutions : [];

function rebrand(text) {
  for (const [from, to] of EXTRA) text = text.split(from).join(to);
  for (const [from, to] of PLAIN) text = text.split(from).join(to);
  for (const [re, to] of REGEX) text = text.replace(re, to);
  return text;
}

let files = 0, changed = 0;
function walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    const st = statSync(p);
    if (st.isDirectory()) { walk(p); continue; }
    if (!/\.(html|js|txt|xml|json)$/.test(f)) continue;
    if (f.endsWith(".map")) continue;
    files++;
    const orig = readFileSync(p, "utf8");
    const next = rebrand(orig);
    if (next !== orig) { writeFileSync(p, next); changed++; }
  }
}
walk(fileURLToPath(new URL("./out", import.meta.url)));
console.log(`tankify: rebranded Wagyu→${breed}, WagyuTank→${name} across ${changed}/${files} built files.`);
