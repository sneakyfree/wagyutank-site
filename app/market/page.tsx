import type { Metadata } from "next";
import { hasFamily } from "../../lib/tank";
import Client from "./Client";
import FeatureGate from "../../components/FeatureGate";

const _sale = hasFamily("live") || hasFamily("beef");

export const metadata: Metadata = {
  title: "Beef & Wagyu Market Data — Feeder, Fed, Cutout & Premiums",
  description:
    "The whole cattle complex on one page — feeder and fed cattle, boxed-beef cutout, and Wagyu premiums — with commodity figures from USDA public-domain reports, so " +
    (_sale ? "buyers and sellers can see the market they're trading in." : "genetics buyers can see the market they're breeding into."),
  alternates: { canonical: "/market/" },
  openGraph: { title: "Beef & Wagyu Market Data · WagyuTank", url: "/market/" },
};

export default function Page() {
  return <FeatureGate feature="market_data"><Client /></FeatureGate>;
}
