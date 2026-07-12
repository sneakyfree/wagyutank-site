import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "../lib/auth";
import { LangProvider } from "../lib/i18n";
import { brand, featureOn } from "../lib/tank";
import Header from "../components/Header";
import Tracker from "../components/Tracker";
import Tickers from "../components/Tickers";

const NAME = brand.name || "WagyuTank";
const DOMAIN = brand.domain || "wagyutank.com";
const BASE = `https://www.${DOMAIN}`;
const TITLE = (brand as any).titleLong || `${NAME} — Genetics Marketplace & Knowledge Hub`;
const DESC = (brand as any).description ||
  `Buy and sell ${brand.breed || ""} genetics on ${NAME}. Free to list.`;
const KEYWORDS: string[] = (brand as any).keywords || [];

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: { default: TITLE, template: `%s · ${NAME}` },
  description: DESC,
  keywords: KEYWORDS,
  icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }] },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website", siteName: NAME, url: BASE, title: TITLE,
    description: DESC, images: [{ url: "/og-image.png", width: 1200, height: 630, alt: NAME }],
  },
  twitter: {
    card: "summary_large_image", title: TITLE, description: DESC, images: ["/og-image.png"],
  },
};

const JSONLD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization", "@id": `${BASE}/#org`, name: NAME,
      url: BASE, logo: `${BASE}/favicon.svg`, description: DESC,
    },
    {
      "@type": "WebSite", "@id": `${BASE}/#site`,
      url: BASE, name: NAME, publisher: { "@id": `${BASE}/#org` },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${BASE}/browse?q={query}` },
        "query-input": "required name=query",
      },
    },
  ],
};

const COLORS = (brand as any).colors || {};
const THEME_CSS = COLORS.gold
  ? `:root{--gold:${COLORS.gold};${COLORS.goldBright ? `--gold-bright:${COLORS.goldBright};` : ""}${COLORS.goldSoft ? `--gold-soft:${COLORS.goldSoft};` : ""}}`
  : "";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {THEME_CSS && <style dangerouslySetInnerHTML={{ __html: THEME_CSS }} />}
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
                <strong className="gold">{DOMAIN}</strong> — {(brand as any).footerBlurb || "the world's marketplace for frozen genetics"}.
              </div>
              <div className="spacer" />
              <div className="row wrap faint" style={{ gap: 18 }}>
                <a href="/browse">Browse</a>
                {featureOn("directory") && <a href="/directory">Directory</a>}
                {featureOn("news") && <a href="/news">News</a>}
                {featureOn("market_data") && <a href="/market">Market</a>}
                {featureOn("sale_reports") && <a href="/sales">Record Sales</a>}
                {featureOn("catalog") && <a href="/catalog">Semen Catalog</a>}
                {featureOn("history") && <a href="/history">Breed History</a>}
                {featureOn("help") && <a href="/help">Help &amp; FAQ</a>}
                <a href="/sell">Sell</a>
              </div>
            </div>
            <div className="container row wrap faint" style={{ gap: 18, marginTop: 12, fontSize: "0.8rem", opacity: 0.8 }}>
              {brand.contactEmail && <span>Contact: <a href={`mailto:${brand.contactEmail}`}>{brand.contactEmail}</a></span>}
              {(brand as any).location && <span>{(brand as any).location}</span>}
              <span>© {new Date().getFullYear()} {NAME} — a Utah company</span>
            </div>
          </footer>
          </LangProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
