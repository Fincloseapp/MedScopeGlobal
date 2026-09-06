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



const CACHE_TAGS = "medscope-ui-v23.61,medscope-pages,v23-content";



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
      // MASTER_PROMPT ecosystem aliases (unprefixed; locale pages also redirect)
      { source: "/vip", destination: "/vip/protokoly", permanent: false },
      { source: "/vitascope", destination: "/", permanent: false },
      {
        source: "/article/verejnost-rozhovory-2026-07-03-cesta-zpet-k-zivotu-pribeh-mudr-novaka-po-infarktu",
        destination: "/article/verejnost-rozhovory-2026-07-03-cesta-zpet-k-zivotu-pribeh-lekare-po-infarktu",
        permanent: false,
      },
      {
        source: "/verejnost/clanky/verejnost-rozhovory-2026-07-03-cesta-zpet-k-zivotu-pribeh-mudr-novaka-po-infarktu",
        destination: "/verejnost/clanky/verejnost-rozhovory-2026-07-03-cesta-zpet-k-zivotu-pribeh-lekare-po-infarktu",
        permanent: false,
      },
      { source: "/vialongevita", destination: "/", permanent: false },
      { source: "/magazine", destination: "/articles", permanent: false },
      { source: "/affiliate", destination: "/aplikace", permanent: false },
      // Tips / donations live on public articles — keep separate from VIP Longevity
      { source: "/tips", destination: "/articles", permanent: false },
      { source: "/tipy", destination: "/articles", permanent: false },
      { source: "/tip", destination: "/articles", permanent: false },
      { source: "/newsletter/thank-you", destination: "/newsletter/dekujeme", permanent: false },
      {
        source: "/:locale/newsletter/thank-you",
        destination: "/:locale/newsletter/dekujeme",
        permanent: false,
      },
      { source: "/tringelt", destination: "/articles", permanent: false },
      { source: "/prispevek", destination: "/articles", permanent: false },
      { source: "/donate", destination: "/articles", permanent: false },
      { source: "/podpora", destination: "/articles", permanent: false },

      // MeDiktor → OrdiZapis asset aliases (installed PWAs / old caches)
      { source: "/assets/mediktor/:path*", destination: "/assets/ordizapis/:path*", permanent: false },
      { source: "/assets/marketing/mediktor-cs.webp", destination: "/assets/marketing/ordizapis-phone-v2.webp", permanent: false },
      { source: "/assets/marketing/mediktor.webp", destination: "/assets/marketing/ordizapis-phone-v2.webp", permanent: false },
      { source: "/assets/marketing/ordizapis-cs.webp", destination: "/assets/marketing/ordizapis-phone-v2.webp", permanent: false },
      { source: "/assets/marketing/ordizapis.webp", destination: "/assets/marketing/ordizapis-phone-v2.webp", permanent: false },

      { source: "/app/medipacient", destination: "/app/pacient", permanent: false },
      { source: "/app/mediprep", destination: "/app/priprava", permanent: false },
      { source: "/medipacient/app", destination: "/app/pacient", permanent: false },
      { source: "/mediprep/app", destination: "/app/priprava", permanent: false },

      { source: "/pro-lekare", destination: "/lekari", permanent: true },
      { source: "/:locale/pro-lekare", destination: "/:locale/lekari", permanent: true },
      { source: "/pro-me/lekari", destination: "/lekari", permanent: true },
      { source: "/:locale/pro-me/lekari", destination: "/:locale/lekari", permanent: true },

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



  async rewrites() {
    const localeSegments = [
      "cs",
      "sk",
      "pl",
      "de",
      "fr",
      "it",
      "es",
      "ro",
      "hu",
      "ru",
      "uk",
      "be",
      "cn",
      "jp",
      "kr",
      "vi",
      "id",
      "en",
      "en-us",
      "en-uk",
      "pt",
      "pt-br",
    ];
    return [
      {
        source: "/__ms/:path*",
        destination: "/relay/:path*",
      },
      {
        source: "/sitemap-:locale.xml",
        destination: "/sitemaps/:locale",
      },
      {
        source: "/feed-:locale.xml",
        destination: "/feed/:locale",
      },
      ...localeSegments.flatMap((segment) => [
        { source: `/${segment}`, destination: "/" },
        { source: `/${segment}/:path*`, destination: "/:path*" },
      ]),
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
      {
        source: "/studenti",
        headers: [
          { key: "Cache-Control", value: "private, no-cache, no-store, must-revalidate" },
        ],
      },
      {
        source: "/studenti/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-cache, no-store, must-revalidate" },
        ],
      },
      {
        source: "/:locale/studenti",
        headers: [
          { key: "Cache-Control", value: "private, no-cache, no-store, must-revalidate" },
        ],
      },
      {
        source: "/:locale/studenti/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-cache, no-store, must-revalidate" },
        ],
      },
      {
        source: "/lekari",
        headers: [
          { key: "Cache-Control", value: "private, no-cache, no-store, must-revalidate" },
        ],
      },
      {
        source: "/lekari/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-cache, no-store, must-revalidate" },
        ],
      },
      {
        source: "/:locale/lekari",
        headers: [
          { key: "Cache-Control", value: "private, no-cache, no-store, must-revalidate" },
        ],
      },
      {
        source: "/:locale/lekari/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-cache, no-store, must-revalidate" },
        ],
      },

      {
        source: "/admin",
        headers: [
          { key: "Cache-Control", value: "private, no-cache, no-store, must-revalidate" },
        ],
      },
      {
        source: "/admin/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-cache, no-store, must-revalidate" },
        ],
      },
      {
        source: "/api/v21/admin-gate",
        headers: [
          { key: "Cache-Control", value: "private, no-cache, no-store, must-revalidate" },
        ],
      },
      {
        source: "/go/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-cache, no-store, must-revalidate" },
        ],
      },
      {
        source: "/relay/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-cache, no-store, must-revalidate" },
        ],
      },
      {
        source: "/relay/js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=300, stale-while-revalidate=86400" },
        ],
      },
      {
        source: "/__ms/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-cache, no-store, must-revalidate" },
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

// OpenNext local bindings for `next dev` only. The Workers `AI` binding makes
// wrangler open a remote proxy; CI `next build` has no CLOUDFLARE_API_TOKEN.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
const skipCloudflareDevInit =
  process.env.CI === "true" ||
  process.env.NEXTJS_ENV === "production" ||
  process.env.npm_lifecycle_event === "build";
if (!skipCloudflareDevInit) {
  initOpenNextCloudflareForDev();
}
