"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "../../lib/api";
import ListingCard from "../../components/ListingCard";
import FollowButton from "../../components/FollowButton";

function Stars({ score, count, label }: { score: number; count: number; label: string }) {
  if (!count) return <span className="faint" style={{ fontSize: "0.82rem" }}>No {label} ratings yet</span>;
  const full = Math.round(score);
  return (
    <span className="faint" style={{ fontSize: "0.86rem" }}>
      <span className="stars" style={{ color: "var(--gold)" }}>{"★".repeat(full)}{"☆".repeat(5 - full)}</span>{" "}
      {score.toFixed(1)} · {count} {label}
    </span>
  );
}

function StorefrontView() {
  const handle = useSearchParams().get("handle") || "";
  const [data, setData] = useState<any>(null);
  const [followers, setFollowers] = useState(0);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    if (!handle) { setData(false); return; }
    api.storefront(handle).then((d: any) => { setData(d); setFollowers(d.follower_count || 0); }).catch(() => setData(false));
    api.userReviews(handle).then(setReviews).catch(() => {});
  }, [handle]);

  if (data === false) return <div className="container section">Storefront not found.</div>;
  if (!data) return <div className="container section">Loading…</div>;
  const s = data.seller;

  return (
    <div>
      {s.banner_url && <div className="profile-banner" style={{ backgroundImage: `url(${s.banner_url})` }} />}
      <div className="container section" style={{ paddingTop: s.banner_url ? 0 : undefined }}>
        <div className="row wrap" style={{ gap: 16, alignItems: "flex-start", marginTop: s.banner_url ? -40 : 0 }}>
          {s.avatar_url
            ? <img src={s.avatar_url} alt={s.display_name} className="avatar avatar-lg" style={{ objectFit: "cover" }} />
            : <div className="avatar avatar-lg">{(s.display_name || "?")[0].toUpperCase()}</div>}
          <div style={{ flex: 1, minWidth: 220 }}>
            <h1 style={{ fontSize: "1.9rem", marginBottom: 2 }}>{s.display_name}</h1>
            <div className="muted" style={{ fontSize: "0.95rem" }}>
              {s.handle && <span>@{s.handle}</span>}
              {s.location && <span> · {s.location}</span>}
              {data.member_since && <span> · Member since {data.member_since}</span>}
            </div>
            <div className="row wrap" style={{ gap: 16, marginTop: 8 }}>
              <Stars score={s.seller_rating} count={s.seller_rating_count} label="seller" />
              <Stars score={s.buyer_rating} count={s.buyer_rating_count} label="buyer" />
              <span className="faint" style={{ fontSize: "0.86rem" }}><strong style={{ color: "var(--text)" }}>{followers}</strong> follower{followers === 1 ? "" : "s"}</span>
            </div>
          </div>
          {s.handle && <FollowButton targetType="seller" targetKey={s.handle} initialFollowing={data.is_following} onChange={(d) => setFollowers((f) => f + d)} />}
        </div>

        {s.bio && <p className="muted" style={{ marginTop: 18, maxWidth: "70ch", lineHeight: 1.7 }}>{s.bio}</p>}

        <div className="section-head" style={{ marginTop: 30 }}>
          <h2>{data.listing_count} listing{data.listing_count === 1 ? "" : "s"}</h2>
        </div>
        {data.listings.length ? (
          <div className="grid listings-grid">{data.listings.map((l: any) => <ListingCard key={l.id} l={l} />)}</div>
        ) : (
          <div className="adslot">No active listings.</div>
        )}

        {reviews.length > 0 && (
          <>
            <div className="section-head" style={{ marginTop: 34 }}><h2>Reviews</h2></div>
            <div className="stack" style={{ gap: 10 }}>
              {reviews.map((r: any, i: number) => (
                <div key={i} className="card card-pad">
                  <div className="row" style={{ gap: 8 }}>
                    <span className="stars" style={{ color: "var(--gold)" }}>{"★".repeat(r.score)}{"☆".repeat(5 - r.score)}</span>
                    <span className="faint" style={{ fontSize: "0.82rem" }}>as {r.role} · from @{r.rater}</span>
                  </div>
                  {r.comment && <p className="muted" style={{ margin: "6px 0 0", fontSize: "0.92rem" }}>{r.comment}</p>}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Storefront() {
  return <Suspense fallback={<div className="container section">Loading…</div>}><StorefrontView /></Suspense>;
}
