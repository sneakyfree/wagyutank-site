/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export", // static export for Cloudflare Pages
  images: { unoptimized: true },
  trailingSlash: true,
  env: {
    // One env var drives a clone build: TANK_API points at the tank's API, and the
    // runtime API base follows it automatically (falls back to WagyuTank).
    NEXT_PUBLIC_API_BASE:
      process.env.NEXT_PUBLIC_API_BASE || process.env.TANK_API || "https://api.wagyutank.com",
  },
};

module.exports = nextConfig;
