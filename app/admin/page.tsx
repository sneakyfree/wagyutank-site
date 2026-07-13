"use client";
import { useEffect, useState } from "react";
import { TANK } from "../../lib/tank";
import { api, money } from "../../lib/api";
import { useAuth } from "../../lib/auth";

const ROLE_RANK: Record<string, number> = { user: 0, manager: 1, admin: 2, super_admin: 3 };
const ROLE_LABEL: Record<string, string> = { user: "member", manager: "Manager", admin: "Admin", super_admin: "Super Admin" };
// Tabs only admins+ may open; managers get the rest (visibility + moderation).
const ADMIN_ONLY_TABS = new Set(["Members", "Campaigns", "AI & Compute", "Settings", "Audit"]);
const ALL_TABS = ["Overview", "Health", "Analytics", "Members", "Catalog", "Theater", "Campaigns", "Roundup", "Ads", "AI & Compute", "Settings", "Audit"];

function Bars({ data, color = "var(--gold)" }: { data: any[]; color?: string }) {
  if (!data?.length) return null;
  const max = Math.max(1, ...data.map((d) => d.count));
  const w = data.length * 5;
  return (
    <svg viewBox={`0 0 ${w} 44`} preserveAspectRatio="none" style={{ width: "100%", height: 60 }}>
      {data.map((d, i) => {
        const h = (d.count / max) * 42;
        return <rect key={i} x={i * 5} y={44 - h} width={3.6} height={Math.max(h, 0.5)} rx={1} fill={color}>
          <title>{d.date}: {d.count}</title></rect>;
      })}
    </svg>
  );
}

function Kpi({ label, value, sub }: { label: string; value: any; sub?: string }) {
  return (
    <div className="card card-pad">
      <div className="faint" style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
      <div style={{ fontSize: "1.9rem", fontWeight: 800, marginTop: 4 }}>{value}</div>
      {sub && <div className="faint" style={{ fontSize: "0.78rem" }}>{sub}</div>}
    </div>
  );
}

export default function AdminPage() {
  const { user, loading } = useAuth();
  const [tab, setTab] = useState("Overview");

  if (loading) return <div className="container section">Loading…</div>;
  const myRank = ROLE_RANK[user?.role || "user"] || 0;
  if (!user || myRank < 1)
    return <div className="container section"><h1>Control Panel</h1><p className="muted">You don't have access to this area.</p></div>;

  const isAdmin = myRank >= 2;
  const isSuper = myRank >= 3;
  const tabs = ALL_TABS.filter((t) => isAdmin || !ADMIN_ONLY_TABS.has(t));
  const title = isSuper ? "Owner Control Panel" : isAdmin ? "Admin Control Panel" : "Manager Panel";

  return (
    <div className="container section">
      <div className="row" style={{ alignItems: "baseline" }}>
        <h1 style={{ fontSize: "2rem" }}>{title}</h1>
        <span className="pill" style={{ marginLeft: 10, alignSelf: "center" }}>{ROLE_LABEL[user.role || "user"]}</span>
        <div className="spacer" />
        <span className="faint" style={{ fontSize: "0.85rem" }}>Signed in as {user.email}</span>
      </div>
      <div className="row wrap admin-tabs" style={{ gap: 6, margin: "16px 0 24px", borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`pill ${tab === t ? "" : "pill-dim"}`} style={{ cursor: "pointer" }}>{t}</button>
        ))}
      </div>
      {tab === "Overview" && <Overview />}
      {tab === "Health" && <Health />}
      {tab === "Analytics" && <Analytics />}
      {tab === "Members" && isAdmin && <Members myRole={user.role || "user"} />}
      {tab === "Catalog" && <CatalogAdmin isAdmin={isAdmin} />}
      {tab === "Theater" && <TheaterAdmin isAdmin={isAdmin} />}
      {tab === "Roundup" && <Roundup />}
      {tab === "Ads" && <Ads />}
      {tab === "Campaigns" && isAdmin && <Campaigns />}
      {tab === "AI & Compute" && isAdmin && <AICompute />}
      {tab === "Settings" && isAdmin && <SettingsTab />}
      {tab === "Audit" && isAdmin && <Audit />}
    </div>
  );
}

function Campaigns() {
  const [d, setD] = useState<any>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [segment, setSegment] = useState("all");
  const [msg, setMsg] = useState("");
  function load() { api.adminCampaigns().then(setD).catch(() => {}); }
  useEffect(() => { load(); }, []);
  async function test() {
    setMsg("");
    try { const r = await api.adminCampaignTest(subject, body); setMsg(r.ok ? `Test sent to ${r.sent_to}` : "Test failed (no mail key?)"); } catch (e: any) { setMsg(e.message); }
  }
  async function send() {
    if (!confirm(`Send "${subject}" to the ${segment} segment? This emails real people.`)) return;
    setMsg("Sending…");
    try { const r = await api.adminCampaignSend(subject, body, segment); setMsg(`Sent to ${r.sent}/${r.recipients} recipients.`); setSubject(""); setBody(""); load(); }
    catch (e: any) { setMsg(e.message); }
  }
  async function digestTest() { setMsg(""); try { const r = await api.adminDigestTest(); setMsg(r.ok ? `Digest preview sent to ${r.sent_to}` : "Digest test failed (no mail key?)"); } catch (e: any) { setMsg(e.message); } }
  async function digestSend() { if (!confirm(`Send the weekly Wagyu Wire digest to all ${d?.opted_in} opted-in users now?`)) return; setMsg("Sending digest…"); try { const r = await api.adminDigestSend(); setMsg(r.message); } catch (e: any) { setMsg(e.message); } }

  if (!d) return <div className="muted">Loading…</div>;
  return (
    <div className="stack" style={{ gap: 20 }}>
      <div className="card card-pad" style={{ maxWidth: 680, borderColor: "var(--gold)" }}>
        <div className="row"><div><strong>📰 The Wagyu Wire — weekly digest</strong>
          <p className="faint" style={{ fontSize: "0.82rem", margin: "2px 0 0" }}>Auto-assembled from news, price index, listings & records. Sends weekly to opted-in users.</p></div>
          <div className="spacer" /></div>
        <div className="row" style={{ gap: 8, marginTop: 10 }}>
          <button className="btn" onClick={digestTest}>Preview to me</button>
          <button className="btn btn-gold" onClick={digestSend}>Send digest now</button>
        </div>
      </div>
      <div className="card card-pad" style={{ maxWidth: 680 }}>
        <div className="row"><h2 style={{ fontSize: "1.2rem", margin: 0 }}>New campaign</h2><div className="spacer" />
          <span className="faint" style={{ fontSize: "0.82rem" }}>{d.opted_in} opted-in recipients</span></div>
        <div className="field"><label>Subject</label><input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
        <div className="field"><label>Body (HTML allowed)</label><textarea className="input" rows={7} value={body} onChange={(e) => setBody(e.target.value)} placeholder="<p>Hi from WagyuTank…</p>" /></div>
        <div className="row" style={{ gap: 10 }}>
          <select className="select" style={{ width: "auto" }} value={segment} onChange={(e) => setSegment(e.target.value)}>
            <option value="all">Everyone opted-in</option><option value="sellers">Sellers only</option><option value="buyers">Non-sellers only</option>
          </select>
          <div className="spacer" />
          <button className="btn" onClick={test} disabled={!subject || !body}>Send test to me</button>
          <button className="btn btn-gold" onClick={send} disabled={!subject || !body}>Send campaign</button>
        </div>
        {msg && <p className="help gold" style={{ marginTop: 8 }}>{msg}</p>}
        <p className="help">Every email includes a one-click unsubscribe link (CAN-SPAM/GDPR compliant). Essential account emails are never affected.</p>
      </div>
      <div>
        <h3 style={{ fontSize: "1rem" }}>Past campaigns</h3>
        <div className="admin-table-wrap"><table className="admin-table">
          <thead><tr><th>Subject</th><th>Segment</th><th>Sent</th><th>Status</th></tr></thead>
          <tbody>{d.campaigns.map((c: any) => <tr key={c.id}><td>{c.subject}</td><td>{c.segment}</td><td>{c.sent}/{c.recipients}</td><td><span className="pill pill-dim">{c.status}</span></td></tr>)}</tbody>
        </table></div>
      </div>
    </div>
  );
}

function Audit() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { api.adminAudit().then(setRows).catch(() => {}); }, []);
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead><tr><th>When</th><th>Admin</th><th>Action</th><th>Target</th><th>Detail</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td style={{ whiteSpace: "nowrap" }}>{new Date(r.created_at).toLocaleString()}</td>
              <td>{r.admin_email}</td>
              <td><span className="pill pill-dim">{r.action}</span></td>
              <td>{r.target_type ? `${r.target_type} #${r.target_id}` : "—"}</td>
              <td className="faint" style={{ fontSize: "0.78rem" }}>{r.detail ? JSON.stringify(r.detail) : ""}</td>
            </tr>
          ))}
          {!rows.length && <tr><td colSpan={5} className="faint">No admin actions logged yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function Overview() {
  const [d, setD] = useState<any>(null);
  useEffect(() => { api.adminOverview().then(setD).catch(() => {}); }, []);
  if (!d) return <div className="muted">Loading metrics…</div>;
  const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12 } as any;
  return (
    <div className="stack" style={{ gap: 24 }}>
      <div style={grid}>
        <Kpi label="Users" value={d.users.total} sub={`+${d.users.new_7d} this week`} />
        <Kpi label="Sellers" value={d.users.sellers} sub={`${d.users.marketing_opt_in} on email list`} />
        <Kpi label="Active listings" value={d.listings.active} sub={Object.entries(d.listings.by_type).map(([k, v]) => `${v} ${k}`).join(" · ")} />
        <Kpi label="Roundup" value={d.roundup.active} sub={`${d.roundup.sources} sources · ${d.roundup.css_eligible} export`} />
        <Kpi label="Ad impressions" value={d.ads.impressions} sub={`${d.ads.clicks} clicks · ${d.ads.active} live`} />
        <Kpi label="GMV (paid)" value={money(d.orders.gmv_cents / 100)} sub={`${d.orders.paid} orders`} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}>
        {[["Signups (30d)", d.charts.signups, "var(--gold)"], ["Listings (30d)", d.charts.listings, "#6d9995"],
          ["Roundup indexed (30d)", d.charts.roundup_indexed, "#7fb4ad"], ["Paid orders (30d)", d.charts.orders, "#4ea564"]].map(
          ([label, data, color]: any) => (
          <div key={label} className="card card-pad">
            <div className="faint" style={{ fontSize: "0.78rem", marginBottom: 6 }}>{label}</div>
            <Bars data={data} color={color} />
          </div>
        ))}
      </div>
      {d.roundup.flagged > 0 && <div className="adslot">⚠ {d.roundup.flagged} Roundup listing(s) flagged for review · {d.ads.pending} ad(s) pending approval</div>}
    </div>
  );
}

function ago(iso: string | null): string {
  if (!iso) return "never";
  const s = (Date.now() - new Date(iso + "Z").getTime()) / 1000;
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
const DOT: Record<string, string> = { healthy: "#4ea564", stale: "#d9a441", down: "#c0574e", unknown: "#7d7362" };

function Health() {
  const [d, setD] = useState<any>(null);
  const [filter, setFilter] = useState("");
  function load() { api.adminHealth().then(setD).catch(() => setD(false)); }
  useEffect(() => { load(); const t = setInterval(load, 60000); return () => clearInterval(t); }, []);
  if (d === false) return <div className="muted">Health data unavailable.</div>;
  if (!d) return <div className="muted">Loading system health…</div>;
  const s = d.summary;
  const sources = d.sources.filter((x: any) => !filter || x.type === filter);

  return (
    <div className="stack" style={{ gap: 22 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12 }}>
        <Kpi label="Spider jobs" value={`${s.jobs_healthy}/${s.jobs_total}`} sub="healthy" />
        <Kpi label="Jobs stale/down" value={s.jobs_stale} sub={s.jobs_stale ? "⚠ needs attention" : "all current"} />
        <Kpi label="Sources tracked" value={s.sources_total} sub="individual spiders" />
        <Kpi label="Never contributed" value={s.sources_never_contributed} sub="check these" />
      </div>

      <div>
        <h2 style={{ fontSize: "1.2rem" }}>Daily gathering machines</h2>
        <div className="admin-table-wrap"><table className="admin-table">
          <thead><tr><th></th><th>Job</th><th>Schedule</th><th>Last run</th><th>Last contributed</th><th>Last result</th></tr></thead>
          <tbody>
            {d.jobs.map((j: any) => (
              <tr key={j.key}>
                <td><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: DOT[j.status] }} title={j.status} /></td>
                <td><div style={{ fontWeight: 600 }}>{j.label}</div><div className="faint" style={{ fontSize: "0.72rem" }}>{j.detail}</div></td>
                <td className="faint">{j.cadence}</td>
                <td className={j.status === "down" ? "" : ""} style={{ color: j.status === "down" ? "#c0574e" : undefined }}>{ago(j.last_run)}</td>
                <td>{ago(j.last_contributed)}</td>
                <td>{j.last_error ? <span style={{ color: "#c0574e" }}>⚠ {j.last_error.slice(0, 40)}</span>
                  : j.last_added != null ? <span className="faint">+{j.last_added}{j.last_seen ? ` / ${j.last_seen} seen` : ""}</span> : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table></div>
        <p className="help">🟢 healthy · 🟡 overdue · 🔴 down (way past schedule) · ⚫ hasn't run yet. Auto-refreshes each minute.</p>
      </div>

      <div>
        <div className="row" style={{ alignItems: "baseline" }}>
          <h2 style={{ fontSize: "1.2rem" }}>Individual spiders ({d.sources.length})</h2>
          <div className="spacer" />
          <select className="select" style={{ width: "auto" }} value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All types</option><option value="news_feed">News feeds</option>
            <option value="engine">Engines</option><option value="roundup_source">Roundup sources</option>
          </select>
        </div>
        <div className="admin-table-wrap"><table className="admin-table">
          <thead><tr><th></th><th>Spider</th><th>Type</th><th>Last crawled</th><th>Last contributed</th><th>Last yield</th><th>Success</th></tr></thead>
          <tbody>
            {sources.map((x: any) => (
              <tr key={x.key}>
                <td><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: x.never_contributed ? "#c0574e" : (x.run_hours_ago > 48 ? "#d9a441" : "#4ea564") }} /></td>
                <td style={{ fontSize: "0.82rem" }}>{x.label}</td>
                <td className="faint" style={{ fontSize: "0.72rem" }}>{x.type.replace("_", " ")}</td>
                <td className="faint">{ago(x.last_run)}</td>
                <td className={x.never_contributed ? "" : "faint"} style={{ color: x.never_contributed ? "#c0574e" : undefined }}>{x.never_contributed ? "never" : ago(x.last_contributed)}</td>
                <td>{x.last_count}</td>
                <td className="faint">{x.ok_runs}/{x.runs}</td>
              </tr>
            ))}
          </tbody>
        </table></div>
        <p className="help">A spider that's crawled recently but "never contributed" (🔴) may have a dead source or changed format — worth checking. Small-market feeds legitimately contribute rarely.</p>
      </div>
    </div>
  );
}

function Analytics() {
  const [d, setD] = useState<any>(null);
  useEffect(() => { api.adminAnalytics().then(setD).catch(() => {}); }, []);
  if (!d) return <div className="muted">Loading analytics…</div>;
  const maxF = Math.max(1, ...d.funnel.map((f: any) => f.n));
  return (
    <div className="stack" style={{ gap: 24 }}>
      {!d.has_data && <div className="adslot">No traffic events yet — the tracker just went live, so this fills in as visitors arrive.</div>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}>
        <div className="card card-pad"><div className="faint" style={{ fontSize: "0.78rem", marginBottom: 6 }}>Unique visitors (30d)</div><Bars data={d.charts.visitors} color="var(--gold)" /></div>
        <div className="card card-pad"><div className="faint" style={{ fontSize: "0.78rem", marginBottom: 6 }}>Page views (30d)</div><Bars data={d.charts.page_views} color="#6d9995" /></div>
      </div>
      <div className="card card-pad">
        <div className="faint" style={{ fontSize: "0.78rem", marginBottom: 12 }}>Funnel (30 days)</div>
        <div className="stack" style={{ gap: 8 }}>
          {d.funnel.map((f: any) => (
            <div key={f.step} className="row" style={{ gap: 10, alignItems: "center" }}>
              <span style={{ width: 84, fontSize: "0.82rem" }}>{f.step}</span>
              <div style={{ flex: 1, background: "var(--border)", borderRadius: 6, height: 22, overflow: "hidden" }}>
                <div style={{ width: `${(f.n / maxF) * 100}%`, background: "var(--gold)", height: "100%", minWidth: f.n ? 3 : 0 }} />
              </div>
              <span style={{ width: 44, textAlign: "right", fontWeight: 700 }}>{f.n}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}>
        <div className="card card-pad"><div className="faint" style={{ fontSize: "0.78rem", marginBottom: 8 }}>Top pages</div>
          {d.top_pages.length ? d.top_pages.map((p: any) => <div key={p.path} className="kv"><span className="k" style={{ fontSize: "0.8rem" }}>{p.path}</span><span>{p.views}</span></div>) : <span className="faint">—</span>}</div>
        <div className="card card-pad"><div className="faint" style={{ fontSize: "0.78rem", marginBottom: 8 }}>Top searches</div>
          {d.top_searches.length ? d.top_searches.map((x: any) => <div key={x.q} className="kv"><span className="k" style={{ fontSize: "0.8rem" }}>{x.q}</span><span>{x.n}</span></div>) : <span className="faint">—</span>}</div>
        <div className="card card-pad"><div className="faint" style={{ fontSize: "0.78rem", marginBottom: 8 }}>Where visitors come from</div>
          {d.referrers.length ? d.referrers.map((r: any) => <div key={r.ref} className="kv"><span className="k" style={{ fontSize: "0.8rem" }}>{(r.ref || "").slice(0, 30)}</span><span>{r.n}</span></div>) : <span className="faint">Direct / not yet tracked</span>}</div>
      </div>

      <h2 style={{ fontSize: "1.2rem", marginTop: 8 }}>What's selling</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
        <div className="card card-pad"><div className="faint" style={{ fontSize: "0.78rem", marginBottom: 8 }}>Most-viewed listings</div>
          {d.top_listings?.length ? d.top_listings.map((l: any) => <div key={l.id} className="kv"><span className="k" style={{ fontSize: "0.8rem" }}>{l.title.slice(0, 34)}</span><span>{l.views} views</span></div>) : <span className="faint">No live listings yet.</span>}</div>
        <div className="card card-pad"><div className="faint" style={{ fontSize: "0.78rem", marginBottom: 8 }}>Best sellers (paid orders)</div>
          {d.best_sellers?.length ? d.best_sellers.map((b: any, i: number) => <div key={i} className="kv"><span className="k" style={{ fontSize: "0.8rem" }}>{(b.title || "").slice(0, 30)}</span><span>{b.orders} · {money(b.gmv)}</span></div>) : <span className="faint">No sales yet.</span>}</div>
        <div className="card card-pad"><div className="faint" style={{ fontSize: "0.78rem", marginBottom: 8 }}>Sales by product line</div>
          {d.sales_by_type?.length ? d.sales_by_type.map((s: any) => <div key={s.type} className="kv"><span className="k" style={{ fontSize: "0.8rem" }}>{s.type}</span><span>{s.orders} · {money(s.gmv)}</span></div>) : <span className="faint">No sales yet.</span>}</div>
      </div>

      <h2 style={{ fontSize: "1.2rem", marginTop: 8 }}>What draws the crowd</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
        <div className="card card-pad"><div className="faint" style={{ fontSize: "0.78rem", marginBottom: 8 }}>Most-viewed bloodline pages</div>
          {d.top_animals?.length ? d.top_animals.map((a: any) => <div key={a.path} className="kv"><span className="k" style={{ fontSize: "0.8rem" }}>{a.path.replace("/animal/", "").replace(/\/$/, "").replace("?reg=", "")}</span><span>{a.views}</span></div>) : <span className="faint">Fills in as visitors browse animals.</span>}</div>
        <div className="card card-pad"><div className="faint" style={{ fontSize: "0.78rem", marginBottom: 8 }}>Hottest Roundup listings (outbound clicks)</div>
          {d.roundup_demand?.length ? d.roundup_demand.map((r: any, i: number) => <div key={i} className="kv"><span className="k" style={{ fontSize: "0.8rem" }}>{r.title} · {r.source}</span><span>{r.clicks}</span></div>) : <span className="faint">No outbound clicks yet.</span>}</div>
      </div>
    </div>
  );
}

function TheaterAdmin({ isAdmin }: { isAdmin: boolean }) {
  const [claims, setClaims] = useState<any[]>([]);
  const [vids, setVids] = useState<any[]>([]);
  const [q, setQ] = useState("");
  function load() {
    api.adminVideoClaims("pending").then(setClaims).catch(() => {});
    api.adminVideos({ q, limit: 50 }).then(setVids).catch(() => {});
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [q]);
  async function claimAct(id: number, action: string) { await api.adminVideoClaimAction(id, action); load(); }
  async function vidAct(id: number, action: string) {
    if (action === "delete" && !confirm("Delete this video from the library?")) return;
    await api.adminVideoAction(id, action); load();
  }
  return (
    <div className="stack" style={{ gap: 20 }}>
      <div>
        <h2 style={{ fontSize: "1.2rem" }}>✓ Pending channel claims {claims.length ? `(${claims.length})` : ""}</h2>
        {claims.length ? (
          <div className="admin-table-wrap"><table className="admin-table">
            <thead><tr><th>Channel</th><th>Claimed by</th><th>Note</th><th>Actions</th></tr></thead>
            <tbody>{claims.map((c) => (
              <tr key={c.id}>
                <td>{c.channel || c.channel_id}</td>
                <td>@{c.handle} <span className="faint" style={{ fontSize: "0.75rem" }}>{c.email}</span></td>
                <td className="faint" style={{ fontSize: "0.8rem" }}>{c.note || "—"}</td>
                <td>{isAdmin && <div className="row" style={{ gap: 4 }}>
                  <button className="mini-btn" onClick={() => claimAct(c.id, "approve")}>Approve</button>
                  <button className="mini-btn danger" onClick={() => claimAct(c.id, "reject")}>Reject</button>
                </div>}</td>
              </tr>
            ))}</tbody>
          </table></div>
        ) : <p className="faint">No pending claims. Members claim channels from video pages; verify it's really their channel before approving.</p>}
      </div>
      <div>
        <div className="row" style={{ gap: 10 }}>
          <h2 style={{ fontSize: "1.2rem", margin: 0 }}>🎬 Video library</h2>
          <div className="spacer" />
          <input className="input" style={{ maxWidth: 260 }} placeholder="Search titles…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="admin-table-wrap" style={{ marginTop: 10 }}><table className="admin-table">
          <thead><tr><th>Title</th><th>Source</th><th>Channel</th><th>Views</th><th>Category</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{vids.map((v) => (
            <tr key={v.id}>
              <td style={{ maxWidth: 320 }}>{v.title?.slice(0, 60)}</td>
              <td>{v.source === "native" ? <span className="pill">⬆ native</span> : "yt"}</td>
              <td className="faint" style={{ fontSize: "0.8rem" }}>{v.channel}</td>
              <td>{v.views?.toLocaleString?.() ?? "—"}</td>
              <td>{v.category}</td>
              <td><span className={`pill ${v.status === "approved" ? "pill-green" : "pill-dim"}`}>{v.status}</span></td>
              <td><div className="row" style={{ gap: 4 }}>
                {v.status !== "approved" && <button className="mini-btn" onClick={() => vidAct(v.id, "approve")}>Approve</button>}
                {v.status === "approved" && <button className="mini-btn" onClick={() => vidAct(v.id, "hide")}>Hide</button>}
                <button className="mini-btn danger" onClick={() => vidAct(v.id, "delete")}>Delete</button>
              </div></td>
            </tr>
          ))}</tbody>
        </table></div>
      </div>
    </div>
  );
}

function CatalogAdmin({ isAdmin }: { isAdmin: boolean }) {
  const [d, setD] = useState<any>(null);
  const [edition, setEdition] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState<number | null>(null);
  function load() { api.adminCatalogSubmissions({ edition, status }).then(setD).catch(() => setD({ editions: [], submissions: [] })); }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [edition, status]);
  async function act(id: number, action: string) {
    if (action === "delete" && !confirm("Delete this submission?")) return;
    setBusy(id);
    try { await api.adminCatalogAction(id, action); load(); } catch (e: any) { alert(e.message); } finally { setBusy(null); }
  }
  async function exportCsv() {
    const csv = await api.adminCatalogCsv(edition);
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = `${(TANK as any).key || "tank"}-catalog-printrun.csv`; a.click();
  }
  if (!d) return <div className="muted">Loading catalog submissions…</div>;
  return (
    <div className="stack" style={{ gap: 14 }}>
      <div className="row wrap" style={{ gap: 10 }}>
        <select className="select" style={{ width: "auto" }} value={edition} onChange={(e) => setEdition(e.target.value)}>
          <option value="">All editions</option>{d.editions.map((e: string) => <option key={e} value={e}>{e}</option>)}
        </select>
        <select className="select" style={{ width: "auto" }} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="printed">Printed</option><option value="rejected">Rejected</option>
        </select>
        <div className="spacer" />
        <span className="faint" style={{ alignSelf: "center", fontSize: "0.85rem" }}>{d.submissions.length} submissions</span>
        {isAdmin && <button className="btn" onClick={exportCsv}>⬇ Print-run CSV (with addresses)</button>}
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Ranch</th><th>Animal</th><th>Type</th><th>Contact</th><th>Ships to</th><th>Status</th>{isAdmin && <th>Actions</th>}</tr></thead>
          <tbody>
            {d.submissions.map((s: any) => (
              <tr key={s.id}>
                <td>{s.ranch_name}{s.user_handle && <span className="faint" style={{ fontSize: "0.72rem" }}> @{s.user_handle}</span>}</td>
                <td>{s.animal_name || "—"}{s.animal_reg && <span className="faint" style={{ fontSize: "0.72rem" }}> ({s.animal_reg})</span>}</td>
                <td>{s.product_type}</td>
                <td className="faint" style={{ fontSize: "0.78rem" }}>{s.contact_email}</td>
                <td className="faint" style={{ fontSize: "0.78rem" }}>{[s.ship_city, s.ship_country].filter(Boolean).join(", ") || "—"}</td>
                <td><span className={`pill ${s.status === "approved" ? "pill-green" : s.status === "rejected" ? "pill-red" : "pill-dim"}`}>{s.status}</span></td>
                {isAdmin && <td><div className="row" style={{ gap: 4, flexWrap: "wrap" }}>
                  {s.status !== "approved" && <button className="mini-btn" disabled={busy === s.id} onClick={() => act(s.id, "approve")}>Approve</button>}
                  {s.status !== "rejected" && <button className="mini-btn" disabled={busy === s.id} onClick={() => act(s.id, "reject")}>Reject</button>}
                  {s.status === "approved" && <button className="mini-btn" disabled={busy === s.id} onClick={() => act(s.id, "mark_printed")}>Mark printed</button>}
                  <button className="mini-btn danger" disabled={busy === s.id} onClick={() => act(s.id, "delete")}>Delete</button>
                </div></td>}
              </tr>
            ))}
            {!d.submissions.length && <tr><td colSpan={isAdmin ? 7 : 6} className="faint">No submissions yet. They appear here when members submit via the Catalog page.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Members({ myRole }: { myRole: string }) {
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [total, setTotal] = useState(0);
  const [busy, setBusy] = useState<number | null>(null);
  const [msgFor, setMsgFor] = useState<any>(null);
  const [toast, setToast] = useState("");
  const myRank = ROLE_RANK[myRole] || 0;
  const isSuper = myRank >= 3;

  function load() { api.adminUsers({ q, role: roleFilter, limit: 80 }).then((r) => { setRows(r.users); setTotal(r.total); }).catch(() => {}); }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [q, roleFilter]);

  // Which roles can *I* assign to a given target?
  function assignableRoles(target: any): string[] {
    const tRank = ROLE_RANK[target.role] || 0;
    if (myRank <= tRank && !(isSuper && tRank === 3)) return []; // can't touch peers/superiors (supers can touch supers)
    const opts = ["user", "manager"];
    if (isSuper) opts.push("admin", "super_admin");
    return opts.filter((r) => ROLE_RANK[r] <= myRank); // never grant above yourself
  }
  function canAct(target: any): boolean {
    const tRank = ROLE_RANK[target.role] || 0;
    return myRank > tRank || (isSuper && tRank === 3 && target.role !== undefined);
  }

  async function act(id: number, action: string, role?: string) {
    if (action === "delete" && !confirm("Soft-delete this account? Their data is preserved but they can no longer sign in.")) return;
    setBusy(id);
    try { await api.adminUserAction(id, action, role); load(); } catch (e: any) { setToast(e.message); setTimeout(() => setToast(""), 4000); } finally { setBusy(null); }
  }
  async function sendMsg(subject: string, body: string) {
    if (!msgFor) return;
    try { const r = await api.adminMessageUser(msgFor.id, subject, body); setToast(r.ok ? `Email sent to ${r.sent_to}` : `Queued (mail not configured)`); }
    catch (e: any) { setToast(e.message); } finally { setMsgFor(null); setTimeout(() => setToast(""), 4000); }
  }
  async function exportCsv() {
    const csv = await api.adminEmailList();
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = `${(TANK as any).key || "tank"}-email-list.csv`; a.click();
  }

  return (
    <div className="stack" style={{ gap: 14 }}>
      <div className="row wrap" style={{ gap: 10 }}>
        <input className="input" placeholder="Search email or name…" value={q} onChange={(e) => setQ(e.target.value)} style={{ maxWidth: 300 }} />
        <select className="select" style={{ width: "auto" }} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All roles</option><option value="user">Members</option><option value="manager">Managers</option>
          <option value="admin">Admins</option><option value="super_admin">Super admins</option>
        </select>
        <div className="spacer" />
        <span className="faint" style={{ alignSelf: "center", fontSize: "0.85rem" }}>{total} accounts</span>
        <button className="btn" onClick={exportCsv}>⬇ Export email list</button>
      </div>
      {toast && <div className="adslot" style={{ borderColor: "var(--gold)" }}>{toast}</div>}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Email</th><th>Name</th><th>Role</th><th>Status</th><th>Seller</th><th>Listings</th><th>Actions</th></tr></thead>
          <tbody>
            {rows.map((u) => {
              const roles = assignableRoles(u);
              return (
              <tr key={u.id} style={{ opacity: u.account_status === "deleted" ? 0.5 : 1 }}>
                <td>{u.email}</td>
                <td>{u.display_name}</td>
                <td>
                  {roles.length ? (
                    <select className="select" style={{ width: "auto", padding: "3px 6px", fontSize: "0.8rem" }}
                      value={u.role} onChange={(e) => act(u.id, "set_role", e.target.value)} disabled={busy === u.id}>
                      {[...new Set([u.role, ...roles])].map((r) => <option key={r} value={r}>{ROLE_LABEL[r] || r}</option>)}
                    </select>
                  ) : <span className={`pill ${ROLE_RANK[u.role] >= 2 ? "" : "pill-dim"}`}>{ROLE_LABEL[u.role] || u.role}</span>}
                </td>
                <td><span className={`pill ${u.account_status === "active" ? "pill-green" : u.account_status === "suspended" ? "pill-red" : "pill-dim"}`}>{u.account_status}</span></td>
                <td>{u.is_seller ? "✓" : "—"}</td>
                <td>{u.listings}</td>
                <td>
                  <div className="row" style={{ gap: 4, flexWrap: "wrap" }}>
                    {u.account_status !== "deleted" && <button className="mini-btn" onClick={() => setMsgFor(u)}>✉ Message</button>}
                    {canAct(u) && u.account_status === "active" && <button className="mini-btn" disabled={busy === u.id} onClick={() => act(u.id, "suspend")}>Suspend</button>}
                    {canAct(u) && u.account_status === "suspended" && <button className="mini-btn" disabled={busy === u.id} onClick={() => act(u.id, "activate")}>Activate</button>}
                    {canAct(u) && u.account_status !== "deleted" && <button className="mini-btn danger" disabled={busy === u.id} onClick={() => act(u.id, "delete")}>Delete</button>}
                  </div>
                </td>
              </tr>
            ); })}
          </tbody>
        </table>
      </div>
      <p className="help">You can manage accounts below your own level. {isSuper ? "As owner, you assign and remove admins and managers." : "Admins manage members and managers; only the owner can assign admins."}</p>
      {msgFor && <MessageModal user={msgFor} onClose={() => setMsgFor(null)} onSend={sendMsg} />}
    </div>
  );
}

function MessageModal({ user, onClose, onSend }: { user: any; onClose: () => void; onSend: (s: string, b: string) => void }) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginTop: 0 }}>Message {user.display_name}</h3>
        <p className="faint" style={{ fontSize: "0.82rem", marginTop: -6 }}>Sends a direct email to {user.email}.</p>
        <div className="field"><label>Subject</label><input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
        <div className="field"><label>Message</label><textarea className="input" rows={6} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Hi there…" /></div>
        <div className="row" style={{ gap: 8, justifyContent: "flex-end" }}>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-gold" disabled={!subject || !body} onClick={() => onSend(subject, body)}>Send email</button>
        </div>
      </div>
    </div>
  );
}

function Roundup() {
  const [rows, setRows] = useState<any[]>([]);
  const [flagged, setFlagged] = useState(false);
  const [msg, setMsg] = useState("");
  function load() { api.adminRoundup(flagged).then(setRows).catch(() => {}); }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [flagged]);
  async function act(id: number, action: string) { await api.adminRoundupAction(id, action); load(); }
  async function run() { const r = await api.adminRoundupRun(); setMsg(r.message); }
  return (
    <div className="stack" style={{ gap: 14 }}>
      <div className="row" style={{ gap: 10 }}>
        <button className={`pill ${!flagged ? "" : "pill-dim"}`} style={{ cursor: "pointer" }} onClick={() => setFlagged(false)}>Recent</button>
        <button className={`pill ${flagged ? "" : "pill-dim"}`} style={{ cursor: "pointer" }} onClick={() => setFlagged(true)}>Flagged only</button>
        <div className="spacer" />
        <button className="btn btn-gold" onClick={run}>↻ Run crawl now</button>
      </div>
      {msg && <p className="help gold">{msg}</p>}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Title</th><th>Source</th><th>Country</th><th>Status</th><th>Clicks</th><th>Actions</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td><a href={r.source_url} target="_blank" rel="noopener noreferrer" className="gold">{(r.animal_name || r.title || "").slice(0, 40)}</a></td>
                <td>{r.source_site}</td><td>{r.country || "—"}</td>
                <td><span className={`pill ${r.flagged ? "pill-red" : r.status === "active" ? "pill-green" : "pill-dim"}`}>{r.flagged ? "flagged" : r.status}</span></td>
                <td>{r.clicks}</td>
                <td><div className="row" style={{ gap: 4 }}>
                  {r.flagged && <button className="mini-btn" onClick={() => act(r.id, "unflag")}>Restore</button>}
                  <button className="mini-btn" onClick={() => act(r.id, "hide")}>Hide</button>
                  <button className="mini-btn danger" onClick={() => act(r.id, "delete")}>Delete</button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Ads() {
  const [rows, setRows] = useState<any[]>([]);
  function load() { api.adminAds().then(setRows).catch(() => {}); }
  useEffect(() => { load(); }, []);
  async function act(id: number, action: string) { await api.adminAdAction(id, action); load(); }
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead><tr><th>Advertiser</th><th>Headline</th><th>Placement</th><th>Tier</th><th>Status</th><th>Imp/Clk</th><th>Actions</th></tr></thead>
        <tbody>
          {rows.map((a) => (
            <tr key={a.id}>
              <td>{a.advertiser_name}{a.is_house && <span className="pill pill-dim" style={{ marginLeft: 6 }}>house</span>}</td>
              <td>{a.headline}</td><td>{a.placement}</td><td>{a.tier || "—"}</td>
              <td><span className={`pill ${a.status === "active" ? "pill-green" : a.status === "pending" ? "pill-red" : "pill-dim"}`}>{a.status}</span></td>
              <td>{a.impressions}/{a.clicks}</td>
              <td><div className="row" style={{ gap: 4 }}>
                {a.status !== "active" && <button className="mini-btn" onClick={() => act(a.id, "approve")}>Approve</button>}
                {a.status === "active" && !a.is_house && <button className="mini-btn" onClick={() => act(a.id, "pause")}>Pause</button>}
                {a.status === "pending" && <button className="mini-btn" onClick={() => act(a.id, "reject")}>Reject</button>}
                {!a.is_house && <button className="mini-btn danger" onClick={() => act(a.id, "delete")}>Delete</button>}
              </div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AICompute() {
  const [d, setD] = useState<any>(null);
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);
  function load() { api.adminSettings().then(setD).catch(() => {}); }
  useEffect(() => { load(); }, []);
  if (!d) return <div className="muted">Loading…</div>;
  const s = d.settings;

  async function setProvider(p: string) { await api.adminPutSettings({ ai_provider: p }); load(); }
  async function setModel(key: string, v: string) { await api.adminPutSettings({ [key]: v }); }
  async function test() { setTesting(true); try { setResult(await api.adminAiTest()); } finally { setTesting(false); } }

  return (
    <div className="stack" style={{ gap: 20, maxWidth: 720 }}>
      <div className="card card-pad">
        <div className="row"><h2 style={{ fontSize: "1.2rem", margin: 0 }}>Active provider</h2><div className="spacer" />
          <span className="pill pill-green">{d.active_provider}</span></div>
        <p className="faint" style={{ fontSize: "0.85rem" }}>Swap the LLM behind every AI feature — instantly, no redeploy.</p>
        <div className="row wrap" style={{ gap: 8 }}>
          {d.providers.map((p: string) => {
            const avail = d.provider_available[p];
            return <button key={p} disabled={!avail} onClick={() => setProvider(p)}
              className={`pill ${s.ai_provider === p ? "" : "pill-dim"}`} style={{ cursor: avail ? "pointer" : "not-allowed", opacity: avail ? 1 : 0.4 }}>
              {p}{!avail && p !== "template" ? " (no key)" : ""}</button>;
          })}
        </div>
        <div className="row" style={{ gap: 8, marginTop: 14 }}>
          <button className="btn btn-gold" onClick={test} disabled={testing}>{testing ? "Testing…" : "Test provider"}</button>
          {result && <span className={`pill ${result.ok ? "pill-green" : "pill-red"}`} style={{ alignSelf: "center" }}>{result.ok ? "✓ responded" : "✕ failed"}</span>}
        </div>
        {result && <p className="help" style={{ marginTop: 8 }}>{result.response || result.error}</p>}
      </div>

      <div className="card card-pad">
        <h2 style={{ fontSize: "1.1rem", marginTop: 0 }}>Models</h2>
        {[["Anthropic ad-copy model", "anthropic_adcopy_model"], ["OpenAI ad-copy model", "openai_adcopy_model"], ["Windy Mind model", "windymind_adcopy_model"]].map(([label, key]) => (
          <div className="field" key={key}><label>{label}</label>
            <input className="input" defaultValue={s[key]} onBlur={(e) => setModel(key, e.target.value)} /></div>
        ))}
      </div>

      <div className="card card-pad">
        <h2 style={{ fontSize: "1.1rem", marginTop: 0 }}>Where AI is used</h2>
        {d.ai_insertion_points.map((p: any, i: number) => (
          <div key={i} className="kv"><span className="k">{p.where}</span><span className="faint" style={{ fontSize: "0.82rem" }}>{p.detail}</span></div>
        ))}
      </div>
    </div>
  );
}

function SettingsTab() {
  const [d, setD] = useState<any>(null);
  const [saved, setSaved] = useState(false);
  useEffect(() => { api.adminSettings().then(setD).catch(() => {}); }, []);
  if (!d) return <div className="muted">Loading…</div>;
  const s = d.settings;
  async function put(updates: any) { await api.adminPutSettings(updates); setSaved(true); setTimeout(() => setSaved(false), 1500); const r = await api.adminSettings(); setD(r); }

  return (
    <div className="stack" style={{ gap: 16, maxWidth: 600 }}>
      <div className="card card-pad">
        <div className="row"><div><strong>Advertising free during launch</strong><p className="faint" style={{ fontSize: "0.82rem", margin: "2px 0 0" }}>Off = self-serve Stripe checkout activates ({d.stripe_mode} mode).</p></div>
          <div className="spacer" /><button className={`pill ${s.ads_free_launch ? "pill-green" : "pill-dim"}`} style={{ cursor: "pointer" }} onClick={() => put({ ads_free_launch: !s.ads_free_launch })}>{s.ads_free_launch ? "FREE" : "PAID"}</button></div>
      </div>
      <div className="card card-pad">
        <div className="row"><div><strong>Daily Roundup crawler</strong><p className="faint" style={{ fontSize: "0.82rem", margin: "2px 0 0" }}>Auto-aggregates web listings each morning.</p></div>
          <div className="spacer" /><button className={`pill ${s.aggregator_enabled ? "pill-green" : "pill-dim"}`} style={{ cursor: "pointer" }} onClick={() => put({ aggregator_enabled: !s.aggregator_enabled })}>{s.aggregator_enabled ? "ON" : "OFF"}</button></div>
      </div>
      <div className="card card-pad">
        <div className="row"><div><strong>Weekly Wagyu Wire digest</strong><p className="faint" style={{ fontSize: "0.82rem", margin: "2px 0 0" }}>Auto-send the weekly digest to opted-in users.</p></div>
          <div className="spacer" /><button className={`pill ${s.digest_enabled ? "pill-green" : "pill-dim"}`} style={{ cursor: "pointer" }} onClick={() => put({ digest_enabled: !s.digest_enabled })}>{s.digest_enabled ? "ON" : "OFF"}</button></div>
      </div>
      <div className="card card-pad">
        <div className="row"><div><strong>Require 2FA for all admins</strong><p className="faint" style={{ fontSize: "0.82rem", margin: "2px 0 0" }}>Admins without 2FA lose panel access until they enable it. You must have 2FA on yourself to turn this on.</p></div>
          <div className="spacer" /><button className={`pill ${s.require_admin_2fa ? "pill-green" : "pill-dim"}`} style={{ cursor: "pointer" }} onClick={() => put({ require_admin_2fa: !s.require_admin_2fa }).catch((e: any) => alert(e.message))}>{s.require_admin_2fa ? "REQUIRED" : "OPTIONAL"}</button></div>
      </div>
      <div className="card card-pad">
        <div className="field"><label>Platform fee (basis points) — {(s.platform_fee_bps / 100).toFixed(2)}% of sale</label>
          <input className="input" type="number" defaultValue={s.platform_fee_bps} onBlur={(e) => put({ platform_fee_bps: parseInt(e.target.value) || 0 })} />
          <p className="help">0 = free at launch. 100 bps = 1%. Buyer-pays-fee model.</p></div>
      </div>
      <div className="card card-pad">
        <div className="row"><strong>📕 Semen Catalog — current edition</strong><div className="spacer" />
          <button className={`pill ${s.catalog_submit_open ? "pill-green" : "pill-dim"}`} style={{ cursor: "pointer" }} onClick={() => put({ catalog_submit_open: !s.catalog_submit_open })}>{s.catalog_submit_open ? "OPEN" : "CLOSED"}</button></div>
        <p className="faint" style={{ fontSize: "0.82rem", margin: "2px 0 10px" }}>What the public Catalog page announces. Flip editions here — no redeploy.</p>
        <div className="field"><label>Edition key (internal, e.g. 2026-northern)</label><input className="input" defaultValue={s.catalog_edition_key} onBlur={(e) => put({ catalog_edition_key: e.target.value })} /></div>
        <div className="field"><label>Edition label (public)</label><input className="input" defaultValue={s.catalog_edition_label} onBlur={(e) => put({ catalog_edition_label: e.target.value })} /></div>
        <div className="row" style={{ gap: 10 }}>
          <div className="field" style={{ flex: 1 }}><label>Submission deadline</label><input className="input" defaultValue={s.catalog_deadline} onBlur={(e) => put({ catalog_deadline: e.target.value })} /></div>
          <div className="field" style={{ flex: 1 }}><label>Mails</label><input className="input" defaultValue={s.catalog_mail_month} onBlur={(e) => put({ catalog_mail_month: e.target.value })} /></div>
        </div>
      </div>
      {saved && <div className="toast">Saved ✓</div>}
    </div>
  );
}
