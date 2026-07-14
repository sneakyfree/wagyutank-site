import type { Metadata } from "next";
import { hasFamily } from "../../lib/tank";
import Client from "./Client";

const _sale = hasFamily("live") || hasFamily("beef");

export const metadata: Metadata = {
  title: _sale
    ? "The Wagyu Atlas — International Directory of Cattle & Beef Sellers"
    : "The Wagyu Atlas — International Directory of Genetics Sellers",
  description: _sale
    ? "A free, worldwide directory of Wagyu cattle and beef producers — ranches, breeders and direct-beef sellers — by country and region, with links straight to each seller's own website. The consolidated map of who's selling Wagyu cattle and beef around the globe."
    : "A free, worldwide directory of Wagyu and Akaushi genetics sellers — semen, embryos and breeding stock — by country and region, with links straight to each seller's own website. The consolidated map of who's selling Wagyu genetics around the globe.",
  alternates: { canonical: "/directory/" },
  openGraph: { title: "The Wagyu Atlas · WagyuTank", url: "/directory/" },
};

export default function Page() {
  return <Client />;
}
