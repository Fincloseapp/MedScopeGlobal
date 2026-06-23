import { NextResponse } from "next/server";

/** Rollback via Vercel Dashboard — Deployments → previous → Promote to Production. */
export async function POST() {
  return NextResponse.json(
    {
      rolledBackTo: null,
      status: "use_vercel_dashboard",
      message:
        "Local rollback scripts removed. Use Vercel Dashboard → Deployments → Promote previous deployment to Production.",
      domain: "https://medscopeglobal.com",
      dashboard: "https://vercel.com/dashboard",
    },
    { status: 200 }
  );
}
