export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8100";

function token(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("wt_token");
}

async function req(path: string, opts: RequestInit = {}): Promise<any> {
  const headers: Record<string, string> = { ...(opts.headers as any) };
  if (opts.body && !headers["Content-Type"]) headers["Content-Type"] = "application/json";
  const t = token();
  if (t) headers["Authorization"] = `Bearer ${t}`;
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const j = await res.json();
      detail = j.detail || detail;
    } catch {}
    throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  // auth
  register: (body: any) => req("/api/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: async (email: string, password: string) => {
    const form = new URLSearchParams({ username: email, password });
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || "Login failed");
    return res.json();
  },
  me: () => req("/api/auth/me"),
  twofaVerify: (challenge: string, code: string) => req("/api/auth/2fa/verify", { method: "POST", body: JSON.stringify({ challenge, code }) }),
  twofaSetup: () => req("/api/auth/2fa/setup", { method: "POST" }),
  twofaEnable: (code: string) => req("/api/auth/2fa/enable", { method: "POST", body: JSON.stringify({ code }) }),
  twofaDisable: (code: string) => req("/api/auth/2fa/disable", { method: "POST", body: JSON.stringify({ code }) }),
  forgotPassword: (email: string) => req("/api/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),
  resetPassword: (token: string, new_password: string) => req("/api/auth/reset-password", { method: "POST", body: JSON.stringify({ token, new_password }) }),
  adminAnalytics: () => req("/api/admin/analytics"),
  adminHealth: () => req("/api/admin/health"),
  track: (type: string, meta?: any) => {
    try {
      const sid = (() => { let s = localStorage.getItem("wt_sid"); if (!s) { s = Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem("wt_sid", s); } return s; })();
      const body = JSON.stringify({ type, session_id: sid, path: location.pathname, referrer: document.referrer && !document.referrer.includes(location.host) ? document.referrer : undefined, meta });
      navigator.sendBeacon?.(`${API_BASE}/api/events`, new Blob([body], { type: "application/json" })) ||
        fetch(`${API_BASE}/api/events`, { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true });
    } catch {}
  },
  becomeSeller: () => req("/api/users/me/become-seller", { method: "POST" }),
  updateMe: (body: any) => req("/api/users/me", { method: "PATCH", body: JSON.stringify(body) }),

  // animals / registry
  lookupAnimal: (q: string) => req(`/api/animals/lookup?q=${encodeURIComponent(q)}`),
  suggestAnimals: (q: string) => req(`/api/animals/suggest?q=${encodeURIComponent(q)}`),
  foundation: (bloodline?: string) =>
    req(`/api/animals/foundation${bloodline ? `?bloodline=${encodeURIComponent(bloodline)}` : ""}`),
  animal: (reg: string) => req(`/api/animals/${encodeURIComponent(reg)}`),
  animalOffers: (reg: string) => req(`/api/animals/${encodeURIComponent(reg)}/offers`),
  animalPriceHistory: (reg: string) => req(`/api/animals/${encodeURIComponent(reg)}/price-history`),
  animalVideos: (reg: string) => req(`/api/animals/${encodeURIComponent(reg)}/videos`),
  animalZenkyo: (reg: string) => req(`/api/animals/${encodeURIComponent(reg)}/zenkyo`),
  zenkyo: () => req("/api/zenkyo"),
  canon: (lang = "en") => req(`/api/canon?lang=${lang}`),
  feeding: (lang = "en") => req(`/api/feeding?lang=${lang}`),
  zenkyoEvent: (n: number | string) => req(`/api/zenkyo/event/${n}`),
  zenkyoInterest: (body: any) => req("/api/zenkyo/interest", { method: "POST", body: JSON.stringify(body) }),
  videos: (params: Record<string, any> = {}) => req(`/api/videos?${new URLSearchParams(clean(params))}`),
  videoCharts: () => req("/api/videos/charts"),
  video: (id: number | string) => req(`/api/videos/${id}`),
  videoUploadIntent: (content_type: string, size: number) => req("/api/videos/upload-intent", { method: "POST", body: JSON.stringify({ content_type, size }) }),
  videoUploadComplete: (key: string, title: string, animal_reg?: string) => req("/api/videos/upload-complete", { method: "POST", body: JSON.stringify({ key, title, animal_reg: animal_reg ?? null, description: null }) }),
  claimChannel: (channel_id: string, channel: string, note?: string) => req("/api/videos/channels/claim", { method: "POST", body: JSON.stringify({ channel_id, channel, note: note ?? null }) }),
  submitAnimalVideo: (reg: string, title: string, video_url: string) =>
    req(`/api/animals/${encodeURIComponent(reg)}/videos`, { method: "POST", body: JSON.stringify({ title, video_url }) }),
  animalComments: (reg: string, lang = "en") => req(`/api/animals/${encodeURIComponent(reg)}/comments?lang=${lang}`),
  postComment: (reg: string, body: string, parent_id?: number, lang = "en") => req(`/api/animals/${encodeURIComponent(reg)}/comments`, { method: "POST", body: JSON.stringify({ body, parent_id: parent_id ?? null, lang }) }),
  likeComment: (id: number) => req(`/api/comments/${id}/like`, { method: "POST" }),

  // facilities
  facilities: (q?: string) => req(`/api/facilities${q ? `?q=${encodeURIComponent(q)}` : ""}`),

  // listings
  browse: (params: Record<string, any> = {}) =>
    req(`/api/listings?${new URLSearchParams(clean(params))}`),
  listing: (id: number | string) => req(`/api/listings/${id}`),
  myListings: () => req("/api/listings/mine"),
  createListing: (body: any) => req("/api/listings", { method: "POST", body: JSON.stringify(body) }),
  bid: (id: number, amount: number) =>
    req(`/api/listings/${id}/bid`, { method: "POST", body: JSON.stringify({ amount }) }),
  feature: (id: number, days = 7) => req(`/api/listings/${id}/feature?days=${days}`, { method: "POST" }),
  catalogOptIn: (id: number, opt_in: boolean) =>
    req(`/api/listings/${id}/catalog`, { method: "POST", body: JSON.stringify({ opt_in }) }),
  adCopy: (body: any) => req("/api/listings/ai/ad-copy", { method: "POST", body: JSON.stringify(body) }),

  // search
  search: (params: Record<string, any> = {}) =>
    req(`/api/search?${new URLSearchParams(clean(params))}`),
  facets: () => req("/api/search/facets"),

  // payments
  paymentsConfig: () => req("/api/payments/config"),
  quote: (listingId: number | string) => req(`/api/payments/quote/${listingId}`),
  onboard: () => req("/api/payments/connect/onboard", { method: "POST" }),
  buyIntent: (listingId: number) => req(`/api/payments/buy/${listingId}`, { method: "POST" }),
  featureIntent: (listingId: number, days = 7) =>
    req(`/api/payments/feature/${listingId}?days=${days}`, { method: "POST" }),

  // screenshot -> pedigree extraction
  extractPedigree: async (fileFieldForm: FormData) => {
    const t = typeof window !== "undefined" ? localStorage.getItem("wt_token") : null;
    const res = await fetch(`${API_BASE}/api/animals/extract`, {
      method: "POST",
      headers: t ? { Authorization: `Bearer ${t}` } : {},
      body: fileFieldForm,
    });
    if (!res.ok) throw new Error("Extraction failed");
    return res.json();
  },

  // The Roundup (aggregated public listings from around the web)
  roundup: (params: Record<string, any> = {}) => req(`/api/roundup?${new URLSearchParams(clean(params))}`),
  roundupStats: () => req("/api/roundup/stats"),
  priceIndex: () => req("/api/roundup/index"),
  market: () => req("/api/market"),
  marketTicker: () => req("/api/market/ticker"),
  sales: (window?: string) => req(`/api/sales${window ? `?window=${window}` : ""}`),
  saleEvents: (params: Record<string, any> = {}) => req(`/api/sale-events?${new URLSearchParams(clean(params))}`),
  saleEventStats: () => req("/api/sale-events/stats"),
  saleEventChart: (series: string) => req(`/api/sale-events/chart?series=${series}`),
  saleTicker: () => req("/api/sale-events/ticker"),
  roundupGoUrl: (id: number) => `${API_BASE}/api/roundup/${id}/go`,
  roundupFlag: (id: number, email: string) =>
    req(`/api/roundup/${id}/flag`, { method: "POST", body: JSON.stringify({ email }) }),

  // Help & FAQ
  faq: (lang = "en") => req(`/api/help?lang=${lang}`),
  helpAsk: (question: string, lang = "en") =>
    req("/api/help/ask", { method: "POST", body: JSON.stringify({ question, lang }) }),

  // The Wagyu Atlas (seller directory)
  directory: (params: Record<string, any> = {}) =>
    req(`/api/directory?${new URLSearchParams(clean(params))}`),
  directoryStats: () => req("/api/directory/stats"),

  // Claim-your-listings + email verification
  claimable: () => req("/api/users/me/claimable"),
  claimListings: (listing_ids?: number[]) =>
    req("/api/users/me/claim", { method: "POST", body: JSON.stringify({ listing_ids: listing_ids || null }) }),
  sendVerify: () => req("/api/auth/send-verify", { method: "POST" }),

  // Ads / advertisers
  ads: (placement: string) => req(`/api/ads?placement=${placement}`),
  adsPricing: () => req("/api/ads/pricing"),
  adImpression: (id: number) => req(`/api/ads/${id}/impression`, { method: "POST" }).catch(() => {}),
  adGoUrl: (id: number) => `${API_BASE}/api/ads/${id}/go`,
  submitAd: (payload: any) => req("/api/ads/submit", { method: "POST", body: JSON.stringify(payload) }),

  // Admin control panel (require_admin)
  adminOverview: () => req("/api/admin/overview"),
  adminUsers: (params: Record<string, any> = {}) => req(`/api/admin/users?${new URLSearchParams(clean(params))}`),
  adminUserAction: (id: number, action: string, role?: string) => req(`/api/admin/users/${id}/action`, { method: "POST", body: JSON.stringify(role ? { action, role } : { action }) }),
  adminMessageUser: (id: number, subject: string, body: string) => req(`/api/admin/users/${id}/message`, { method: "POST", body: JSON.stringify({ subject, body }) }),
  adminVideos: (params: Record<string, any> = {}) => req(`/api/admin/videos?${new URLSearchParams(clean(params))}`),
  adminVideoAction: (id: number, action: string, category?: string) => req(`/api/admin/videos/${id}/action`, { method: "POST", body: JSON.stringify(category ? { action, category } : { action }) }),
  adminVideoClaims: (status = "pending") => req(`/api/admin/video-claims?status=${status}`),
  adminVideoClaimAction: (id: number, action: string) => req(`/api/admin/video-claims/${id}/action`, { method: "POST", body: JSON.stringify({ action }) }),
  adminCatalogSubmissions: (params: Record<string, any> = {}) => req(`/api/admin/catalog/submissions?${new URLSearchParams(clean(params))}`),
  adminCatalogAction: (id: number, action: string) => req(`/api/admin/catalog/submissions/${id}/action`, { method: "POST", body: JSON.stringify({ action }) }),
  adminCatalogCsv: async (edition?: string) => {
    const t = typeof window !== "undefined" ? localStorage.getItem("wt_token") : null;
    const res = await fetch(`${API_BASE}/api/admin/catalog-submissions.csv${edition ? `?edition=${encodeURIComponent(edition)}` : ""}`, { headers: t ? { Authorization: `Bearer ${t}` } : {} });
    return res.text();
  },
  // Catalog (public + member)
  catalogInfo: () => req("/api/catalog/info"),
  catalogSubmit: (payload: any) => req("/api/catalog/submit", { method: "POST", body: JSON.stringify(payload) }),
  catalogMySubmissions: () => req("/api/catalog/my-submissions"),
  adminSettings: () => req("/api/admin/settings"),
  adminPutSettings: (updates: any) => req("/api/admin/settings", { method: "PUT", body: JSON.stringify(updates) }),
  adminAiTest: (prompt?: string) => req("/api/admin/ai/test", { method: "POST", body: JSON.stringify(prompt ? { prompt } : {}) }),
  adminRoundup: (flagged = false) => req(`/api/admin/roundup?flagged=${flagged}`),
  adminRoundupAction: (id: number, action: string) => req(`/api/admin/roundup/${id}/action`, { method: "POST", body: JSON.stringify({ action }) }),
  adminRoundupRun: () => req("/api/admin/roundup/run", { method: "POST" }),
  adminAds: (status?: string) => req(`/api/admin/ads${status ? `?status=${status}` : ""}`),
  adminAdAction: (id: number, action: string) => req(`/api/admin/ads/${id}/action`, { method: "POST", body: JSON.stringify({ action }) }),
  adminAudit: () => req("/api/admin/audit"),
  adminCampaigns: () => req("/api/admin/campaigns"),
  adminCampaignTest: (subject: string, body_html: string) => req("/api/admin/campaign/test", { method: "POST", body: JSON.stringify({ subject, body_html }) }),
  adminCampaignSend: (subject: string, body_html: string, segment: string) => req("/api/admin/campaign/send", { method: "POST", body: JSON.stringify({ subject, body_html, segment }) }),
  adminDigestTest: () => req("/api/admin/digest/test", { method: "POST" }),
  adminDigestSend: () => req("/api/admin/digest/send", { method: "POST" }),
  adminEmailList: async () => {
    const t = typeof window !== "undefined" ? localStorage.getItem("wt_token") : null;
    const res = await fetch(`${API_BASE}/api/admin/email-list.csv`, { headers: t ? { Authorization: `Bearer ${t}` } : {} });
    return res.text();
  },

  // Wagyu News
  news: (params: Record<string, any> = {}) => req(`/api/news?${new URLSearchParams(clean(params))}`),
  newsRegions: () => req("/api/news/regions"),
  newsHighlights: () => req("/api/news/highlights"),
  newsYears: () => req("/api/news/years"),
  newsGoUrl: (id: number) => `${API_BASE}/api/news/${id}/go`,
  upcomingSales: (params: Record<string, any> = {}) => req(`/api/upcoming-sales?${new URLSearchParams(clean(params))}`),

  // storefront + social
  storefront: (handle: string) => req(`/api/users/${encodeURIComponent(handle)}`),
  follow: (target_type: string, target_key: string) => req("/api/users/me/follow", { method: "POST", body: JSON.stringify({ target_type, target_key }) }),
  unfollow: (target_type: string, target_key: string) => req("/api/users/me/unfollow", { method: "POST", body: JSON.stringify({ target_type, target_key }) }),
  feed: () => req("/api/users/me/feed"),
  following: () => req("/api/users/me/following"),
  ordersMine: () => req("/api/orders/mine"),
  rateOrder: (id: number, score: number, comment?: string) => req(`/api/orders/${id}/rate`, { method: "POST", body: JSON.stringify({ score, comment: comment || null }) }),
  userReviews: (handle: string) => req(`/api/orders/user/${encodeURIComponent(handle)}/reviews`),
  breedHistory: (lang = "en") => req(`/api/content/breed-history?lang=${lang}`),
  translate: (text: string, lang = "es") => req("/api/translate", { method: "POST", body: JSON.stringify({ text, lang }) }),
  translateBatch: (items: { id: number; text: string }[], lang = "es") => req("/api/translate/batch", { method: "POST", body: JSON.stringify({ items, lang }) }),
  newsArticle: (id: number, lang = "en") => req(`/api/news/${id}?lang=${lang}`),
};

// Freshness signal for a Roundup listing — source-updated date if known, else our own index date.
export function freshness(l: any): { label: string; cls: string; title: string } | null {
  const fmt = (d: Date) => d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
  if (l?.source_updated_at) {
    const d = new Date(l.source_updated_at);
    const months = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 30.4);
    const cls = months < 3 ? "fresh-green" : months < 12 ? "fresh-amber" : "fresh-red";
    const src = { shopify: "the seller's store", "page-header": "the source page", stated: "the ad itself" }[
      l.source_date_type as string] || "the source";
    return { label: `Updated ${fmt(d)}`, cls, title: `Source last updated ${d.toLocaleDateString()} (per ${src})` };
  }
  if (l?.first_seen_at) {
    const d = new Date(l.first_seen_at);
    return { label: `Indexed ${fmt(d)}`, cls: "fresh-neutral",
      title: "The source doesn't publish its own update date — this is when WagyuTank first indexed it (still confirmed live)." };
  }
  return null;
}

function clean(p: Record<string, any>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(p)) {
    if (v !== undefined && v !== null && v !== "") out[k] = String(v);
  }
  return out;
}

export const PRODUCT_GLYPH: Record<string, string> = {
  semen: "🧬",
  embryo: "🥚",
  clone_rights: "🐂",
};
export const PRODUCT_LABEL: Record<string, string> = {
  semen: "Semen",
  embryo: "Embryo",
  clone_rights: "Cloning Rights",
};

// ---- Export eligibility + international helpers ----
export const EXPORT_REGIONS = [
  { code: "EU", label: "European Union", flag: "🇪🇺" },
  { code: "AUS", label: "Australia", flag: "🇦🇺" },
  { code: "CAN", label: "Canada", flag: "🇨🇦" },
  { code: "MEX", label: "Mexico", flag: "🇲🇽" },
  { code: "BR", label: "Brazil / S. America", flag: "🇧🇷" },
  { code: "UK", label: "United Kingdom", flag: "🇬🇧" },
  { code: "CN", label: "China / Asia", flag: "🇨🇳" },
  { code: "NZ", label: "New Zealand", flag: "🇳🇿" },
  { code: "JP", label: "Japan", flag: "🇯🇵" },
];

export const WORLD_REGIONS = [
  { code: "NA", label: "North America", flag: "🌎" },
  { code: "SA", label: "South America", flag: "🌎" },
  { code: "CAM", label: "Central America", flag: "🌎" },
  { code: "EU", label: "Europe", flag: "🇪🇺" },
  { code: "AU", label: "Australia / Oceania", flag: "🇦🇺" },
  { code: "AS", label: "Asia", flag: "🌏" },
];

export function countryFlag(cc?: string | null): string {
  if (!cc || cc.length !== 2) return "";
  const A = 0x1f1e6;
  const up = cc.toUpperCase();
  return String.fromCodePoint(A + up.charCodeAt(0) - 65) + String.fromCodePoint(A + up.charCodeAt(1) - 65);
}

export function cssLabel(status?: string): { text: string; cls: string } {
  if (status === "css") return { text: "CSS — export-eligible", cls: "pill-green" };
  if (status === "domestic") return { text: "Domestic only (non-CSS)", cls: "pill-red" };
  return { text: "Export status not stated", cls: "pill-dim" };
}

export function money(n: number | null | undefined, ccy = "USD"): string {
  if (n === null || n === undefined) return "—";
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: ccy, maximumFractionDigits: 0 }).format(n);
  } catch {
    return `$${n}`;
  }
}
