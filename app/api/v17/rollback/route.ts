import { NextResponse } from "next/server";

/** Rollback via Cloudflare dashboard — Workers → medscopeglobal → Deployments. */
export async function POST() {
  return NextResponse.json(
    {
      rolledBackTo: null,
      status: "use_cloudflare_dashboard",
      message:
        "Use Cloudflare Dashboard → Workers & Pages → medscopeglobal → Deployments → retry a previous version.",
      domain: "https://medscopeglobal.com",
      dashboard: "https://dash.cloudflare.com",
    },
    { status: 200 }
  );
}
