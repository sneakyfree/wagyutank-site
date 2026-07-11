// This tank's identity, baked in at build time (see scripts-gen-tank-config.mjs).
// One frontend build serves any tank: WagyuTank shows everything; a cattle-breed
// tank hides the Japan hub etc. and shows only its product types — all from here.
import cfg from "./tank.config.json";

type Product = { key: string; label: string; unit?: string; icon?: string; fresh_chilled?: boolean };
type TankConfig = {
  key: string;
  brand: { name: string; domain?: string; tagline?: string; species?: string; breed?: string;
           logoText?: string; colors?: Record<string, string>; contactEmail?: string; legal?: string };
  products: Product[];
  features: Record<string, boolean>;
  vocab?: Record<string, any>;
  langs?: string[];
};

export const TANK = cfg as TankConfig;
export const brand = TANK.brand;
export const featureOn = (name: string): boolean => TANK.features?.[name] !== false;
export const products = (): Product[] => TANK.products || [];
export const productLabel = (key: string): string =>
  TANK.products?.find((p) => p.key === key)?.label || key;
export const productUnit = (key: string): string =>
  TANK.products?.find((p) => p.key === key)?.unit || "unit";
