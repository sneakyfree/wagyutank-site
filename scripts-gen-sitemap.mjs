import fs from "node:fs";
const BASE = "https://www.wagyutank.com";
const API = process.env.NEXT_PUBLIC_API_BASE || "https://api.wagyutank.com";
const staticRoutes = [
  ["/", 1.0, "daily"], ["/browse/", 0.9, "daily"], ["/roundup/", 0.9, "daily"],
  ["/news/", 0.9, "hourly"], ["/market/", 0.8, "daily"], ["/sales/", 0.8, "weekly"], ["/sale-reports/", 0.85, "weekly"], ["/catalog/", 0.8, "monthly"], ["/videos/", 0.9, "daily"], ["/japan/", 0.9, "daily"], ["/zenkyo/", 0.85, "weekly"], ["/great-sires/", 0.85, "monthly"],
  ["/history/", 0.8, "monthly"], ["/foundation/", 0.9, "weekly"], ["/advertise/", 0.5, "monthly"],
  ["/sell/", 0.6, "monthly"], ["/register/", 0.4, "yearly"], ["/login/", 0.3, "yearly"],
];
const now = new Date().toISOString();
let urls = staticRoutes.map(([p, pr, f]) =>
  `  <url><loc>${BASE}${p}</loc><lastmod>${now}</lastmod><changefreq>${f}</changefreq><priority>${pr}</priority></url>`);
try {
  const animals = await fetch(`${API}/api/animals/foundation`).then(r => r.json());
  for (const a of animals) { const slug = a.slug || a.registration_no;
    if (slug && /^[A-Za-z0-9._-]+$/.test(slug))
      urls.push(`  <url><loc>${BASE}/animal/${slug}/</loc><lastmod>${now}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`); }
  console.log(`sitemap: ${staticRoutes.length} static + ${animals.length} animal URLs`);
} catch (e) { console.log("sitemap: animal fetch failed, static only", e.message); }
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
fs.writeFileSync("public/sitemap.xml", xml);
