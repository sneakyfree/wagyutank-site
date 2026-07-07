import type { Metadata } from "next";
import Client from "./Client";

export const metadata: Metadata = {
  title: "Wagyu Sale Reports — Every Auction, Charted",
  description:
    "The world's forensic record of Wagyu genetics and cattle auctions since 2000 — bull, female, semen, and embryo averages and top prices from Australia, Japan, the US, Europe, and Brazil, charted over the years. Every figure sourced.",
  alternates: { canonical: "/sale-reports/" },
  openGraph: { title: "Wagyu Sale Reports — Every Auction, Charted · WagyuTank", url: "/sale-reports/" },
};

export default function Page() {
  return <Client />;
}
