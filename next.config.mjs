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

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.symlinks = false;
    return config;
  },
  serverExternalPackages: ["pdf-parse", "mammoth", "tesseract.js"],
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  
  async redirects() {
    return [
      { source: "/rubrics", destination: "/sections", permanent: true },
      {
        source: "/rubrics/:slug",
        destination: "/sections",
        permanent: false,
      },
    ];
  },
  
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/fonts/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
  
  images: {
    remotePatterns: supabasePatterns,
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
  },
};

export default nextConfig;
