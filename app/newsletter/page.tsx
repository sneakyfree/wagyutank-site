import type { Metadata } from "next";
import Client from "./Client";

export const metadata: Metadata = {
  title: "The State of the Wagyu Weekly — the world Wagyu newsletter",
  description:
    "A free weekly newsletter: the most important Wagyu news from Japan, Australia, the Americas and Europe, plus the genetics price index, new listings and record sales — delivered in your language.",
  alternates: { canonical: "https://www.wagyutank.com/newsletter/" },
  openGraph: {
    title: "The State of the Wagyu Weekly",
    description: "World Wagyu news, the genetics price index and record sales — every Monday, in your language.",
    url: "https://www.wagyutank.com/newsletter/",
  },
};

export default function Page() { return <Client />; }
