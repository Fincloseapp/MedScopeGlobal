import { NextResponse } from "next/server";
import { getReaderContext } from "@/lib/auth/reader-context";

export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await getReaderContext();
  return NextResponse.json({
    user: ctx.user ? { id: ctx.user.id, email: ctx.user.email ?? null } : null,
    profile: ctx.profile,
    isVip: ctx.isVip,
    accessLevel: ctx.accessLevel,
  });
}
