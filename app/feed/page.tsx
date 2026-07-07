"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import ListingCard from "../../components/ListingCard";

export default function Feed() {
  const { user, loading } = useAuth();
  const [data, setData] = useState<any>(null);

  useEffect(() => { if (user) api.feed().then(setData).catch(() => setData({ following_sellers: 0, listings: [] })); }, [user]);

  if (loading) return <div className="container section">Loading…</div>;
  if (!user) return <div className="container section"><h1>Your feed</h1><p className="muted">Please <Link href="/login" className="gold">sign in</Link> to see listings from the sellers you follow.</p></div>;

  return (
    <div className="container section">
      <h1 style={{ fontSize: "2rem" }}>Your feed</h1>
      <p className="muted">The latest listings from the ranches you follow.</p>
      {!data ? (
        <div className="muted" style={{ marginTop: 20 }}>Loading…</div>
      ) : data.listings.length ? (
        <div className="grid listings-grid" style={{ marginTop: 20 }}>
          {data.listings.map((l: any) => <ListingCard key={l.id} l={l} />)}
        </div>
      ) : (
        <div className="adslot" style={{ marginTop: 20 }}>
          {(data.following?.sellers || data.following?.bloodlines || data.following?.animals)
            ? "Nothing new from what you follow right now — check back soon."
            : <>You're not following anything yet. Follow a <Link href="/browse" className="gold">ranch</Link>, a <Link href="/foundation" className="gold">bloodline</Link>, or a foundation sire to build your feed.</>}
        </div>
      )}
    </div>
  );
}
