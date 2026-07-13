// This tank's identity, baked in at build time (see scripts-gen-tank-config.mjs).
// One frontend build serves any tank: WagyuTank shows everything; a cattle-breed
// tank hides the Japan hub etc. and shows only its product types — all from here.
import cfg from "./tank.config.json";

// A product's "family" decides how it renders: "genetics" (semen/embryo/clone_rights,
// frozen-in-a-tank), "live" (live animals on the hoof), or "beef" (direct-from-producer
// meat, discovery-only). Absent = genetics, so existing tanks are untouched.
export type ProductFamily = "genetics" | "live" | "beef";
type Product = {
  key: string; label: string; unit?: string; icon?: string; fresh_chilled?: boolean;
  family?: ProductFamily; glyph?: string; cardTitle?: string; blurb?: string;
  options?: Record<string, string[]>;
};
// Sister tanks in the cross-site flywheel (e.g. wagyusale ↔ wagyutank) — drives
// the header cross-site button + per-animal PeerLink chips.
type Peer = { key?: string; name?: string; domain: string; families?: string[]; cta?: string };
type TankConfig = {
  key: string;
  brand: { name: string; domain?: string; tagline?: string; species?: string; breed?: string;
           logoText?: string; colors?: Record<string, string>; contactEmail?: string; legal?: string };
  products: Product[];
  features: Record<string, boolean>;
  vocab?: Record<string, any>;
  langs?: string[];
  network?: { peers?: Peer[] };
};

// (via unknown: the imported JSON literal types e.g. `family: string` won't
// structurally overlap the ProductFamily union)
export const TANK = cfg as unknown as TankConfig & { copy?: Record<string, string> };
export const brand = TANK.brand;
export const copy = (TANK.copy || {}) as Record<string, string>;
export const featureOn = (name: string): boolean => TANK.features?.[name] !== false;
export const products = (): Product[] => TANK.products || [];
export const productLabel = (key: string): string =>
  TANK.products?.find((p) => p.key === key)?.label || key;
export const productUnit = (key: string): string =>
  TANK.products?.find((p) => p.key === key)?.unit || "unit";
export const productFamily = (key: string): ProductFamily => {
  const f = TANK.products?.find((p) => p.key === key)?.family;
  return f === "live" || f === "beef" ? f : "genetics";
};
export const productGlyph = (key: string): string | undefined =>
  TANK.products?.find((p) => p.key === key)?.glyph;
export const productOptions = (key: string): Record<string, string[]> =>
  TANK.products?.find((p) => p.key === key)?.options || {};
// Does this tank sell any product of the given family? (gates family-only UI)
export const hasFamily = (family: ProductFamily): boolean =>
  products().some((p) => productFamily(p.key) === family);
export const networkPeers = (): Peer[] =>
  (TANK.network?.peers || []).filter((p) => p && typeof p.domain === "string" && p.domain);
