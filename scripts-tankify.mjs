// POST-BUILD: rebrand the whole built site from the source tank (Wagyu) to this
// tank, in ONE pass — so every hardcoded "Wagyu"/"WagyuTank" across every page
// becomes the clone's breed automatically. No per-page hand-editing.
//
// Runs as `postbuild` (npm runs it after `next build`). Skips the wagyu source
// tank (nothing to change). Only touches capitalized brand/breed terms (all UI
// text) + the specific domain/email strings — never lowercase identifiers like
// `black_wagyu` (a data key) or `e.wagyu` (code), which are left untouched.
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const cfg = JSON.parse(readFileSync(new URL("./lib/tank.config.json", import.meta.url)));
const B = cfg.brand || {};
const key = cfg.key || "wagyu";
if (key === "wagyu") { console.log("tankify: source tank (wagyu) — no rebranding."); process.exit(0); }

const breed = B.breed || "cattle";      // e.g. "Murray Grey"
const name = B.name || "Tank";          // e.g. "MurrayGreyTank"
const domain = B.domain || "";          // e.g. "murraygreytank.com"
const email = B.contactEmail || "";     // e.g. "office@murraygreytank.com"

// Ordered. Specific strings first (plain), then whole-word breed terms (regex).
// Capitalized-only for the breed word so lowercase code identifiers stay intact.
const PLAIN = [
  ["office@wagyutank.com", email],
  ["WagyuTank", name],
  ["wagyutank.com", domain],
  ["Wagyu & Akaushi", breed],
  ["Wagyu and Akaushi", breed],
  ["Wagyu/Akaushi", breed],
];
const REGEX = [
  [/\bAkaushi\b/g, breed],   // capital only; lowercase `akaushi` (a breed key) untouched
  [/\bWagyu\b/g, breed],     // capital only; lowercase `wagyu` (black_wagyu, e.wagyu) untouched
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
