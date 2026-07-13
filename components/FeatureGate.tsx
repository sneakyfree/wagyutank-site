import Link from "next/link";
import { featureOn, TANK } from "../lib/tank";

// Build-time feature guard for whole pages. TANK.features is baked into the
// build, so when a tank has this feature OFF the page's STATIC HTML is this
// stub — no other-breed content is ever emitted into a clone's out/. When the
// feature is ON, the real page renders unchanged.
export default function FeatureGate({ feature, children }: { feature: string; children: React.ReactNode }) {
  if (featureOn(feature)) return <>{children}</>;
  const name = (TANK.brand as any)?.name || "This marketplace";
  return (
    <div className="container section" style={{ textAlign: "center", padding: "80px 20px" }}>
      <h1 style={{ fontSize: "1.6rem" }}>Not available here</h1>
      <p className="muted" style={{ maxWidth: "48ch", margin: "12px auto 24px" }}>
        {name} doesn’t include this section. Explore the marketplace, foundation
        animals, and news instead.
      </p>
      <Link href="/" className="btn btn-go">Back to home</Link>
    </div>
  );
}
