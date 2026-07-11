import type { Metadata } from "next";
import Client from "./Client";

export const metadata: Metadata = {
  title: "The Wagyu Atlas — International Directory of Genetics Sellers",
  description:
    "A free, worldwide directory of Wagyu and Akaushi genetics sellers — semen, embryos and breeding stock — by country and region, with links straight to each seller's own website. The consolidated map of who's selling Wagyu genetics around the globe.",
  alternates: { canonical: "/directory/" },
  openGraph: { title: "The Wagyu Atlas · WagyuTank", url: "/directory/" },
};

export default function Page() {
  return <Client />;
}
