import { NextResponse } from "next/server";
import { adminGateCookieValue, ADMIN_GATE_COOKIE } from "@/lib/auth/admin-gate";

export async function POST(request: Request) {
  const body = (await request.json()) as { password?: string };
  if (body.password !== adminGateCookieValue()) {
    return NextResponse.json({ error: "invalid" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_GATE_COOKIE, adminGateCookieValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return res;
}
