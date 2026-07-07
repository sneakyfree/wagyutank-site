import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "The WagyuTank Semen Catalog — printed & mailed to breeders worldwide",
  description:
    "A printed catalog of Wagyu semen for sale, mailed to breeders ahead of breeding season — a Northern Hemisphere edition each March and a Southern Hemisphere edition each October. List your semen on WagyuTank to be included.",
  alternates: { canonical: "/catalog/" },
  openGraph: { title: "The WagyuTank Semen Catalog", url: "/catalog/" },
};

export default function Page() {
  return (
    <div className="container section" style={{ maxWidth: 880 }}>
      <span className="pill">📕 Print edition</span>
      <h1 style={{ fontSize: "2.2rem", marginTop: 12 }}>The WagyuTank Semen Catalog</h1>
      <p className="muted" style={{ lineHeight: 1.7, maxWidth: "70ch" }}>
        A real, printed catalog of Wagyu semen for sale — mailed to breeders so it lands on the
        kitchen table right when mating decisions are being made. Two editions a year, timed to
        breeding season on each side of the equator.
      </p>

      <div className="row wrap" style={{ gap: 16, marginTop: 24, alignItems: "stretch" }}>
        <div className="card card-pad" style={{ flex: "1 1 300px" }}>
          <h3 style={{ marginTop: 0 }}>🌎 Northern Hemisphere Edition</h3>
          <p className="muted" style={{ lineHeight: 1.65 }}>
            Most North American and European herds calve in late winter and spring, which puts
            AI season in <b>May through July</b>. The catalog mails in <b>early March</b> so it's
            in hand while sire lists are still open.
          </p>
          <div className="kv"><span className="k">Listing deadline</span><span className="gold"><b>February 1</b></span></div>
          <div className="kv"><span className="k">Mails</span><span>early March</span></div>
        </div>
        <div className="card card-pad" style={{ flex: "1 1 300px" }}>
          <h3 style={{ marginTop: 0 }}>🌏 Southern Hemisphere Edition</h3>
          <p className="muted" style={{ lineHeight: 1.65 }}>
            Australian, New Zealand, and South American spring-calving herds join from
            <b> October through January</b>. The catalog mails in <b>early October</b>, ahead of
            joining.
          </p>
          <div className="kv"><span className="k">Listing deadline</span><span className="gold"><b>September 1</b></span></div>
          <div className="kv"><span className="k">Mails</span><span>early October</span></div>
        </div>
      </div>

      <div className="card card-pad" style={{ marginTop: 24 }}>
        <h3 style={{ marginTop: 0 }}>How to get your semen in the catalog</h3>
        <ol style={{ lineHeight: 2, margin: 0, paddingLeft: 20 }}>
          <li><Link href="/sell" className="gold">List your semen on WagyuTank</Link> — free, about 60 seconds, AI writes the ad copy.</li>
          <li>On your <Link href="/dashboard" className="gold">dashboard</Link>, tap <b>“📕 Add to Semen Catalog”</b> on the listing.</li>
          <li>That's it — every active opted-in listing at the deadline goes to print with your ranch name, the sire's pedigree, price, and export status.</li>
        </ol>
        <p className="help" style={{ marginTop: 12 }}>
          Inclusion is free while WagyuTank is in launch. Deadlines above are for the next print run;
          opt in any time and your listing rides in whichever edition closes next.
        </p>
      </div>

      <div style={{ marginTop: 24 }}>
        <Link href="/sell" className="btn btn-gold btn-lg">List semen → get in the catalog</Link>
      </div>
    </div>
  );
}
