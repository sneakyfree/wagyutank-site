"use client";
// Header cross-site buttons (the flywheel): one per sister tank in the config's
// network.peers — e.g. "Live cattle ↗" on WagyuTank, "Frozen genetics ↗" on
// WagyuSale. Signed-in users hop with a 90s SSO token (no re-registering);
// signed-out users get a plain link. Renders nothing on standalone tanks.
import { useState } from "react";
import { api } from "../lib/api";
import { networkPeers } from "../lib/tank";
import { useAuth } from "../lib/auth";

export default function PeerHop() {
  const { user } = useAuth();
  const peers = networkPeers();
  const [busy, setBusy] = useState("");
  if (!peers.length) return null;

  async function hop(domain: string) {
    const plain = `https://www.${domain}`;
    if (!user) { window.location.href = plain; return; }
    setBusy(domain);
    try {
      const res = await api.ssoMint();
      // The mint endpoint pins the token to the configured peer — prefer its
      // peer_web, falling back to the chip's domain.
      const base = String(res.peer_web || plain).replace(/\/+$/, "");
      window.location.href = `${base}/sso#token=${encodeURIComponent(res.token)}`;
    } catch {
      window.location.href = plain; // SSO down ≠ dead button — still get them there
    } finally {
      setBusy("");
    }
  }

  return (
    <>
      {peers.map((p) => (
        <button
          key={p.domain}
          className="btn btn-ghost"
          disabled={busy === p.domain}
          onClick={() => hop(p.domain)}
          title={user ? `Continue on ${p.name || p.domain} — you'll stay signed in` : `Visit ${p.name || p.domain}`}
        >
          {busy === p.domain ? "…" : p.cta || `${p.name || p.domain} ↗`}
        </button>
      ))}
    </>
  );
}
