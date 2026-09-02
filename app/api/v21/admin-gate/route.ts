import { NextResponse } from "next/server";
import { adminGateCookieValue, ADMIN_GATE_COOKIE } from "@/lib/auth/admin-gate";

const NO_STORE = "private, no-cache, no-store, must-revalidate";

export async function POST(request: Request) {
  const body = (await request.json()) as { password?: string };
  if (body.password !== adminGateCookieValue()) {
    const denied = NextResponse.json({ error: "invalid" }, { status: 401 });
    denied.headers.set("Cache-Control", NO_STORE);
    return denied;
  }
  const res = NextResponse.json({ ok: true });
  res.headers.set("Cache-Control", NO_STORE);
  res.cookies.set(ADMIN_GATE_COOKIE, adminGateCookieValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return res;
}
