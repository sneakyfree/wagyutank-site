import type { Metadata } from "next";
import Client from "./Client";

export const metadata: Metadata = {
  title: "The WagyuTank Semen Catalog — printed & mailed to breeders worldwide",
  description:
    "A printed catalog of Wagyu semen and genetics, mailed to breeders ahead of breeding season — a Northern Hemisphere edition each spring and a Southern Hemisphere edition each fall. List your bull, semen, or ranch to be included; every member gets an e-copy.",
  alternates: { canonical: "/catalog/" },
  openGraph: { title: "The WagyuTank Semen Catalog", url: "/catalog/" },
};

export default function Page() {
  return <Client />;
}
