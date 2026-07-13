import type { Metadata } from "next";
import Client from "./Client";

export const metadata: Metadata = {
  title: "The Biggest Wagyu Sales Ever — Hall of Records",
  description:
    "The record-setting Wagyu sales that made headlines — every figure sourced. See how far the world will go for elite Wagyu genetics.",
  alternates: { canonical: "/sales/" },
  openGraph: { title: "The Biggest Wagyu Sales Ever — Hall of Records · WagyuTank", url: "/sales/" },
};

export default function Page() {
  return <Client />;
}
