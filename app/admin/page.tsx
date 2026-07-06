"use client";
import { useEffect, useState } from "react";
import { api, money } from "../../lib/api";
import { useAuth } from "../../lib/auth";

const TABS = ["Overview", "Analytics", "Users", "Campaigns", "Roundup", "Ads", "AI & Compute", "Settings", "Audit"];

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
  if (!user || user.role !== "admin")
    return <div className="container section"><h1>Admin</h1><p className="muted">You don't have access to this area.</p></div>;

  return (
    <div className="container section">
      <div className="row" style={{ alignItems: "baseline" }}>
        <h1 style={{ fontSize: "2rem" }}>Control Panel</h1>
        <div className="spacer" />
        <span className="faint" style={{ fontSize: "0.85rem" }}>Signed in as {user.email}</span>
      </div>
      <div className="row wrap admin-tabs" style={{ gap: 6, margin: "16px 0 24px", borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`pill ${tab === t ? "" : "pill-dim"}`} style={{ cursor: "pointer" }}>{t}</button>
        ))}
      </div>
      {tab === "Overview" && <Overview />}
      {tab === "Analytics" && <Analytics />}
      {tab === "Users" && <Users />}
      {tab === "Roundup" && <Roundup />}
      {tab === "Ads" && <Ads />}
      {tab === "Campaigns" && <Campaigns />}
      {tab === "AI & Compute" && <AICompute />}
      {tab === "Settings" && <SettingsTab />}
      {tab === "Audit" && <Audit />}
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
  if (!d) return <div className="muted">Loading…</div>;
  return (
    <div className="stack" style={{ gap: 20 }}>
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
        <div className="card card-pad"><div className="faint" style={{ fontSize: "0.78rem", marginBottom: 8 }}>Referrers</div>
          {d.referrers.length ? d.referrers.map((r: any) => <div key={r.ref} className="kv"><span className="k" style={{ fontSize: "0.8rem" }}>{(r.ref || "").slice(0, 30)}</span><span>{r.n}</span></div>) : <span className="faint">—</span>}</div>
      </div>
    </div>
  );
}

function Users() {
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [total, setTotal] = useState(0);
  const [busy, setBusy] = useState<number | null>(null);

  function load() { api.adminUsers({ q, limit: 60 }).then((r) => { setRows(r.users); setTotal(r.total); }).catch(() => {}); }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [q]);

  async function act(id: number, action: string) {
    if (action === "delete" && !confirm("Soft-delete this account?")) return;
    setBusy(id);
    try { await api.adminUserAction(id, action); load(); } catch (e: any) { alert(e.message); } finally { setBusy(null); }
  }
  async function exportCsv() {
    const csv = await api.adminEmailList();
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = "wagyutank-email-list.csv"; a.click();
  }

  return (
    <div className="stack" style={{ gap: 14 }}>
      <div className="row" style={{ gap: 10 }}>
        <input className="input" placeholder="Search email or name…" value={q} onChange={(e) => setQ(e.target.value)} style={{ maxWidth: 320 }} />
        <div className="spacer" />
        <span className="faint" style={{ alignSelf: "center", fontSize: "0.85rem" }}>{total} accounts</span>
        <button className="btn" onClick={exportCsv}>⬇ Export email list</button>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Email</th><th>Name</th><th>Role</th><th>Status</th><th>Seller</th><th>Listings</th><th>Actions</th></tr></thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} style={{ opacity: u.account_status === "deleted" ? 0.5 : 1 }}>
                <td>{u.email}</td>
                <td>{u.display_name}</td>
                <td>{u.role === "admin" ? <span className="pill">admin</span> : "user"}</td>
                <td><span className={`pill ${u.account_status === "active" ? "pill-green" : u.account_status === "suspended" ? "pill-red" : "pill-dim"}`}>{u.account_status}</span></td>
                <td>{u.is_seller ? "✓" : "—"}</td>
                <td>{u.listings}</td>
                <td>
                  <div className="row" style={{ gap: 4, flexWrap: "wrap" }}>
                    {u.account_status === "active"
                      ? <button className="mini-btn" disabled={busy === u.id} onClick={() => act(u.id, "suspend")}>Suspend</button>
                      : u.account_status === "suspended"
                        ? <button className="mini-btn" disabled={busy === u.id} onClick={() => act(u.id, "activate")}>Activate</button> : null}
                    {u.role === "admin"
                      ? <button className="mini-btn" disabled={busy === u.id} onClick={() => act(u.id, "remove_admin")}>Un-admin</button>
                      : <button className="mini-btn" disabled={busy === u.id} onClick={() => act(u.id, "make_admin")}>Make admin</button>}
                    <button className="mini-btn danger" disabled={busy === u.id} onClick={() => act(u.id, "delete")}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
        <div className="row"><div><strong>Require 2FA for all admins</strong><p className="faint" style={{ fontSize: "0.82rem", margin: "2px 0 0" }}>Admins without 2FA lose panel access until they enable it. You must have 2FA on yourself to turn this on.</p></div>
          <div className="spacer" /><button className={`pill ${s.require_admin_2fa ? "pill-green" : "pill-dim"}`} style={{ cursor: "pointer" }} onClick={() => put({ require_admin_2fa: !s.require_admin_2fa }).catch((e: any) => alert(e.message))}>{s.require_admin_2fa ? "REQUIRED" : "OPTIONAL"}</button></div>
      </div>
      <div className="card card-pad">
        <div className="field"><label>Platform fee (basis points) — {(s.platform_fee_bps / 100).toFixed(2)}% of sale</label>
          <input className="input" type="number" defaultValue={s.platform_fee_bps} onBlur={(e) => put({ platform_fee_bps: parseInt(e.target.value) || 0 })} />
          <p className="help">0 = free at launch. 100 bps = 1%. Buyer-pays-fee model.</p></div>
      </div>
      {saved && <div className="toast">Saved ✓</div>}
    </div>
  );
}
