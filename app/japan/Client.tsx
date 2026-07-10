"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../../lib/api";
import { VideoCard } from "../videos/Client";

// 🇯🇵 The Japan hub — everything the site knows from the source country, in one
// place: translated news, Japanese videos, champion sale data, the export
// story, and the vocabulary. "Learn Wagyu from Japan, in your language."
const GLOSSARY = [
  { jp: "和牛", romaji: "Wagyu", en: "“Japanese cattle” — the umbrella term. Japanese Black and Akaushi are distinct breeds beneath it." },
  { jp: "黒毛和種", romaji: "Kuroge Washu", en: "Japanese Black — the breed behind ~95% of Wagyu, and all extreme marbling lines." },
  { jp: "褐毛和種", romaji: "Akage / Akaushi", en: "Japanese Brown (Red) — the Kumamoto-line breed; leaner, maternal, famously docile." },
  { jp: "霜降り", romaji: "Shimofuri", en: "“Falling frost” — the intramuscular marbling Wagyu is bred for." },
  { jp: "BMS", romaji: "Beef Marbling Standard", en: "Japan's 1–12 marbling scale; BMS 8+ maps to the top of A5." },
  { jp: "A5", romaji: "A-five", en: "Top yield grade (A) + top quality grade (5) — the pinnacle of the JMGA carcass grade." },
  { jp: "但馬牛", romaji: "Tajima-gyu", en: "The Hyogo strain behind Kobe beef — small-framed, unrivaled marbling. Michifuku and Itoshigenami are Tajima." },
  { jp: "種雄牛", romaji: "Shuyūgyū", en: "A licensed breeding sire — Japan's prefectures test and license bulls before semen is distributed." },
  { jp: "松阪牛", romaji: "Matsusaka-ushi", en: "Virgin-heifer beef from Mie Prefecture — routinely the most expensive cattle sold anywhere on earth." },
  { jp: "枝肉", romaji: "Edaniku", en: "The dressed carcass — what Japan's famous carcass auctions actually price." },
  { jp: "セリ", romaji: "Seri", en: "Auction — calf markets (kōshi seri) set the tone for Japan's entire production chain." },
  { jp: "血統", romaji: "Kettō", en: "Bloodline/pedigree — Tajima, Fujiyoshi (Shimane), Kedaka (Tottori), and Itozakura are the pillars." },
];

const FLAG: Record<string, string> = { JP: "🇯🇵" };

export default function Client() {
  const [videos, setVideos] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);

  useEffect(() => {
    api.videos({ lang: "ja", sort: "views", limit: 8 }).then((d: any) => setVideos(d.videos || [])).catch(() => {});
    api.news({ region: "JP", limit: 6 }).then(setNews).catch(() => {});
    api.saleEvents({ country: "JP", limit: 6 }).then((d: any) =>
      setSales((Array.isArray(d) ? d : d.events || []).slice(0, 6))).catch(() => {});
  }, []);

  return (
    <div className="container section">
      <span className="pill" style={{ background: "rgba(188,64,64,0.12)", color: "#e08585", borderColor: "#a94444" }}>🇯🇵 WAGYU JAPAN</span>
      <h1 style={{ fontSize: "2.3rem", marginTop: 12 }}>Learn from the source — in your language</h1>
      <div className="roundup-banner" style={{ maxWidth: "78ch", marginTop: 14 }}>
        <p className="muted" style={{ margin: 0, lineHeight: 1.7 }}>
          Everything in Wagyu traces back to Japan — the bloodlines, the methods, the standards.
          But the knowledge has always been locked behind the language. This page is the key:
          <strong className="gold"> Japanese agricultural press translated daily, Japanese farm and
          technique videos, and the champion sale data</strong> — the education no breeder outside
          Japan could get until now.
        </p>
      </div>

      {/* Videos from Japan */}
      <div className="section" style={{ paddingBottom: 0 }}>
        <div className="section-head">
          <h2>🎬 Inside Japanese Wagyu — on film</h2>
          <div className="spacer" />
          <Link href="/videos?category=japan" className="nav-link">All Japan videos →</Link>
        </div>
        <p className="muted" style={{ marginTop: -8, marginBottom: 16, fontSize: "0.92rem" }}>
          Sire-raising, calf markets, feeding, and farm life — straight from Japanese channels, titles translated.
        </p>
        {videos.length ? (
          <div className="grid video-grid">{videos.map((v) => <VideoCard key={v.id} v={v} />)}</div>
        ) : <div className="adslot">The Japan reel is loading…</div>}
      </div>

      {/* Translated news */}
      <div className="section" style={{ paddingBottom: 0 }}>
        <div className="section-head">
          <h2>📰 Japan's Wagyu press — translated</h2>
          <div className="spacer" />
          <Link href="/news?region=JP" className="nav-link">All Japan news →</Link>
        </div>
        <div className="stack" style={{ gap: 10 }}>
          {news.map((n: any) => (
            <a key={n.id} href={api.newsGoUrl(n.id)} target="_blank" rel="noopener noreferrer" className="card card-pad news-item">
              <div className="row wrap" style={{ gap: 8, marginBottom: 4 }}>
                <span className="news-region">🇯🇵 JP</span>
                {n.is_translated && <span className="pill roundup-pill" style={{ fontSize: "0.62rem" }}>🌐 Translated</span>}
                <span className="faint" style={{ fontSize: "0.74rem" }}>{n.source_name}</span>
              </div>
              <div className="news-title" style={{ fontSize: "0.98rem" }}>{n.title}</div>
              {n.original_title && <div className="faint news-orig">{n.original_title}</div>}
            </a>
          ))}
          {!news.length && <div className="adslot">Translated Japan headlines arrive with the next crawl.</div>}
        </div>
      </div>

      {/* Sale data + history + glossary */}
      <div className="section" style={{ paddingBottom: 0 }}>
        <div className="row wrap" style={{ gap: 16, alignItems: "stretch" }}>
          <div className="card card-pad" style={{ flex: "1 1 300px" }}>
            <h3 style={{ marginTop: 0 }}>🏆 Japan's champion sales</h3>
            <p className="muted" style={{ fontSize: "0.92rem", lineHeight: 1.6 }}>
              Matsusaka's champion cow auction has topped <strong className="gold">¥50,000,000</strong> —
              the most expensive cattle sold anywhere on earth. Our sale database tracks the champion
              prices year by year.
            </p>
            <Link href="/sale-reports" className="btn" style={{ marginTop: 6 }}>See the Japan sale data →</Link>
            {sales.length > 0 && <p className="faint" style={{ fontSize: "0.8rem", marginTop: 10 }}>{sales.length}+ documented Japanese sales in the database.</p>}
          </div>
          <div className="card card-pad" style={{ flex: "1 1 300px" }}>
            <h3 style={{ marginTop: 0 }}>📜 How Wagyu left Japan</h3>
            <p className="muted" style={{ fontSize: "0.92rem", lineHeight: 1.6 }}>
              Four bulls in 1976. Fewer than 250 animals ever. Every fullblood on earth traces to a
              handful of exports Japan later called a national loss — the full story, with all 103
              foundation animals, lives in our breed history.
            </p>
            <div className="row" style={{ gap: 8, marginTop: 6 }}>
              <Link href="/history" className="btn">The breed history →</Link>
              <Link href="/foundation" className="btn">Foundation registry →</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Glossary */}
      <div className="section">
        <h2 style={{ marginBottom: 6 }}>🗒 The vocabulary — terms every breeder should know</h2>
        <p className="muted" style={{ marginTop: 0, marginBottom: 18, fontSize: "0.92rem" }}>
          Read a Japanese sale report or grading sheet without getting lost.
        </p>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 12 }}>
          {GLOSSARY.map((g) => (
            <div key={g.romaji} className="card card-pad" style={{ padding: "14px 16px" }}>
              <div className="row" style={{ gap: 10, alignItems: "baseline" }}>
                <span style={{ fontSize: "1.2rem", fontWeight: 700 }}>{g.jp}</span>
                <span className="gold" style={{ fontSize: "0.85rem", fontWeight: 600 }}>{g.romaji}</span>
              </div>
              <p className="muted" style={{ fontSize: "0.88rem", margin: "6px 0 0", lineHeight: 1.55 }}>{g.en}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
