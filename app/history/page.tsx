import type { Metadata } from "next";
import Client from "./Client";

export const metadata: Metadata = {
  title: "The World's Deepest Wagyu Breed History",
  description:
    "The definitive history of the Wagyu breed — its origins, its foundation bloodlines, and the sires and dams behind every pedigree.",
  alternates: { canonical: "/history/" },
  openGraph: { title: "The World's Deepest Wagyu Breed History · WagyuTank", url: "/history/" },
};

export default function Page() {
  return <Client />;
}
