import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  ...(isProduction
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]
    : []),
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${isProduction ? "" : " 'unsafe-eval'"} https://www.googletagmanager.com https://www.google-analytics.com https://js.stripe.com`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://www.google-analytics.com https://*.ingest.sentry.io https://*.supabase.co wss://*.supabase.co https://api.stripe.com",
      "frame-src https://js.stripe.com https://hooks.stripe.com",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join("; ")
  }
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg", "prisma"],
  outputFileTracingIncludes: {
    "/api/**/*": ["./prisma/**"]
  },
  experimental: { optimizePackageImports: ["zod"] },
  async headers() { return [{ source: "/(.*)", headers: securityHeaders }]; }
};

export default nextConfig;
