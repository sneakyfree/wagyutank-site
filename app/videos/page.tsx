import type { Metadata } from "next";
import Client from "./Client";

export const metadata: Metadata = {
  title: "The Wagyu Theater — Every Wagyu Video, One Place",
  description:
    "The world's Wagyu video library: foundation bulls and their sons on film, auction recordings, Japanese farm and technique videos, ranch tours, and how-to guides — organized, searchable by registration number, and ranked in the Wagyu Top 100.",
  alternates: { canonical: "/videos/" },
  openGraph: { title: "The Wagyu Theater · WagyuTank", url: "/videos/" },
};

export default function Page() {
  return <Client />;
}
