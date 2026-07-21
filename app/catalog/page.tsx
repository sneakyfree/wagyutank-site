import type { Metadata } from "next";
import Client from "./Client";
import FeatureGate from "../../components/FeatureGate";

export const metadata: Metadata = {
  title: "The WagyuTank Semen Catalog — printed & mailed to breeders worldwide",
  description:
    "A printed catalog of Wagyu semen and genetics, mailed to breeders ahead of breeding season — a Spring-Calving Program edition (submissions close 1 February, mails in March) and a Fall-Calving Program edition (submissions close 1 September, mails in October). List your bull, semen, or ranch to be included; every member gets an e-copy.",
  alternates: { canonical: "/catalog/" },
  openGraph: { title: "The WagyuTank Semen Catalog", url: "/catalog/" },
};

export default function Page() {
  return <FeatureGate feature="catalog"><Client /></FeatureGate>;
}
