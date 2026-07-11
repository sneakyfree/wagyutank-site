"use client";
import { useEffect, useState } from "react";
import { api } from "../lib/api";

/** "These look like yours" — shown on the dashboard when the member's email
 * domain matches Roundup listings we've already indexed from their own website.
 * Pull, not push: appears only to people who chose to sign up. Importing
 * requires a verified email (proof they control an address at that domain). */
export default function ClaimListings({ onImported }: { onImported?: () => void }) {
  const [info, setInfo] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => { api.claimable().then(setInfo).catch(() => {}); }, []);

  if (dismissed || !info || !info.count || done === "") return null;

  async function sendVerify() {
    setBusy(true); setError(null);
    try { const r = await api.sendVerify(); setSent(true); setDone(null); if (!r?.ok) setError(r?.message); }
    catch (e: any) { setError(e?.message); }
    finally { setBusy(false); }
  }

  async function importAll() {
    setBusy(true); setError(null);
    try {
      const r = await api.claimListings();
      setDone(r?.message || `Imported ${r?.created} listing(s).`);
      onImported?.();
    } catch (e: any) { setError(e?.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="card card-pad" style={{ margin: "16px 0", border: "1px solid var(--gold)", background: "var(--bg-elev)" }}>
      {done ? (
        <p style={{ margin: 0 }}>✅ {done}</p>
      ) : (
        <>
          <div className="row" style={{ gap: 10, alignItems: "flex-start" }}>
            <span style={{ fontSize: "1.5rem" }}>📡</span>
            <div style={{ flex: 1 }}>
              <strong>We found {info.count} listing{info.count === 1 ? "" : "s"} that look like yours</strong>
              <p className="muted" style={{ fontSize: "0.88rem", margin: "4px 0 0", lineHeight: 1.6 }}>
                Our web index (the Roundup) includes {info.count} genetics listing{info.count === 1 ? "" : "s"} from{" "}
                <strong>{info.domain}</strong> — the same domain as your email. Import them into your
                store in one click; you can edit prices and details afterward.
              </p>
              {(info.listings || []).length > 0 && (
                <p className="faint" style={{ fontSize: "0.76rem", margin: "6px 0 0" }}>
                  e.g. {info.listings.slice(0, 3).map((l: any) => l.title).join(" · ")}
                </p>
              )}
            </div>
          </div>
          <div className="row wrap" style={{ gap: 8, marginTop: 12 }}>
            {info.verified ? (
              <button className="btn btn-gold" onClick={importAll} disabled={busy}>
                {busy ? "Importing…" : `Add ${info.count} listing${info.count === 1 ? "" : "s"} to my store`}
              </button>
            ) : sent ? (
              <span className="muted" style={{ fontSize: "0.86rem" }}>
                📬 Verification link sent to your email — click it, then return here to import.
              </span>
            ) : (
              <button className="btn btn-gold" onClick={sendVerify} disabled={busy}>
                {busy ? "Sending…" : "Verify my email to import"}
              </button>
            )}
            <button className="btn btn-ghost" onClick={() => setDismissed(true)} disabled={busy}>Not now</button>
          </div>
          {!info.verified && !sent && (
            <p className="faint" style={{ fontSize: "0.72rem", marginTop: 8, marginBottom: 0 }}>
              We confirm you control an address at {info.domain} before importing — this keeps your
              listings safe from anyone else claiming them.
            </p>
          )}
          {error && <p className="help" style={{ marginTop: 8, color: "#c0392b" }}>{error}</p>}
        </>
      )}
    </div>
  );
}
