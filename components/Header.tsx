"use client";
import Link from "next/link";
import { useAuth } from "../lib/auth";
import Logo from "./Logo";

export default function Header() {
  const { user, logout, loading } = useAuth();
  return (
    <header className="hdr">
      <div className="container hdr-inner">
        <Link href="/" className="logo" aria-label="WagyuTank home">
          <Logo size={34} />
        </Link>
        <nav className="nav-desktop" style={{ marginLeft: 14 }}>
          <Link href="/browse" className="nav-link">Browse</Link>
          <Link href="/browse?product_type=semen" className="nav-link">Semen</Link>
          <Link href="/browse?product_type=embryo" className="nav-link">Embryos</Link>
          <Link href="/browse?product_type=clone_rights" className="nav-link">Cloning</Link>
          <Link href="/roundup" className="nav-link">Roundup</Link>
          <Link href="/news" className="nav-link">News</Link>
          <Link href="/history" className="nav-link">Breed History</Link>
          <Link href="/advertise" className="nav-link">Advertise</Link>
        </nav>
        <div className="spacer" />
        <Link href="/sell" className="btn btn-gold">+ Sell</Link>
        {loading ? null : user ? (
          <div className="row" style={{ gap: 10 }}>
            {user.role === "admin" && <Link href="/admin" className="nav-link hide-sm" title="Control panel">⚙ Admin</Link>}
            <Link href="/dashboard" className="nav-link hide-sm">
              {user.handle ? `@${user.handle}` : user.display_name}
            </Link>
            <button className="btn btn-ghost" onClick={logout}>Sign out</button>
          </div>
        ) : (
          <Link href="/login" className="btn btn-ghost">Sign in</Link>
        )}
      </div>
      {/* Mobile nav strip — scrollable, only shows below 860px */}
      <nav className="nav-mobile">
        <Link href="/browse" className="nav-link">Browse</Link>
        <Link href="/browse?product_type=semen" className="nav-link">Semen</Link>
        <Link href="/browse?product_type=embryo" className="nav-link">Embryos</Link>
        <Link href="/browse?product_type=clone_rights" className="nav-link">Cloning</Link>
        <Link href="/roundup" className="nav-link">Roundup</Link>
        <Link href="/news" className="nav-link">News</Link>
        <Link href="/history" className="nav-link">Breed History</Link>
        <Link href="/advertise" className="nav-link">Advertise</Link>
      </nav>
    </header>
  );
}
