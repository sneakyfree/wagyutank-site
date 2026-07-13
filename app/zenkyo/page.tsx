import type { Metadata } from "next";
import Client from "./Client";
import FeatureGate from "../../components/FeatureGate";

export const metadata: Metadata = {
  title: "The Zenkyo — Japan's Wagyu Olympics, Every Champion Since 1966",
  description:
    "The complete history of the Zenkyo (全国和牛能力共進会), Japan's National Wagyu Ability Expo held every five years — the 'Wagyu Olympics.' All 13 events, the champion sires behind the world's foundation bloodlines, and the countdown to Hokkaido 2027.",
  alternates: { canonical: "/zenkyo/" },
  openGraph: { title: "The Zenkyo — Japan's Wagyu Olympics · WagyuTank", url: "/zenkyo/" },
};

export default function Page() {
  return <FeatureGate feature="zenkyo"><Client /></FeatureGate>;
}
