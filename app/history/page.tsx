import type { Metadata } from "next";
import Client from "./Client";

export const metadata: Metadata = {
  title: "The World's Deepest Wagyu Breed History",
  description:
    "From draft animal to the world's most coveted beef: the definitive history of the Wagyu breed — the Tajima, Fujiyoshi and Kedaka strains, the 1976 and 1990s imports, Akaushi's arrival, and the foundation sires and dams behind every fullblood pedigree.",
  alternates: { canonical: "/history/" },
  openGraph: { title: "The World's Deepest Wagyu Breed History · WagyuTank", url: "/history/" },
};

export default function Page() {
  return <Client />;
}
