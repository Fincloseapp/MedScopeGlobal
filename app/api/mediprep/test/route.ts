import { NextResponse } from "next/server";
import { buildPrepTest } from "@/lib/mediprep/dashboard";
import { getPrepSession } from "@/lib/mediprep/session";
import { MEDIPREP_FREE_TEST_COOKIE } from "@/lib/studenti/pricing";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getPrepSession();
  if (!session.entitled && session.firstTestUsed) {
    return NextResponse.json(
      {
        error: "free_test_used",
        subscribe: "/predplatne#student",
        message: "Volný test je vyčerpaný. Student LF: první měsíc 89 Kč, další 149 Kč.",
      },
      { status: 402 }
    );
  }

  const url = new URL(request.url);
  const test = buildPrepTest({
    mode: url.searchParams.get("mode") ?? undefined,
    subject: url.searchParams.get("subject") ?? undefined,
    faculty: url.searchParams.get("faculty") ?? undefined,
    count: url.searchParams.get("count") ? Number(url.searchParams.get("count")) : undefined,
    seed: url.searchParams.get("seed") ?? undefined,
  });
  const res = NextResponse.json({ test });
  if (!session.entitled) {
    res.cookies.set(MEDIPREP_FREE_TEST_COOKIE, "1", {
      path: "/",
      maxAge: 60 * 60 * 24 * 180,
      sameSite: "lax",
    });
  }
  return res;
}
