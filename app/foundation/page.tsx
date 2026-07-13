import type { Metadata } from "next";
import Client from "./Client";

export const metadata: Metadata = {
  title: "Foundation Bloodlines — The Sires & Dams of Wagyu",
  description:
    "The founding sires and dams behind every Wagyu pedigree — photographed and documented, each with genetics for sale, prices, news, and discussion.",
  alternates: { canonical: "/foundation/" },
  openGraph: { title: "Foundation Bloodlines — The Sires & Dams of Wagyu · WagyuTank", url: "/foundation/" },
};

export default function Page() {
  return <Client />;
}
