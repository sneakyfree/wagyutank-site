"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../../lib/api";

function useCountdown(target: string) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);
  if (now == null) return null;
  const diff = new Date(target + "T09:00:00+09:00").getTime() - now;
  if (diff <= 0) return { days: 0, months: 0 };
  const days = Math.floor(diff / 86400000);
  return { days, months: Math.floor(days / 30.44) };
}

export default function Client() {
  const [d, setD] = useState<any>(null);
  const [form, setForm] = useState<any>({ party_size: 1 });
  const [sent, setSent] = useState("");
  const [busy, setBusy] = useState(false);
  const cd = useCountdown("2027-08-26");

  useEffect(() => { api.zenkyo().then(setD).catch(() => setD(false)); }, []);

  async function register() {
    if (!form.email) return;
    setBusy(true);
    try { const r = await api.zenkyoInterest(form); setSent(r.message); }
    catch (e: any) { setSent(e.message); } finally { setBusy(false); }
  }

  if (d === false) return <div className="container section"><h1>The Zenkyo</h1><p className="muted">Loading…</p></div>;
  if (!d) return <div className="container section">Loading the record books…</div>;

  const events = [...(d.events || [])].sort((a, b) => b.year - a.year);
  const champs = d.champions || [];

  return (
    <div className="container section">
      {/* Hero */}
      <span className="pill" style={{ background: "rgba(188,64,64,0.12)", color: "#e08585", borderColor: "#a94444" }}>🏆 全国和牛能力共進会</span>
      <h1 className="display" style={{ fontSize: "2.5rem", marginTop: 12, letterSpacing: "-0.01em" }}>The Zenkyo — Japan's Wagyu Olympics</h1>
      <div className="roundup-banner" style={{ maxWidth: "80ch", marginTop: 14 }}>
        <p className="muted" style={{ margin: 0, lineHeight: 1.75 }}>
          Once every five years since 1966, all of Japan gathers to decide the finest Wagyu in the
          nation — prefecture against prefecture, the carcass data laid bare, the breeding sires
          judged against each other. It is the <strong className="gold">gold medal of the Wagyu
          world</strong>, and the bulls who won it — or sired those who did — stand in the pedigrees
          of nearly every fullblood animal on earth.
        </p>
      </div>

      {/* Countdown to Hokkaido 2027 */}
      <div className="card card-pad" style={{ borderColor: "var(--gold)", marginTop: 22, background: "linear-gradient(160deg, var(--bg-card), var(--bg-elev))" }}>
        <div className="row wrap" style={{ alignItems: "center", gap: 16 }}>
          <div>
            <div className="faint" style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>The next Wagyu Olympics · 13th Zenkyo</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, marginTop: 2 }}>🇯🇵 Hokkaido 2027</div>
            <div className="muted" style={{ marginTop: 2 }}>August 26–30, 2027 · Otofuke &amp; Obihiro (Tokachi) · Hokkaido's first time hosting</div>
          </div>
          <div className="spacer" />
          {cd && (
            <div style={{ textAlign: "center" }}>
              <div className="gold" style={{ fontSize: "2.6rem", fontWeight: 800, lineHeight: 1 }}>{cd.days.toLocaleString()}</div>
              <div className="faint" style={{ fontSize: "0.78rem" }}>days to go</div>
            </div>
          )}
        </div>
      </div>

      {/* Event timeline — the champions of every Zenkyo, clickable into scrapbooks */}
      <div className="section" style={{ paddingBottom: 0 }}>
        <h2 style={{ fontSize: "1.5rem" }}>🥇 Every Zenkyo &amp; its champions</h2>
        <p className="muted" style={{ marginTop: 0, marginBottom: 16, maxWidth: "74ch" }}>
          Prefectures compete like national teams, in two divisions — <strong>breeding cattle</strong> (種牛)
          and <strong>meat</strong> (肉牛). Tap any event for its scrapbook: the winners, the story, and photos.
        </p>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 14 }}>
          {events.map((e: any) => (
            <Link key={e.number} href={`/zenkyo/event?n=${e.number}`} className="card card-pad zenkyo-tile" style={e.year === 2027 ? { borderColor: "var(--gold)" } : {}}>
              <div className="row" style={{ gap: 10, alignItems: "baseline" }}>
                <div className="gold display" style={{ fontSize: "1.6rem", fontWeight: 700, lineHeight: 1 }}>{e.number}<span style={{ fontSize: "0.85rem" }}>{["th","st","nd","rd"][(e.number % 10 > 3 || [11,12,13].includes(e.number)) ? 0 : e.number % 10] || "th"}</span></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{e.year} · 🇯🇵 {e.host_prefecture}</div>
                  <div className="faint" style={{ fontSize: "0.78rem" }}>{e.dates}</div>
                </div>
                {e.year === 2027 && <span className="pill" style={{ fontSize: "0.58rem" }}>UPCOMING</span>}
              </div>
              {(e.breeding_winner || e.meat_winner) ? (
                <div style={{ marginTop: 8, fontSize: "0.82rem" }}>
                  {e.breeding_winner && <div>🐂 Breeding: <span className="gold" style={{ fontWeight: 600 }}>{e.breeding_winner}</span></div>}
                  {e.meat_winner && <div>🥩 Meat: <span className="gold" style={{ fontWeight: 600 }}>{e.meat_winner}</span></div>}
                </div>
              ) : e.year === 2027 ? (
                <div className="muted" style={{ marginTop: 8, fontSize: "0.82rem" }}>Champions to be decided — {cd ? `${cd.days} days away` : "August 2027"}.</div>
              ) : null}
              {e.champion_note && <div className="faint" style={{ fontSize: "0.78rem", marginTop: 6 }}>{e.champion_note}</div>}
              <div className="gold" style={{ fontSize: "0.78rem", marginTop: 8 }}>Open the scrapbook →</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Champion bulls behind the winners — clearly labeled */}
      <div className="section" style={{ paddingBottom: 0 }}>
        <h2 style={{ fontSize: "1.5rem" }}>🐂 The champion sires behind the winners</h2>
        <p className="muted" style={{ marginTop: 0, marginBottom: 18, maxWidth: "74ch", lineHeight: 1.7 }}>
          The individual bulls who <strong>won</strong> a Zenkyo, or <strong>sired</strong> a Grand Champion —
          and then passed into the pedigrees of the world's herds. Each one's record is stated plainly.
          A 🏆 badge appears on any foundation animal descended from them.
        </p>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 16 }}>
          {champs.map((c: any) => (
            <div key={c.name} className="card card-pad" style={{ borderTop: "3px solid var(--gold)" }}>
              <div className="row" style={{ alignItems: "baseline", gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: "1.15rem" }}>{c.name}</h3>
                {c.name_jp && <span className="faint" style={{ fontSize: "1rem" }}>{c.name_jp}</span>}
              </div>
              <div className="row wrap" style={{ gap: 6, margin: "6px 0 10px" }}>
                {c.line && <span className="pill pill-dim" style={{ fontSize: "0.64rem" }}>{c.line}</span>}
                {c.prefecture && <span className="pill pill-dim" style={{ fontSize: "0.64rem" }}>{c.prefecture}</span>}
              </div>
              <p className="gold" style={{ fontSize: "0.88rem", fontWeight: 600, margin: "0 0 8px" }}>🏆 {c.zenkyo_record}</p>
              <p className="muted" style={{ fontSize: "0.9rem", lineHeight: 1.6, margin: 0 }}>{c.bio}</p>
              {(c.foundation_connections || []).filter((f: any) => f.reg).length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <div className="faint" style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>In these foundation pedigrees</div>
                  <div className="row wrap" style={{ gap: 6 }}>
                    {c.foundation_connections.filter((f: any) => f.reg).map((f: any) => (
                      <Link key={f.reg} href={`/animal?reg=${encodeURIComponent(f.reg)}`} className="pill" style={{ fontSize: "0.66rem" }}>
                        {f.foundation_animal} <span className="faint">· {f.relationship}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="help" style={{ marginTop: 12 }}>
          Records compiled from Japanese primary sources (National Wagyu Registration Association, prefecture records, breeder histories). Some pre-2000 individual placings remain unverified and are noted as such.
        </p>
      </div>

      {/* The Delegation */}
      <div className="section">
        <div className="card card-pad" style={{ borderColor: "var(--gold)", background: "linear-gradient(160deg, var(--bg-card), var(--bg-elev))" }}>
          <div className="row wrap" style={{ gap: 24, alignItems: "flex-start" }}>
            <div style={{ flex: "1 1 340px" }}>
              <span className="pill" style={{ background: "rgba(188,64,64,0.12)", color: "#e08585", borderColor: "#a94444" }}>✈ EXPRESSION OF INTEREST</span>
              <h2 style={{ fontSize: "1.6rem", marginTop: 10 }}>Join the WagyuTank Delegation to Zenkyo 2027</h2>
              <p className="muted" style={{ lineHeight: 1.7 }}>
                Every breeder dreams of seeing the Wagyu Olympics in person — but who do you go with?
                Where do you stay? Who translates? We're gauging interest in a <strong className="gold">
                guided WagyuTank delegation</strong> to Hokkaido for the 13th Zenkyo — the show, the
                famous Wagyu restaurants, the farms — organized with an established Japan agri-tour
                partner so everything's handled. No commitment; register your interest and we'll share
                plans as they firm up.
              </p>
              {d.delegation_interested > 0 && <p className="faint" style={{ fontSize: "0.85rem" }}>{d.delegation_interested} breeder{d.delegation_interested === 1 ? "" : "s"} already interested.</p>}
            </div>
            <div style={{ flex: "1 1 300px" }}>
              {sent ? (
                <div className="card card-pad" style={{ borderColor: "var(--gold)" }}>✅ {sent}</div>
              ) : (
                <div className="stack" style={{ gap: 10 }}>
                  <input className="input" placeholder="Email *" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  <input className="input" placeholder="Your name" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  <div className="row" style={{ gap: 10 }}>
                    <input className="input" placeholder="Country" value={form.country || ""} onChange={(e) => setForm({ ...form, country: e.target.value })} />
                    <input className="input" type="number" min={1} max={20} placeholder="Party size" value={form.party_size} onChange={(e) => setForm({ ...form, party_size: parseInt(e.target.value) || 1 })} style={{ maxWidth: 110 }} />
                  </div>
                  <textarea className="input" rows={2} placeholder="Anything you'd want from the trip? (optional)" value={form.note || ""} onChange={(e) => setForm({ ...form, note: e.target.value })} />
                  <button className="btn btn-gold btn-lg" disabled={busy || !form.email} onClick={register}>{busy ? "Registering…" : "Register my interest"}</button>
                  <p className="help">No payment, no commitment — just an early heads-up so we can plan and reach out.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <p className="muted center" style={{ marginTop: 10 }}>
        <Link href="/japan" className="gold">← Back to Wagyu Japan</Link>
      </p>
    </div>
  );
}
