"use client";
import Link from "next/link";
import { useAuth } from "../lib/auth";
import { useLang } from "../lib/i18n";
import Logo from "./Logo";

export default function Header() {
  const { user, logout, loading } = useAuth();
  const { lang, setLang, t } = useLang();
  const links = (
    <>
      <Link href="/browse" className="nav-link">{t("nav.browse")}</Link>
      <Link href="/browse?product_type=semen" className="nav-link">{t("nav.semen")}</Link>
      <Link href="/browse?product_type=embryo" className="nav-link">{t("nav.embryos")}</Link>
      <Link href="/browse?product_type=clone_rights" className="nav-link">{t("nav.cloning")}</Link>
      <Link href="/roundup" className="nav-link">{t("nav.roundup")}</Link>
      <Link href="/news" className="nav-link">{t("nav.news")}</Link>
      <Link href="/history" className="nav-link">{t("nav.history")}</Link>
      <Link href="/advertise" className="nav-link">{t("nav.advertise")}</Link>
    </>
  );
  const langToggle = (
    <div className="lang-toggle" title="Language / Idioma">
      <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>EN</button>
      <button className={lang === "es" ? "on" : ""} onClick={() => setLang("es")}>ES</button>
    </div>
  );
  return (
    <header className="hdr">
      <div className="container hdr-inner">
        <Link href="/" className="logo" aria-label="WagyuTank home">
          <Logo size={34} />
        </Link>
        <nav className="nav-desktop" style={{ marginLeft: 14 }}>{links}</nav>
        <div className="spacer" />
        {langToggle}
        <Link href="/sell" className="btn btn-gold">{t("nav.sell")}</Link>
        {loading ? null : user ? (
          <div className="row" style={{ gap: 10 }}>
            {user.role === "admin" && <Link href="/admin" className="nav-link hide-sm" title="Control panel">{t("nav.admin")}</Link>}
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
      <nav className="nav-mobile">{links}</nav>
    </header>
  );
}
