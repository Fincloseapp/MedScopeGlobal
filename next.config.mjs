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

  serverExternalPackages: ["pdf-parse", "mammoth", "tesseract.js"],

  outputFileTracingIncludes: {
    "/api/v25/system/run": V25_MJS_TRACE,
    "/api/cron/public-articles": V25_MJS_TRACE,
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

        source: "/admin/:path*",

        headers: [

          { key: "X-Content-Type-Options", value: "nosniff" },

          { key: "X-Frame-Options", value: "SAMEORIGIN" },

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

        source: "/:path*",

        headers: [

          { key: "X-Content-Type-Options", value: "nosniff" },

          { key: "X-Frame-Options", value: "SAMEORIGIN" },

          { key: "X-XSS-Protection", value: "1; mode=block" },

          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

          { key: "Vercel-Cache-Tag", value: CACHE_TAGS },

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

    ],

    formats: ["image/avif", "image/webp"],

    minimumCacheTTL: 31536000,

  },

};



export default nextConfig;


