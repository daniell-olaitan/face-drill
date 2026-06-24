import type { NextConfig } from "next";

// Content-Security-Policy. Allows exactly what the app needs:
//  • Supabase (auth/realtime) over https + wss
//  • the Tavus / Daily.co video-call iframe (frame/connect/media)
//  • local fonts, and images from self/data/blob/https
// 'unsafe-inline' (styles + Next/Motion inline) and 'unsafe-eval' are pragmatic;
// the hardening path is nonce-based scripts — tighten once verified in prod.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.daily.co wss://*.daily.co https://*.tavus.io https://tavusapi.com",
  "frame-src 'self' https://*.daily.co https://*.tavus.io https://tavusapi.com",
  "media-src 'self' blob: https://*.daily.co",
  "worker-src 'self' blob:",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=self, microphone=self, geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "tavusapi.com" },
      { protocol: "https", hostname: "*.tavusapi.com" },
      { protocol: "https", hostname: "storage.googleapis.com" },
    ],
  },
};

export default nextConfig;
