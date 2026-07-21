"use client";
import Link from "next/link";
import { useAuth } from "../lib/auth";
import { useLang } from "../lib/i18n";
import { brand, featureOn, products } from "../lib/tank";
import Logo from "./Logo";
import NavDropdown from "./NavDropdown";
import NavOverflow from "./NavOverflow";
import MobileNav from "./MobileNav";
import LanguageSwitcher from "./Languageswitcher";
import PeerHop from "./PeerHop";

export default function Header() {
  const { user, logout, loading } = useAuth();
  const { t } = useLang();
  // Product sub-links come from this tank's config (a semen-only breed shows just
  // semen). Keep the translated labels for the known types; fall back otherwise.
  const P_LABEL: Record<string, string> = { semen: "nav.semen", embryo: "nav.embryos", clone_rights: "nav.cloning" };
  const P_DESC: Record<string, string> = { semen: "nav.semen_desc", embryo: "nav.embryos_desc", clone_rights: "nav.cloning_desc" };
  const productItems = products().map((p) => ({
    href: `/browse?product_type=${p.key}`,
    label: P_LABEL[p.key] ? t(P_LABEL[p.key]) : p.label,
    desc: P_DESC[p.key] ? t(P_DESC[p.key]) : "",
  }));
  const dataItems = [
    featureOn("market_data") && { href: "/market", label: t("nav.marketdata"), desc: t("nav.marketdata_desc") },
    featureOn("sale_reports") && { href: "/sale-reports", label: t("nav.salereports"), desc: t("nav.salereports_desc") },
    featureOn("sale_reports") && { href: "/sales", label: t("nav.records"), desc: t("nav.records_desc") },
  ].filter(Boolean) as { href: string; label: string; desc: string }[];
  // Desktop: grouped dropdowns keep the bar clean as the site grows.
  const desktopNav = (
    <>
      <NavDropdown label={t("nav.browse")} items={[
        { href: "/browse", label: t("nav.browseall"), desc: t("nav.browse_all_desc") },
        ...productItems,
        ...(featureOn("foundation") ? [{ href: "/foundation", label: t("nav.foundation"), desc: t("nav.foundation_desc") }] : []),
        ...(featureOn("great_sires") ? [{ href: "/great-sires", label: "Great Sires", desc: "The encyclopedia of the breed's most influential bulls and dams" }] : []),
      ]} />
      {featureOn("roundup") && <Link href="/roundup" className="nav-link">{t("nav.roundup")}</Link>}
      {featureOn("directory") && <Link href="/directory" className="nav-link">{t("nav.directory")}</Link>}
      {featureOn("news") && <Link href="/news" className="nav-link">{t("nav.news")}</Link>}
      <Link href="/newsletter" className="nav-link">Newsletter</Link>
      {featureOn("videos") && <Link href="/videos" className="nav-link">{t("nav.videos")}</Link>}
      {featureOn("japan_hub") && <Link href="/japan" className="nav-link">{t("nav.japan")}</Link>}
      {featureOn("feeding") && <Link href="/feeding" className="nav-link">{t("nav.feeding")}</Link>}
      {dataItems.length > 0 && <NavDropdown label={t("nav.data")} items={dataItems} />}
      {featureOn("catalog") && <Link href="/catalog" className="nav-link">{t("nav.catalog")}</Link>}
      {featureOn("history") && <Link href="/history" className="nav-link">{t("nav.history")}</Link>}
      {featureOn("help") && <Link href="/help" className="nav-link">{t("nav.help")}</Link>}
      {featureOn("ads") && <Link href="/advertise" className="nav-link">{t("nav.advertise")}</Link>}
    </>
  );
  // Narrow screens: the same destinations, grouped, behind a labelled button.
  // Grouping matters more here than on desktop -- eighteen undifferentiated
  // links in a column is a list to be endured, not read.
  const mobileSections = [
    {
      title: "Browse",
      links: [
        <Link key="browse" href="/browse" className="nav-sheet-link">{t("nav.browseall")}</Link>,
        ...productItems.map((pr) => (
          <Link key={pr.href} href={pr.href} className="nav-sheet-link">{pr.label}</Link>
        )),
        featureOn("foundation") && <Link key="foundation" href="/foundation" className="nav-sheet-link">{t("nav.foundation")}</Link>,
        featureOn("great_sires") && <Link key="great" href="/great-sires" className="nav-sheet-link">Great Sires</Link>,
      ].filter(Boolean),
    },
    {
      title: "The market",
      links: [
        featureOn("roundup") && <Link key="roundup" href="/roundup" className="nav-sheet-link">{t("nav.roundup")}</Link>,
        featureOn("directory") && <Link key="directory" href="/directory" className="nav-sheet-link">{t("nav.directory")}</Link>,
        featureOn("catalog") && <Link key="catalog" href="/catalog" className="nav-sheet-link">{t("nav.catalog")}</Link>,
        featureOn("market_data") && <Link key="market" href="/market" className="nav-sheet-link">{t("nav.marketdata")}</Link>,
        featureOn("sale_reports") && <Link key="salereports" href="/sale-reports" className="nav-sheet-link">{t("nav.salereports")}</Link>,
        featureOn("sale_reports") && <Link key="sales" href="/sales" className="nav-sheet-link">{t("nav.records")}</Link>,
      ].filter(Boolean),
    },
    {
      title: "Read & watch",
      links: [
        featureOn("news") && <Link key="news" href="/news" className="nav-sheet-link">{t("nav.news")}</Link>,
        <Link key="newsletter" href="/newsletter" className="nav-sheet-link">Newsletter</Link>,
        featureOn("videos") && <Link key="videos" href="/videos" className="nav-sheet-link">{t("nav.videos")}</Link>,
        featureOn("japan_hub") && <Link key="japan" href="/japan" className="nav-sheet-link">{t("nav.japan")}</Link>,
        featureOn("feeding") && <Link key="feeding" href="/feeding" className="nav-sheet-link">{t("nav.feeding")}</Link>,
        featureOn("history") && <Link key="history" href="/history" className="nav-sheet-link">{t("nav.history")}</Link>,
      ].filter(Boolean),
    },
    {
      title: "Your account",
      links: [
        <Link key="sell" href="/sell" className="nav-sheet-link">{t("nav.sell")}</Link>,
        user && <Link key="dashboard" href="/dashboard" className="nav-sheet-link">{user.handle ? `@${user.handle}` : user.display_name}</Link>,
        user && <Link key="feed" href="/feed" className="nav-sheet-link">Feed</Link>,
        user && user.role && ["manager", "admin", "super_admin"].includes(user.role) &&
          <Link key="admin" href="/admin" className="nav-sheet-link">{user.role === "super_admin" ? "Owner" : user.role === "manager" ? "Manager" : t("nav.admin")}</Link>,
        !user && <Link key="login" href="/login" className="nav-sheet-link">{t("nav.signin")}</Link>,
        featureOn("help") && <Link key="help" href="/help" className="nav-sheet-link">{t("nav.help")}</Link>,
        featureOn("ads") && <Link key="ads" href="/advertise" className="nav-sheet-link">{t("nav.advertise")}</Link>,
      ].filter(Boolean),
    },
  ] as { title: string; links: React.ReactNode[] }[];

  const langToggle = <LanguageSwitcher />;
  return (
    <header className="hdr">
      <div className="container hdr-inner">
        <MobileNav sections={mobileSections} />
        <Link href="/" className="logo" aria-label={`${brand.name} home`}>
          <Logo size={34} />
        </Link>
        <nav className="nav-desktop" style={{ marginLeft: 14 }}>
          <NavOverflow>{desktopNav}</NavOverflow>
        </nav>
        <div className="spacer" />
        {langToggle}
        <PeerHop />
        <Link href="/sell" className="btn btn-gold">{t("nav.sell")}</Link>
        {loading ? null : user ? (
          <div className="row" style={{ gap: 10 }}>
            {user.role && ["manager", "admin", "super_admin"].includes(user.role) &&
              <Link href="/admin" className="nav-link hide-sm" title="Control panel">
                {user.role === "super_admin" ? "⚙ Owner" : user.role === "manager" ? "⚙ Manager" : t("nav.admin")}
              </Link>}
            <Link href="/feed" className="nav-link hide-sm" title="Your feed">Feed</Link>
            <Link href="/dashboard" className="nav-link hide-sm">
              {user.handle ? `@${user.handle}` : user.display_name}
            </Link>
            <button className="btn btn-ghost" onClick={logout}>{t("nav.signout")}</button>
          </div>
        ) : (
          <Link href="/login" className="btn btn-ghost">{t("nav.signin")}</Link>
        )}
      </div>
    </header>
  );
}
