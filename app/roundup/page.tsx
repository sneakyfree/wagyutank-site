import type { Metadata } from "next";
import { brand, hasFamily } from "../../lib/tank";
import Client from "./Client";

const _breed = brand.breed || "cattle";
const _sale = hasFamily("live") || hasFamily("beef");
const _title = _sale
  ? `The Roundup — Live ${brand.breed || "Wagyu"} Cattle & Beef For Sale From Across the Web`
  : "The Roundup — Wagyu Genetics For Sale From Across the Web";
const _desc = _sale
  ? `Every live ${_breed} cattle and beef listing we can find, gathered in one place — with location and price at a glance. The most complete index of ${_breed} cattle for sale.`
  : `Every ${_breed} genetics listing we can find, gathered in one place — with export eligibility and a live price index. The world's most complete index of ${_breed} genetics for sale.`;

export const metadata: Metadata = {
  title: _title,
  description: _desc,
  alternates: { canonical: "/roundup/" },
  openGraph: { title: `${_title} · ${brand.name}`, url: "/roundup/" },
};

export default function Page() {
  return <Client />;
}
