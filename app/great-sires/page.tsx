import type { Metadata } from "next";
import Client from "./Client";

export const metadata: Metadata = {
  title: "The Great Sires & Dams of Japan — A Wagyu Encyclopedia",
  description:
    "WagyuTank's reference encyclopedia of the legendary Wagyu sires and dams — Yasufuku, Dai 7 Itozakura, Monjiro, Michifuku, Itoshigenami and more — their bloodlines, records, and place in the pedigrees of the world's herds. Readable in six languages.",
  alternates: { canonical: "/great-sires/" },
  openGraph: { title: "The Great Sires & Dams of Japan · WagyuTank", url: "/great-sires/" },
};

export default function Page() {
  return <Client />;
}
