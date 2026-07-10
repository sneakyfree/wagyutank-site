import type { Metadata } from "next";
import Client from "./Client";

export const metadata: Metadata = {
  title: "Wagyu Japan — Learn From the Source, In Your Language",
  description:
    "The world's window into Japanese Wagyu: translated news from Japanese agricultural press, Japanese farm and technique videos, Matsusaka and Kobe champion sale data, the foundation export story, and a glossary of the terms every breeder should know.",
  alternates: { canonical: "/japan/" },
  openGraph: { title: "Wagyu Japan · WagyuTank", url: "/japan/" },
};

export default function Page() {
  return <Client />;
}
