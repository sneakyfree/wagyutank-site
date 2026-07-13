import type { Metadata } from "next";
import Client from "./Client";
import FeatureGate from "../../components/FeatureGate";

export const metadata: Metadata = {
  title: "Wagyu Japan — Learn From the Source, In Your Language",
  description:
    "The world's window into Japanese Wagyu: translated news, farm and technique videos, champion sale data, the export story, and a glossary of the terms every breeder should know.",
  alternates: { canonical: "/japan/" },
  openGraph: { title: "Wagyu Japan · WagyuTank", url: "/japan/" },
};

export default function Page() {
  return <FeatureGate feature="japan_hub"><Client /></FeatureGate>;
}
