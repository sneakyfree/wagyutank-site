import type { Metadata } from "next";
import { hasFamily } from "../../lib/tank";
import Client from "./Client";

const _sale = hasFamily("live") || hasFamily("beef");

export const metadata: Metadata = {
  title: "Help & FAQ — Questions, Answers & a Wagyu Help Assistant",
  description: _sale
    ? "Answers to common questions about WagyuTank, buying and selling live Wagyu cattle (bulls, cows, bred and open heifers, cow-calf pairs, feeders and steers) and direct-from-ranch beef, plus a help assistant that can answer anything else, in your language."
    : "Answers to common questions about WagyuTank, buying and selling Wagyu and Akaushi genetics (semen, embryos, cloning rights), CSS export eligibility, and the breed itself — plus a help assistant that can answer anything else, in your language.",
  alternates: { canonical: "/help/" },
  openGraph: { title: "Help & FAQ · WagyuTank", url: "/help/" },
};

export default function Page() {
  return <Client />;
}
