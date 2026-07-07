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
          {data.following_sellers > 0
            ? "The sellers you follow have no active listings right now."
            : <>You're not following any sellers yet. <Link href="/browse" className="gold">Browse listings</Link> and follow a ranch to build your feed.</>}
        </div>
      )}
    </div>
  );
}
