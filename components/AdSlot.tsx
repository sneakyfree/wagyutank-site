"use client";
import { useEffect, useState } from "react";
import { api } from "../lib/api";

// A rotating ad placement. `placement`: "feed" | "sidebar" | "banner".
export default function AdSlot({ placement = "feed", className = "" }: { placement?: string; className?: string }) {
  const [ad, setAd] = useState<any>(null);

  useEffect(() => {
    let alive = true;
    api.ads(placement).then((ads: any[]) => {
      if (!alive || !ads?.length) return;
      const pick = ads[Math.floor(Math.random() * ads.length)];
      setAd(pick);
      api.adImpression(pick.id);
    }).catch(() => {});
    return () => { alive = false; };
  }, [placement]);

  if (!ad) return null;
  const href = api.adGoUrl(ad.id);
  const sponsor = ad.is_house ? "WagyuTank" : `Sponsored · ${ad.advertiser_name}`;

  if (placement === "banner") {
    return (
      <a href={href} target={ad.is_house ? "_self" : "_blank"} rel="noopener noreferrer"
         className={`ad-banner ${className}`}>
        {ad.image_url && <img src={ad.image_url} alt="" className="ad-banner-img" />}
        <div className="ad-banner-body">
          <span className="ad-tag">{sponsor}</span>
          <div className="ad-banner-headline">{ad.headline}</div>
          {ad.body && <p className="ad-banner-text">{ad.body}</p>}
        </div>
        <span className="btn btn-gold ad-banner-cta">{ad.cta} →</span>
      </a>
    );
  }

  // feed + sidebar share a card look
  return (
    <a href={href} target={ad.is_house ? "_self" : "_blank"} rel="noopener noreferrer"
       className={`card ad-card ${className}`}>
      {ad.image_url && <div className="ad-card-media"><img src={ad.image_url} alt="" /></div>}
      <div className="lc-body">
        <span className="ad-tag">{sponsor}</span>
        <div className="lc-title" style={{ marginTop: 6 }}>{ad.headline}</div>
        {ad.body && <p className="faint" style={{ fontSize: "0.82rem", margin: "6px 0 12px", lineHeight: 1.5 }}>{ad.body}</p>}
        <span className="btn btn-block">{ad.cta} →</span>
      </div>
    </a>
  );
}
