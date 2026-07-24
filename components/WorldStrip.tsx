"use client";
// The international storefront sign: every country currently represented in
// the market, as large clickable flag chips. Each chip filters the Roundup to
// that country. Rendered on Browse, Roundup and the homepage so the global
// reach of the platform is impossible to miss.
import { useEffect, useState } from "react";
import Link from "next/link";
import { api, countryFlag } from "../lib/api";
import { countryName } from "./CountryTag";

export default function WorldStrip({ compact = false }: { compact?: boolean }) {
  const [stats, setStats] = useState<any>(null);
  useEffect(() => { api.roundupStats().then(setStats).catch(() => {}); }, []);
  const counts: Record<string, number> = stats?.country_counts || {};
  // Biggest markets first — the most striking snapshot of the platform's reach.
  const countries: string[] = [...(stats?.countries || [])].sort(
    (a, b) => (counts[b] || 0) - (counts[a] || 0) || countryName(a).localeCompare(countryName(b))
  );
  if (!countries.length) return null;
  return (
    <div className="world-strip">
      <div className="world-strip-head">
        <span className="world-strip-globe" aria-hidden>🌍</span>
        <b>One market, the whole Wagyu world</b>
        <span className="faint">
          {" — "}live listings from <b>{countries.length} countries</b>, indexed daily from {stats.sources} seller sites
        </span>
      </div>
      {!compact && (
        <div className="world-strip-flags">
          {countries.map((cc: string) => (
            <Link key={cc} href={`/roundup?country=${encodeURIComponent(cc)}`} className="country-tag country-tag-link" title={`See listings from ${countryName(cc)}`}>
              <span className="country-tag-flag" aria-hidden>{countryFlag(cc)}</span>
              <span className="country-tag-name">{countryName(cc)}</span>
              {counts[cc] ? <span className="country-tag-count">{counts[cc]}</span> : null}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
