// Bake this tank's config into the static build. Fetches /api/config from the
// tank's API (TANK_API env, default WagyuTank) and writes lib/tank.config.json,
// which the app imports at build time — so feature flags / product labels / brand
// are baked in with no runtime flash. Tolerates a failed fetch: keeps the
// committed default (WagyuTank), so a build never depends on the API being up.
import { writeFileSync, existsSync } from "node:fs";

// Accept EITHER env name — TANK_API is canonical, but the README/CI history
// used NEXT_PUBLIC_API_BASE; if only that is set, honoring it here prevents the
// silent worst case (baking the wagyu default so tankify no-ops on a clone).
const API = process.env.TANK_API || process.env.NEXT_PUBLIC_API_BASE || "https://api.wagyutank.com";
const OUT = new URL("./lib/tank.config.json", import.meta.url);

try {
  const res = await fetch(`${API}/api/config`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const cfg = await res.json();
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
