import type { Metadata } from "next";
import Client from "./Client";
import FeatureGate from "../../components/FeatureGate";

export const metadata: Metadata = {
  title: "The Great Sires & Dams of Japan — A Wagyu Encyclopedia",
  description:
    "A reference encyclopedia of the legendary Wagyu sires and dams — their bloodlines, records, and place in the pedigrees of the world's herds.",
  alternates: { canonical: "/great-sires/" },
  openGraph: { title: "The Great Sires & Dams of Japan · WagyuTank", url: "/great-sires/" },
};

export default function Page() {
  return <FeatureGate feature="great_sires"><Client /></FeatureGate>;
}
