"use client";
import Link from "next/link";
import { useAuth } from "../lib/auth";
import { useLang } from "../lib/i18n";
import Logo from "./Logo";
import NavDropdown from "./NavDropdown";
import LanguageSwitcher from "./Languageswitcher";

export default function Header() {
  const { user, logout, loading } = useAuth();
  const { t } = useLang();
  // Desktop: grouped dropdowns keep the bar clean as the site grows.
  const desktopNav = (
    <>
      <NavDropdown label={t("nav.browse")} items={[
        { href: "/browse", label: t("nav.browseall"), desc: t("nav.browse_all_desc") },
        { href: "/browse?product_type=semen", label: t("nav.semen"), desc: t("nav.semen_desc") },
        { href: "/browse?product_type=embryo", label: t("nav.embryos"), desc: t("nav.embryos_desc") },
        { href: "/browse?product_type=clone_rights", label: t("nav.cloning"), desc: t("nav.cloning_desc") },
        { href: "/foundation", label: t("nav.foundation"), desc: t("nav.foundation_desc") },
      ]} />
      <Link href="/roundup" className="nav-link">{t("nav.roundup")}</Link>
      <Link href="/news" className="nav-link">{t("nav.news")}</Link>
      <NavDropdown label={t("nav.data")} items={[
        { href: "/market", label: t("nav.marketdata"), desc: t("nav.marketdata_desc") },
        { href: "/sale-reports", label: t("nav.salereports"), desc: t("nav.salereports_desc") },
        { href: "/sales", label: t("nav.records"), desc: t("nav.records_desc") },
      ]} />
      <Link href="/history" className="nav-link">{t("nav.history")}</Link>
      <Link href="/advertise" className="nav-link">{t("nav.advertise")}</Link>
    </>
  );
  // Mobile: flat scrollable strip (all links).
  const mobileNav = (
    <>
      <Link href="/browse" className="nav-link">{t("nav.browse")}</Link>
      <Link href="/browse?product_type=semen" className="nav-link">{t("nav.semen")}</Link>
      <Link href="/browse?product_type=embryo" className="nav-link">{t("nav.embryos")}</Link>
      <Link href="/browse?product_type=clone_rights" className="nav-link">{t("nav.cloning")}</Link>
      <Link href="/roundup" className="nav-link">{t("nav.roundup")}</Link>
      <Link href="/news" className="nav-link">{t("nav.news")}</Link>
      <Link href="/market" className="nav-link">{t("nav.marketdata")}</Link>
      <Link href="/sale-reports" className="nav-link">{t("nav.salereports")}</Link>
      <Link href="/sales" className="nav-link">{t("nav.records")}</Link>
      <Link href="/history" className="nav-link">{t("nav.history")}</Link>
      <Link href="/advertise" className="nav-link">{t("nav.advertise")}</Link>
    </>
  );
  const langToggle = <LanguageSwitcher />;
  return (
    <header className="hdr">
      <div className="container hdr-inner">
        <Link href="/" className="logo" aria-label="WagyuTank home">
          <Logo size={34} />
        </Link>
        <nav className="nav-desktop" style={{ marginLeft: 14 }}>{desktopNav}</nav>
        <div className="spacer" />
        {langToggle}
        <Link href="/sell" className="btn btn-gold">{t("nav.sell")}</Link>
        {loading ? null : user ? (
          <div className="row" style={{ gap: 10 }}>
            {user.role === "admin" && <Link href="/admin" className="nav-link hide-sm" title="Control panel">{t("nav.admin")}</Link>}
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
      {/* Mobile nav strip — scrollable, only shows below 860px */}
      <nav className="nav-mobile">{mobileNav}</nav>
    </header>
  );
}
