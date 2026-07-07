"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";

export default function FollowButton({
  handle, initialFollowing, onChange,
}: { handle: string; initialFollowing: boolean; onChange?: (d: number) => void }) {
  const { user } = useAuth();
  const router = useRouter();
  const [following, setFollowing] = useState(!!initialFollowing);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (!user) { router.push(`/login?next=/u?handle=${handle}`); return; }
    setBusy(true);
    const next = !following;
    setFollowing(next); onChange?.(next ? 1 : -1);
    try {
      if (next) await api.follow("seller", handle);
      else await api.unfollow("seller", handle);
    } catch {
      setFollowing(!next); onChange?.(next ? -1 : 1); // revert on error
    } finally { setBusy(false); }
  }

  return (
    <button className={`btn ${following ? "" : "btn-gold"}`} onClick={toggle} disabled={busy}>
      {following ? "✓ Following" : "+ Follow"}
    </button>
  );
}
