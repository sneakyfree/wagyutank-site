import type { Metadata } from "next";
import { brand } from "../../lib/tank";
import Client from "./Client";

export const metadata: Metadata = {
  title: "The Roundup — Wagyu Genetics For Sale From Across the Web",
  description:
    `Every ${brand.breed || "cattle"} genetics listing we can find, gathered in one place — with export eligibility and a live price index. The world's most complete index of ${brand.breed || "cattle"} genetics for sale.`,
  alternates: { canonical: "/roundup/" },
  openGraph: { title: "The Roundup — Wagyu Genetics For Sale From Across the Web · WagyuTank", url: "/roundup/" },
};

export default function Page() {
  return <Client />;
}
