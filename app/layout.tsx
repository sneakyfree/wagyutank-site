import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "../lib/auth";
import { LangProvider } from "../lib/i18n";
import Header from "../components/Header";
import Tracker from "../components/Tracker";
import PriceTicker from "../components/PriceTicker";

export const metadata: Metadata = {
  title: "WagyuTank — The Global Marketplace & Knowledge Hub for Wagyu Genetics",
  description:
    "Buy and sell frozen Wagyu genetics — semen, embryos, and cloning rights — and explore the world's deepest Wagyu breed history, price index, and news. Free to list.",
  icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <LangProvider>
          <Tracker />
          <Header />
          <PriceTicker />
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
