"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";

// Generic follow toggle for a seller, bloodline, or animal.
export default function FollowButton({
  targetType, targetKey, label, initialFollowing, small, onChange,
}: {
  targetType: "seller" | "bloodline" | "animal";
  targetKey: string;
  label?: string;
  initialFollowing?: boolean;
  small?: boolean;
  onChange?: (d: number) => void;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [following, setFollowing] = useState(!!initialFollowing);
  const [busy, setBusy] = useState(false);

  // When we don't already know the state, check the user's follow list once.
  useEffect(() => {
    if (initialFollowing !== undefined || !user) return;
    api.following?.().then((rows: any[]) => {
      setFollowing(rows.some((r) => r.target_type === targetType && r.target_key === targetKey));
    }).catch(() => {});
  }, [user, targetType, targetKey, initialFollowing]);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    if (!user) { router.push("/login"); return; }
    setBusy(true);
    const next = !following;
    setFollowing(next); onChange?.(next ? 1 : -1);
    try {
      if (next) await api.follow(targetType, targetKey);
      else await api.unfollow(targetType, targetKey);
    } catch { setFollowing(!next); onChange?.(next ? -1 : 1); }
    finally { setBusy(false); }
  }

  const base = label || (targetType === "seller" ? "" : "Follow");
  return (
    <button className={`btn ${small ? "btn-sm" : ""} ${following ? "" : "btn-gold"}`} onClick={toggle} disabled={busy}>
      {following ? `✓ Following${base && targetType !== "seller" ? "" : ""}` : `+ ${base || "Follow"}`}
    </button>
  );
}
