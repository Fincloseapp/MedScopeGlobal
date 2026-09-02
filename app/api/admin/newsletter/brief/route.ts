import { NextResponse } from "next/server";
import { isAdminApiAuthorized } from "@/lib/auth/admin-api";
import { SITE } from "@/lib/config/site";
import {
  sendViaLongeVitaTestBrief,
  sendViaLongeVitaWeeklyBrief,
} from "@/lib/monetization/vialongevita-brief";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(request: Request) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    action?: string;
    locale?: string;
    email?: string;
  };
  const action = body.action ?? "dryRun";

  try {
    if (action === "test") {
      const email = (body.email ?? SITE.adminNotifyEmail).trim();
      const result = await sendViaLongeVitaTestBrief({
        email,
        locale: body.locale ?? "cs",
      });
      if (!result.ok) {
        return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
      }
      return NextResponse.json({ ok: true, sentTo: email });
    }

    const outcome = await sendViaLongeVitaWeeklyBrief({ dryRun: true });
    return NextResponse.json(outcome, { status: outcome.ok ? 200 : 500 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "brief failed" },
      { status: 500 }
    );
  }
}
