import type { Metadata } from "next";
import Client from "./Client";

export const metadata: Metadata = {
  title: "The Roundup — Wagyu Genetics For Sale From Across the Web",
  description:
    "Every Wagyu straw, embryo, and cloning offer we can find, gathered in one place — with export eligibility and a live price index. The world's most complete index of Wagyu genetics for sale.",
  alternates: { canonical: "/roundup/" },
  openGraph: { title: "The Roundup — Wagyu Genetics For Sale From Across the Web · WagyuTank", url: "/roundup/" },
};

export default function Page() {
  return <Client />;
}
