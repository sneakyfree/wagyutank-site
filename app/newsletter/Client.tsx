"use client";
import Link from "next/link";
import NewsletterSignup from "../../components/NewsletterSignup";

export default function Newsletter() {
  return (
    <div className="container section">
      <div style={{ maxWidth: "72ch" }}>
        <span className="pill">📬 Free weekly newsletter</span>
        <h1 style={{ fontSize: "2.4rem", marginTop: 12 }}>The State of the Wagyu Weekly</h1>
        <p className="muted" style={{ fontSize: "1.1rem", lineHeight: 1.7 }}>
          Wagyu is a global breed reported in a dozen languages, and almost nobody
          reads all of them. Every Monday we do that reading for you: the week's
          most important news out of Japan, Australia, the Americas and Europe,
          written up as a single editor's letter — plus where the genetics market
          actually sits, what's newly listed, and the sales that broke records.
        </p>
        <p className="muted" style={{ fontSize: "1.1rem", lineHeight: 1.7 }}>
          <strong className="gold">It arrives in your language.</strong> Choose English,
          Spanish, Portuguese, German, Japanese or Chinese and the letter is written
          for you in that language — the Japanese trade press read by an American
          breeder, the American market read by a Japanese one.
        </p>
      </div>

      <div style={{ maxWidth: 620, marginTop: 26 }}>
        <NewsletterSignup source="newsletter-page" />
      </div>

      <div className="section" style={{ paddingTop: 26 }}>
        <h2 style={{ fontSize: "1.4rem" }}>What's in every edition</h2>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px,1fr))", marginTop: 14 }}>
          {[
            ["🖋", "The editor's letter", "What actually mattered this week, and why — drawn from every headline we tracked, not just the English ones."],
            ["📰", "World news roundup", "The top stories by region, with the Japanese and Portuguese trade press translated."],
            ["📈", "Market pulse", "The Wagyu genetics price index and the beef market side by side."],
            ["🧬", "Fresh on the marketplace", "The newest semen, embryo and cloning-rights listings."],
            ["🏆", "From the record books", "The sales that set new marks, anywhere in the world."],
          ].map(([icon, title, body]) => (
            <div key={title} className="card card-pad">
              <div style={{ fontSize: "1.5rem" }}>{icon}</div>
              <div className="lc-title" style={{ marginTop: 6 }}>{title}</div>
              <p className="faint" style={{ margin: "6px 0 0", lineHeight: 1.6 }}>{body}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="muted" style={{ marginTop: 24 }}>
        Prefer to browse? The same reporting lives on{" "}
        <Link href="/news" className="gold">Wagyu Wire</Link>, and the market data behind it on{" "}
        <Link href="/market" className="gold">Market Data</Link>.
      </p>
    </div>
  );
}
