# WagyuTank.com — Website (frontend)

The public marketplace UI for [WagyuTank.com](https://www.wagyutank.com) — the world's marketplace for frozen Wagyu genetics (semen, embryos, cloning rights).

Next.js (App Router, React 19), mobile-first. Deploys to **Cloudflare Pages**. Talks to the backend API (repo `sneakyfree/wagyutank`) at `https://api.wagyutank.com`.

## Develop

```bash
npm install
cp .env.local.example .env.local     # NEXT_PUBLIC_API_BASE -> API URL
npm run dev                          # http://localhost:3000
```

## Build / deploy

Static-optimized Next build, deployed to Cloudflare Pages via `@cloudflare/next-on-pages`:

```bash
npm run pages:build      # -> .vercel/output/static (CF Pages adapter)
npm run deploy           # wrangler pages deploy
```

- **Production API base:** set `NEXT_PUBLIC_API_BASE=https://api.wagyutank.com` as a Pages build env var.
- **Pages project:** `wagyutank` → serves `www.wagyutank.com` + apex.

Backend lives in the private repo `sneakyfree/wagyutank` (FastAPI on the VPS).
