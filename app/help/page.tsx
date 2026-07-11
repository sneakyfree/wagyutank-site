import type { Metadata } from "next";
import Client from "./Client";

export const metadata: Metadata = {
  title: "Help & FAQ — Questions, Answers & a Wagyu Help Assistant",
  description:
    "Answers to common questions about WagyuTank, buying and selling Wagyu and Akaushi genetics (semen, embryos, cloning rights), CSS export eligibility, and the breed itself — plus a help assistant that can answer anything else, in your language.",
  alternates: { canonical: "/help/" },
  openGraph: { title: "Help & FAQ · WagyuTank", url: "/help/" },
};

export default function Page() {
  return <Client />;
}
