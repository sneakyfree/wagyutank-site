// Bake this tank's config into the static build. Fetches /api/config from the
// tank's API (TANK_API env, default WagyuTank) and writes lib/tank.config.json,
// which the app imports at build time — so feature flags / product labels / brand
// are baked in with no runtime flash. Tolerates a failed fetch: keeps the
// committed default (WagyuTank), so a build never depends on the API being up.
import { writeFileSync, existsSync, readFileSync } from "node:fs";

// Accept EITHER env name — TANK_API is canonical, but the README/CI history
// used NEXT_PUBLIC_API_BASE; if only that is set, honoring it here prevents the
// silent worst case (baking the wagyu default so tankify no-ops on a clone).
const API = process.env.TANK_API || process.env.NEXT_PUBLIC_API_BASE || "https://api.wagyutank.com";
const OUT = new URL("./lib/tank.config.json", import.meta.url);

// First-hatch bootstrap: a brand-new tank's api.<domain> DNS may not resolve
// yet when the frontend first builds. TANK_JSON=<path to tanks/<key>/tank.json>
// lets the build synthesize the same shape /api/config would return, so the
// clone NEVER falls back to the wagyu default (which would make tankify no-op).
function fromTankJson(path) {
  const raw = JSON.parse(readFileSync(path, "utf8"));
  return {
    key: raw.key,
    brand: raw.brand || {},
    products: raw.products || [],
    features: raw.features || {},
    vocab: raw.vocab || {},
    copy: raw.copy || {},
    langs: raw.langs || ["en"],
    network: raw.network || {},
    substitutions: raw.substitutions || [],
  };
}

try {
  let cfg;
  try {
    const res = await fetch(`${API}/api/config`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    cfg = await res.json();
  } catch (apiErr) {
    if (!process.env.TANK_JSON) throw apiErr;
    cfg = fromTankJson(process.env.TANK_JSON);
    console.log(`tank-config: API unreachable (${apiErr.message}) — synthesized from ${process.env.TANK_JSON}`);
  }
  if (!cfg?.brand?.name || !Array.isArray(cfg.products)) throw new Error("bad config shape");
  writeFileSync(OUT, JSON.stringify(cfg, null, 2));
  console.log(`tank config baked from ${API}: ${cfg.brand.name} (${cfg.products.length} products)`);
} catch (e) {
  if (existsSync(OUT)) {
    console.warn(`tank config fetch failed (${e.message}) — using committed default.`);
  } else {
    console.error(`tank config fetch failed and no committed default present: ${e.message}`);
    process.exit(1);
  }
}
