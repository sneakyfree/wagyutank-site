"use client";
import { useEffect, useMemo, useState } from "react";

const CONT_FLAG: Record<string, string> = { OC: "🇦🇺", NA: "🇺🇸", EU: "🇪🇺", AS: "🇯🇵", SA: "🌎" };
const COUNTRY_FLAG: Record<string, string> = { AU: "🇦🇺", NZ: "🇳🇿", US: "🇺🇸", GB: "🇬🇧", DE: "🇩🇪", BR: "🇧🇷", JP: "🇯🇵" };

function money(n: number | null, cur = "AUD") {
  if (n == null) return "—";
  const sym: Record<string, string> = { AUD: "A$", USD: "$", EUR: "€", GBP: "£", JPY: "¥", NZD: "NZ$", BRL: "R$" };
  if (cur === "JPY") return `¥${(n / 1e6).toFixed(1)}M`;
  return `${sym[cur] || "$"}${n.toLocaleString()}`;
}

// Multi-line SVG chart with auto-scaling + year axis.
function LineChart({ series, height = 220 }: { series: { label: string; color: string; pts: { x: number; y: number }[] }[]; height?: number }) {
  const all = series.flatMap((s) => s.pts);
  if (!all.length) return <div className="faint">No data.</div>;
  const xs = all.map((p) => p.x), ys = all.map((p) => p.y);
  const xmin = Math.min(...xs), xmax = Math.max(...xs);
  const ymax = Math.max(...ys) * 1.1, ymin = 0;
  const W = 720, H = height, padL = 56, padB = 26, padT = 10, padR = 12;
  const sx = (x: number) => padL + ((x - xmin) / Math.max(1, xmax - xmin)) * (W - padL - padR);
  const sy = (y: number) => H - padB - ((y - ymin) / Math.max(1, ymax - ymin)) * (H - padB - padT);
  const yTicks = 4;
  return (
    <div style={{ overflowX: "auto" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", minWidth: 480, height: "auto" }}>
        {Array.from({ length: yTicks + 1 }).map((_, i) => {
          const v = (ymax / yTicks) * i, y = sy(v);
          return <g key={i}><line x1={padL} y1={y} x2={W - padR} y2={y} stroke="var(--border)" strokeWidth="1" />
            <text x={padL - 6} y={y + 3} textAnchor="end" fontSize="10" fill="var(--text-faint)">{v >= 1000 ? (v / 1000).toFixed(0) + "k" : v.toFixed(0)}</text></g>;
        })}
        {[xmin, Math.round((xmin + xmax) / 2), xmax].map((x, i) => (
          <text key={i} x={sx(x)} y={H - 8} textAnchor="middle" fontSize="10" fill="var(--text-faint)">{x}</text>
        ))}
        {series.map((s, si) => {
          const pts = s.pts.slice().sort((a, b) => a.x - b.x);
          const d = pts.map((p, i) => `${i ? "L" : "M"}${sx(p.x)},${sy(p.y)}`).join(" ");
          return <g key={si}>
            <path d={d} fill="none" stroke={s.color} strokeWidth="2.2" />
            {pts.map((p, i) => <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r="3" fill={s.color}><title>{p.x}: {p.y.toLocaleString()}</title></circle>)}
          </g>;
        })}
      </svg>
      <div className="row wrap" style={{ gap: 14, marginTop: 4, justifyContent: "center" }}>
        {series.map((s) => <span key={s.label} className="faint" style={{ fontSize: "0.78rem" }}>
          <span style={{ color: s.color, fontWeight: 800 }}>●</span> {s.label}</span>)}
      </div>
    </div>
  );
}

export default function SaleReports() {
  const [stats, setStats] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [elite, setElite] = useState<any>(null);
  const [matsusaka, setMatsusaka] = useState<any>(null);
  const [continent, setContinent] = useState("");
  const [sort, setSort] = useState("recent");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/sale-events/stats`).then((r) => r.json()).then(setStats).catch(() => {});
    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/sale-events/chart?series=elite`).then((r) => r.json()).then(setElite).catch(() => {});
    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/sale-events/chart?series=matsusaka`).then((r) => r.json()).then(setMatsusaka).catch(() => {});
  }, []);
  useEffect(() => {
    const p = new URLSearchParams({ sort });
    if (continent) p.set("continent", continent);
    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/sale-events?${p}`).then((r) => r.json()).then(setEvents).catch(() => setEvents([]));
  }, [continent, sort]);

  const eliteSeries = useMemo(() => {
    if (!elite?.points) return [];
    const mk = (key: string, label: string, color: string) => ({
      label, color, pts: elite.points.filter((p: any) => p[key] != null).map((p: any) => ({ x: p.year, y: p[key] })),
    });
    return [mk("female", "Females (avg)", "#d9a441"), mk("bull", "Bulls (avg)", "#6d9995"),
      mk("embryo", "Embryos (avg)", "#c86b4e")].filter((s) => s.pts.length > 1);
  }, [elite]);

  const matSeries = useMemo(() => {
    if (!matsusaka?.points) return [];
    return [{ label: "Champion cow (¥)", color: "#c0574e", pts: matsusaka.points.filter((p: any) => p.champion).map((p: any) => ({ x: p.year, y: p.champion })) }];
  }, [matsusaka]);

  return (
    <div className="container section">
      <span className="pill roundup-pill">📊 SALE REPORTS</span>
      <h1 style={{ fontSize: "2.2rem", marginTop: 12 }}>The world's Wagyu sale record</h1>
      <div className="roundup-banner" style={{ maxWidth: "80ch", marginTop: 14 }}>
        <p className="muted" style={{ margin: 0, lineHeight: 1.7 }}>
          A forensic, chronological record of Wagyu genetics and cattle auctions worldwide — averages and
          top prices for bulls, females, semen, and embryos, charted over the years. <strong className="gold">Every
          figure is sourced.</strong>
          {stats && <span className="faint"> {stats.total} sales recorded, {stats.year_min}–{stats.year_max}, across {Object.keys(stats.by_continent || {}).length} continents. A growing record — we add sales as we verify them.</span>}
        </p>
      </div>

      {/* Charts */}
      {eliteSeries.length > 0 && (
        <div className="card card-pad" style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: "1.15rem", marginTop: 0 }}>AWA Elite Wagyu Sale — average price by year <span className="faint" style={{ fontWeight: 400, fontSize: "0.85rem" }}>(AUD)</span></h2>
          <LineChart series={eliteSeries} />
        </div>
      )}
      {matSeries[0]?.pts.length > 1 && (
        <div className="card card-pad" style={{ marginTop: 16 }}>
          <h2 style={{ fontSize: "1.15rem", marginTop: 0 }}>Matsusaka champion cow — auction price by year <span className="faint" style={{ fontWeight: 400, fontSize: "0.85rem" }}>(¥, millions)</span></h2>
          <LineChart series={[{ ...matSeries[0], pts: matSeries[0].pts.map((p: { x: number; y: number }) => ({ x: p.x, y: p.y / 1e6 })) }]} height={180} />
        </div>
      )}

      {/* Filters */}
      <div className="row wrap" style={{ gap: 8, margin: "26px 0 8px", alignItems: "center" }}>
        <span className="faint" style={{ fontSize: "0.82rem" }}>🌍 Region:</span>
        <button className={`pill ${continent === "" ? "" : "pill-dim"}`} style={{ cursor: "pointer" }} onClick={() => setContinent("")}>All</button>
        {(stats?.continents || []).map((c: any) => (
          <button key={c.key} className={`pill ${continent === c.key ? "" : "pill-dim"}`} style={{ cursor: "pointer" }}
            onClick={() => setContinent(c.key)}>{CONT_FLAG[c.key]} {c.label}{stats?.by_continent?.[c.key] ? ` (${stats.by_continent[c.key]})` : ""}</button>
        ))}
        <div className="spacer" />
        <select className="select" style={{ width: "auto" }} value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="recent">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="top">Top price</option>
        </select>
      </div>

      {/* Table */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Sale</th><th>Date</th><th>Top price</th><th>Bull avg</th><th>Female avg</th><th>Semen avg</th><th>Embryo avg</th><th>Gross</th><th></th></tr></thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id}>
                <td><div style={{ fontWeight: 600 }}>{COUNTRY_FLAG[e.country] || "🌍"} {e.sale_name}</div>
                  {e.venue && <div className="faint" style={{ fontSize: "0.72rem" }}>{e.venue}</div>}</td>
                <td style={{ whiteSpace: "nowrap" }}>{e.date || e.year}</td>
                <td>{money(e.top_price, e.currency)}{e.top_price_item && <div className="faint" style={{ fontSize: "0.68rem", maxWidth: 160 }}>{e.top_price_item}</div>}</td>
                <td>{money(e.bull_avg, e.currency)}</td>
                <td>{money(e.female_avg, e.currency)}</td>
                <td>{money(e.semen_avg, e.currency)}</td>
                <td>{money(e.embryo_avg, e.currency)}</td>
                <td>{money(e.gross_total, e.currency)}</td>
                <td>{e.source_url && <a href={e.source_url} target="_blank" rel="noopener noreferrer" className="faint" style={{ textDecoration: "underline", fontSize: "0.72rem" }}>{e.source_name || "source"} ↗</a>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="help" style={{ marginTop: 20 }}>
        Prices in each sale's local currency. This record is thorough but not exhaustive — many small sales were never
        published. Know a Wagyu sale we're missing? We'll add it. Currency conversions on the charts are indicative.
      </p>
    </div>
  );
}
