import { NextResponse } from "next/server";
import { resolveGaMeasurementId } from "@/lib/analytics/ga";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ path: string[] }> };

/**
 * First-party hop for GA4. Browser talks to medscopeglobal.com;
 * this route forwards to Google so uBlock/AdGuard cannot see
 * googletagmanager.com / google-analytics.com on the page.
 *
 * Must not live under app/__ms — Next.js treats `_`-prefixed folders
 * as private, so that hop 404'd and Realtime stayed empty.
 */
async function proxy(request: Request, path: string[]) {
  const incoming = new URL(request.url);
  const segments = path.filter(Boolean);
  const first = segments[0] ?? "";
  const rest = segments.join("/");

  let dest: URL;
  if (first === "js") {
    dest = new URL("https://www.googletagmanager.com/gtag/js");
    dest.search = incoming.search;
    if (!dest.searchParams.get("id")) {
      dest.searchParams.set("id", resolveGaMeasurementId());
    }
  } else {
    dest = new URL(`https://www.google-analytics.com/${rest || "g/collect"}`);
    dest.search = incoming.search;
  }

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  const ua = request.headers.get("user-agent");
  if (ua) headers.set("user-agent", ua);
  const ip =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip");
  if (ip) headers.set("x-forwarded-for", ip.split(",")[0]!.trim());

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "follow",
  };
  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  try {
    const upstream = await fetch(dest.toString(), init);
    const out = new Headers();
    const pass = ["content-type", "cache-control", "access-control-allow-origin"];
    for (const key of pass) {
      const value = upstream.headers.get(key);
      if (value) out.set(key, value);
    }
    out.set("access-control-allow-origin", incoming.origin || "https://medscopeglobal.com");
    return new Response(upstream.body, { status: upstream.status, headers: out });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}

export async function GET(request: Request, { params }: Params) {
  const { path } = await params;
  return proxy(request, path);
}

export async function POST(request: Request, { params }: Params) {
  const { path } = await params;
  return proxy(request, path);
}
