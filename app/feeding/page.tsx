import type { Metadata } from "next";
import Client from "./Client";
import FeatureGate from "../../components/FeatureGate";

export const metadata: Metadata = {
  title: "The Art of Feeding Wagyu — Learn From the Science",
  description:
    "How Wagyu are fed for marbling: the long finish, vitamin A control, the ration, roughage and rumen health, stress-free husbandry, and why Western results disappoint — the documented science, honestly told, in six languages, plus Japanese feeding videos and a worldwide breeder Q&A.",
  alternates: { canonical: "/feeding/" },
  openGraph: { title: "The Art of Feeding Wagyu · WagyuTank", url: "/feeding/" },
};

export default function Page() {
  return <FeatureGate feature="feeding"><Client /></FeatureGate>;
}
