"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "../lib/api";
import { useLang } from "../lib/i18n";
import { copy, products } from "../lib/tank";
import ListingCard from "../components/ListingCard";
import RoundupCard from "../components/RoundupCard";
import AdSlot from "../components/AdSlot";

export default function Home() {
  const router = useRouter();
  const { t } = useLang();
  const [q, setQ] = useState("");
  const [listings, setListings] = useState<any[]>([]);
  const [foundation, setFoundation] = useState<any[]>([]);
  const [roundup, setRoundup] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [news, setNews] = useState<any[]>([]);
  const [theater, setTheater] = useState<any[]>([]);
  useEffect(() => { api.videos({ sort: "views", limit: 4 }).then((d: any) => setTheater(d.videos || [])).catch(() => {}); }, []);
  useEffect(() => {
    Promise.all([api.browse({ limit: 8 }), api.foundation(), api.roundup({ limit: 8 })])
      .then(([ls, fs, rs]) => { setListings(ls); setFoundation(fs.slice(0, 10)); setRoundup(rs); })
      .catch(() => {})
      .finally(() => setLoading(false));
    api.news({ limit: 6 }).then(setNews).catch(() => {});
  }, []);

  return (
    <>
      <section className="hero marble-bg">
        <div className="container">
          <span className="hero-eyebrow">{copy.heroEyebrow || t("hero.eyebrow")}</span>
          <h1>{copy.heroTitle || t("hero.title")}</h1>
          <p className="sub" style={{ marginTop: 14 }}>{copy.heroSub || t("hero.sub")}</p>
          <form
            className="searchbar"
            style={{ marginTop: 26 }}
            onSubmit={(e) => { e.preventDefault(); if (q.trim()) api.track("search", { q: q.trim().toLowerCase() }); router.push(`/browse?q=${encodeURIComponent(q)}`); }}
          >
            <input
              placeholder={copy.searchPlaceholder || t("hero.search")}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <button className="btn btn-gold" type="submit">{t("common.search")}</button>
          </form>
          <div className="row wrap" style={{ marginTop: 18, gap: 10 }}>
            <Link href="/sell" className="btn btn-lg btn-gold">{t("hero.list")}</Link>
            <Link href="/history" className="btn btn-lg btn-ghost">{t("hero.explore")}</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cats">
            {products().map((p: any) => (
              <Link key={p.key} href={`/browse?product_type=${p.key}`} className="cat">
                <div className="glyph">{p.glyph || "🧬"}</div>
                <h3>{p.cardTitle || p.label}</h3>
                <p className="muted">{p.blurb || ""}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Fresh listings</h2>
            <div className="spacer" />
            <Link href="/browse" className="nav-link">View all →</Link>
          </div>
          {loading ? (
            <div className="grid listings-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="card"><div className="lc-media" /><div className="lc-body"><div className="skeleton" style={{ width: "70%" }} /><div className="skeleton" style={{ width: "40%", marginTop: 10 }} /></div></div>
              ))}
            </div>
          ) : listings.length ? (
            <div className="grid listings-grid">
              {listings.map((l) => <ListingCard key={l.id} l={l} />)}
            </div>
          ) : (
            <div className="adslot">No listings yet — <Link href="/sell" className="gold">be the first to list →</Link></div>
          )}
        </div>
      </section>

      {news.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-head">
              <h2><span className="roundup-pill pill">{t("home.wire")}</span></h2>
              <div className="spacer" />
              <Link href="/news" className="nav-link">{t("home.allnews")}</Link>
            </div>
            <p className="muted" style={{ maxWidth: "62ch", marginTop: -10, marginBottom: 20 }}>
              {t("home.wire_sub")}
            </p>
            <div className="stack" style={{ gap: 10 }}>
              {news.map((a) => (
                <a key={a.id} href={api.newsGoUrl(a.id)} target="_blank" rel="noopener noreferrer" className="card card-pad news-item">
                  <div className="row wrap" style={{ gap: 8, marginBottom: 4 }}>
                    <span className="news-region">{({ US: "🇺🇸", AU: "🇦🇺", JP: "🇯🇵", EU: "🇪🇺", SA: "🌎" } as any)[a.region] || "🌍"} {a.region}</span>
                    {a.is_translated && <span className="pill roundup-pill" style={{ fontSize: "0.62rem" }}>🌐 Translated</span>}
                    <span className="faint" style={{ fontSize: "0.74rem" }}>{a.source_name}</span>
                  </div>
                  <div className="news-title" style={{ fontSize: "0.96rem" }}>{a.title}</div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {roundup.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-head">
              <h2><span className="roundup-pill pill">{t("home.roundup")}</span></h2>
              <div className="spacer" />
              <Link href="/roundup" className="nav-link">{t("home.allweb")}</Link>
            </div>
            <p className="muted" style={{ maxWidth: "62ch", marginTop: -10, marginBottom: 20 }}>
              {t("home.roundup_sub")}
            </p>
            <div className="grid listings-grid">
              {roundup.map((l) => <RoundupCard key={l.id} l={l} />)}
            </div>
          </div>
        </section>
      )}

      {theater.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-head">
              <h2><span className="pill" style={{ background: "var(--gold-soft)", color: "var(--gold)", borderColor: "var(--gold)" }}>{copy.theaterTitle || "🎬 The Wagyu Theater"}</span></h2>
              <div className="spacer" />
              <Link href="/videos" className="nav-link">Top 100 →</Link>
            </div>
            <p className="muted" style={{ maxWidth: "62ch", marginTop: -10, marginBottom: 20 }}>
              {copy.theaterIntro || "The world's Wagyu video library — bulls on film, auction recordings, Japan, and how-to. Searchable by registration number."}
            </p>
            <div className="grid video-grid">
              {theater.map((v) => (
                <Link key={v.id} href={`/video?id=${v.id}`} className="card video-card">
                  <div className="video-thumb">
                    {v.thumbnail_url && <img src={v.thumbnail_url} alt={v.title} loading="lazy" />}
                    {v.lang === "ja" && <span className="video-jp">🇯🇵</span>}
                  </div>
                  <div className="lc-body" style={{ padding: "10px 12px 12px" }}>
                    <div className="lc-title" style={{ fontSize: "0.9rem", lineHeight: 1.35 }}>{v.title}</div>
                    <div className="faint" style={{ fontSize: "0.76rem", marginTop: 4 }}>{v.channel}{v.views != null ? ` · ${v.views.toLocaleString()} views` : ""}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container">
          <AdSlot placement="banner" />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>{copy.foundationTitle || "The foundation bulls"}</h2>
            <div className="spacer" />
            <Link href="/foundation" className="nav-link">View all foundation animals →</Link>
          </div>
          <p className="muted" style={{ maxWidth: "60ch", marginTop: -10, marginBottom: 20 }}>
            {copy.foundationIntro || "Every full-blood Wagyu in the West descends from a handful of animals that left Japan before the 1997 export ban. They're all here."}
          </p>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
            {foundation.map((a) => (
              <Link key={a.id} href={`/animal?reg=${encodeURIComponent(a.registration_no || a.name)}`} className="card">
                <div className="lc-media" style={{ aspectRatio: "1/1" }}>
                  {a.photo_url ? (
                    <img src={a.photo_url} alt={a.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span className="glyph">🐂</span>
                  )}
                </div>
                <div className="lc-body">
                  <div className="row" style={{ gap: 6, marginBottom: 6 }}>
                    <span className="pill pill-dim" style={{ fontSize: "0.65rem" }}>{a.bloodline}</span>
                  </div>
                  <div style={{ fontWeight: 700 }}>{a.name}</div>
                  <div className="faint" style={{ fontSize: "0.8rem", marginTop: 3 }}>
                    {a.au_progeny ? `${a.au_progeny.toLocaleString()} AU progeny` : a.breed}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
