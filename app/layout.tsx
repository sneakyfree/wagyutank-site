import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "../lib/auth";
import { LangProvider } from "../lib/i18n";
import Header from "../components/Header";
import Tracker from "../components/Tracker";
import Tickers from "../components/Tickers";

const DESC =
  "Buy and sell frozen Wagyu genetics — semen, embryos, and cloning rights — and explore the world's deepest Wagyu breed history, a live genetics price index, translated global news, and market data. Free to list.";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.wagyutank.com"),
  title: {
    default: "WagyuTank — The Global Marketplace & Knowledge Hub for Wagyu Genetics",
    template: "%s · WagyuTank",
  },
  description: DESC,
  keywords: ["Wagyu", "Akaushi", "Wagyu semen", "Wagyu embryos", "Wagyu genetics",
    "fullblood Wagyu", "Tajima", "Michifuku", "Wagyu marketplace", "Wagyu bloodlines"],
  icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }] },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website", siteName: "WagyuTank", url: "https://www.wagyutank.com",
    title: "WagyuTank — The Global Marketplace & Knowledge Hub for Wagyu Genetics",
    description: DESC, images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "WagyuTank" }],
  },
  twitter: {
    card: "summary_large_image", title: "WagyuTank — Wagyu Genetics Marketplace & Knowledge Hub",
    description: DESC, images: ["/og-image.png"],
  },
};

const JSONLD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization", "@id": "https://www.wagyutank.com/#org", name: "WagyuTank",
      url: "https://www.wagyutank.com", logo: "https://www.wagyutank.com/favicon.svg",
      description: DESC,
    },
    {
      "@type": "WebSite", "@id": "https://www.wagyutank.com/#site",
      url: "https://www.wagyutank.com", name: "WagyuTank", publisher: { "@id": "https://www.wagyutank.com/#org" },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: "https://www.wagyutank.com/browse?q={query}" },
        "query-input": "required name=query",
      },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD) }} />
        <AuthProvider>
          <LangProvider>
          <Tracker />
          <Header />
          <Tickers />
          <main>{children}</main>
          <footer className="footer">
            <div className="container row wrap">
              <div>
                <strong className="gold">WagyuTank.com</strong> — the world's marketplace for frozen Wagyu genetics.
              </div>
              <div className="spacer" />
              <div className="row wrap faint" style={{ gap: 18 }}>
                <a href="/browse">Browse</a>
                <a href="/news">News</a>
                <a href="/market">Market</a>
                <a href="/sales">Record Sales</a>
                <a href="/history">Breed History</a>
                <a href="/sell">Sell</a>
              </div>
            </div>
          </footer>
          </LangProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
