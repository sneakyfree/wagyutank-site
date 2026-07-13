// Cross-site flywheel chip: on tanks with sister sites (tank config `network.peers`),
// link an animal's registration straight to the same animal on the peer site —
// e.g. a live bull on WagyuSale → his frozen genetics on WagyuTank, and back.
// Renders nothing on standalone tanks (no peers) or when there's no registration,
// so genetics-only builds are untouched. No hooks — safe in server components.
import { networkPeers } from "../lib/tank";

export default function PeerLink({ reg, style }: { reg?: string | null; style?: React.CSSProperties }) {
  const peers = networkPeers();
  const r = (reg || "").trim();
  if (!peers.length || !r) return null;
  return (
    <span className="row wrap" style={{ gap: 6, display: "inline-flex", ...style }}>
      {peers.map((p) => (
        <a
          key={p.domain}
          className="pill"
          style={{ cursor: "pointer", textDecoration: "none" }}
          href={`https://www.${p.domain}/animal?reg=${encodeURIComponent(r)}`}
          target="_blank"
          rel="noopener"
          title={`View ${r} on ${p.name || p.domain}`}
        >
          → {p.cta || `View on ${p.name || p.domain}`}
        </a>
      ))}
    </span>
  );
}
