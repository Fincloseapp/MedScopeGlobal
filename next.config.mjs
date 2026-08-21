/** @type {import('next').NextConfig} */

const supabasePatterns = [];

try {

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (url) {

    const { hostname } = new URL(url);

    supabasePatterns.push({

      protocol: "https",

      hostname,

      pathname: "/storage/v1/object/public/**",

    });

  }

} catch {

  // ignore invalid env at build time

}



const CACHE_TAGS = "medscope-ui-v23.0,medscope-pages,v23-content";



/** @type {import('next').NextConfig} */

/** v25 cron/runners load .mjs via runtime path — must ship in serverless bundles */
const V25_MJS_TRACE = ["./lib/v25/**/*.mjs"];

const nextConfig = {

  eslint: {
    ignoreDuringBuilds: true,
  },

  serverExternalPackages: ["pdf-parse", "mammoth", "tesseract.js", "edge-tts-universal"],

  outputFileTracingIncludes: {
    "/api/v25/system/run": V25_MJS_TRACE,
    "/api/cron/public-articles": V25_MJS_TRACE,
    "/api/cron/public-osveta-daily": ["./node_modules/edge-tts-universal/**"],
    "/api/cron/v25-enterprise": V25_MJS_TRACE,
    "/api/cron/marketing": V25_MJS_TRACE,
  },

  compress: true,

  poweredByHeader: false,

  productionBrowserSourceMaps: false,



  async redirects() {

    return [

      { source: "/rubrics", destination: "/sections", permanent: true },

      { source: "/rubrics/:slug", destination: "/sections", permanent: false },

      { source: "/categories", destination: "/studie", permanent: true },

      { source: "/categories/:path*", destination: "/studie", permanent: true },

      { source: "/studium", destination: "/studenti", permanent: true },

      // Misleading hub titles → clear destinations
      { source: "/studenti/anatomie", destination: "/studenti/hry", permanent: true },
      { source: "/studenti/farmakologie", destination: "/studenti/leky", permanent: true },
      // Article hubs that were never implemented as standalone routes
      { source: "/studenti/clanky", destination: "/articles?med_track=studium", permanent: false },
      { source: "/lekari/clanky", destination: "/articles", permanent: false },
      { source: "/app/medipacient", destination: "/app/pacient", permanent: false },
      { source: "/app/mediprep", destination: "/app/priprava", permanent: false },
      { source: "/medipacient/app", destination: "/app/pacient", permanent: false },
      { source: "/mediprep/app", destination: "/app/priprava", permanent: false },

      { source: "/pro-lekare", destination: "/lekari", permanent: true },

      { source: "/pro-firmy", destination: "/firmy", permanent: true },

      { source: "/odbornici", destination: "/odborna", permanent: true },

      { source: "/odbornici/:path*", destination: "/odborna/:path*", permanent: true },

      {

        source: "/:path*",

        has: [{ type: "host", value: "www.medscopeglobal.com" }],

        destination: "https://medscopeglobal.com/:path*",

        permanent: true,

      },

    ];

  },



  async headers() {

    return [

      {

        source: "/admin",

        headers: [

          { key: "X-Content-Type-Options", value: "nosniff" },

          { key: "X-Frame-Options", value: "SAMEORIGIN" },

          { key: "Cache-Control", value: "private, no-cache, no-store, must-revalidate" },

        ],

      },

      {

        source: "/admin/:path*",

        headers: [

          { key: "X-Content-Type-Options", value: "nosniff" },

          { key: "X-Frame-Options", value: "SAMEORIGIN" },

          { key: "Cache-Control", value: "private, no-cache, no-store, must-revalidate" },

        ],

      },

      {

        source: "/dashboard",

        headers: [

          { key: "Cache-Control", value: "private, no-cache, no-store, must-revalidate" },

        ],

      },

      {

        source: "/dashboard/:path*",

        headers: [

          { key: "Cache-Control", value: "private, no-cache, no-store, must-revalidate" },

        ],

      },

      {

        source: "/app/pacient",

        headers: [

          { key: "Cache-Control", value: "private, no-cache, no-store, must-revalidate" },

          { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=()" },

        ],

      },

      {

        source: "/app/priprava",

        headers: [

          { key: "Cache-Control", value: "private, no-cache, no-store, must-revalidate" },

        ],

      },

      {

        source: "/app/dokumentace",

        headers: [

          { key: "Cache-Control", value: "private, no-cache, no-store, must-revalidate" },

          { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=()" },

        ],

      },

      {

        source: "/api/:path*",

        headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }],

      },

      {

        source: "/_next/static/:path*",

        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],

      },

      {

        source: "/fonts/:path*",

        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],

      },

      {
        source: "/sw-medipacient.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/sw-mediprep.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/sw-dokumentace.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },

      {

        source: "/:path*",

        headers: [

          { key: "X-Content-Type-Options", value: "nosniff" },

          { key: "X-Frame-Options", value: "SAMEORIGIN" },

          { key: "X-XSS-Protection", value: "1; mode=block" },

          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

          { key: "Cache-Tag", value: CACHE_TAGS },

          {

            key: "Cache-Control",

            value: "public, s-maxage=120, stale-while-revalidate=600",

          },

        ],

      },

    ];

  },



  images: {

    remotePatterns: [

      ...supabasePatterns,

      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "source.unsplash.com", pathname: "/**" },

    ],

    formats: ["image/avif", "image/webp"],

    minimumCacheTTL: 31536000,

  },

};



export default nextConfig;

// OpenNext Cloudflare local bindings for next dev
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
