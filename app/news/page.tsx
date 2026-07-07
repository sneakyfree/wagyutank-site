import type { Metadata } from "next";
import Client from "./Client";

export const metadata: Metadata = {
  title: "Wagyu News — Global Headlines & Translated Japanese Reporting",
  description:
    "The latest Wagyu news from the US, Australia, Europe, and South America — plus Japanese Wagyu reporting translated into English, found nowhere else. Read what the breeders who built the breed are actually saying.",
  alternates: { canonical: "/news/" },
  openGraph: { title: "Wagyu News — Global Headlines & Translated Japanese Reporting · WagyuTank", url: "/news/" },
};

export default function Page() {
  return <Client />;
}
