import { NextResponse } from "next/server";
import {
  adminGateCookieValue,
  ADMIN_GATE_COOKIE,
  ADMIN_GATE_COOKIE_LEGACY,
} from "@/lib/auth/admin-gate";

const NO_STORE = "private, no-cache, no-store, must-revalidate";

const COOKIE_BASE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

function clearLegacy(res: NextResponse) {
  res.cookies.set(ADMIN_GATE_COOKIE_LEGACY, "", { ...COOKIE_BASE, maxAge: 0 });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { password?: string };
  if (body.password !== adminGateCookieValue()) {
    const denied = NextResponse.json({ error: "invalid" }, { status: 401 });
    denied.headers.set("Cache-Control", NO_STORE);
    clearLegacy(denied);
    return denied;
  }
  const res = NextResponse.json({ ok: true });
  res.headers.set("Cache-Control", NO_STORE);
  clearLegacy(res);
  // Session cookie — closing the browser requires the password again.
  res.cookies.set(ADMIN_GATE_COOKIE, adminGateCookieValue(), COOKIE_BASE);
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.headers.set("Cache-Control", NO_STORE);
  res.cookies.set(ADMIN_GATE_COOKIE, "", { ...COOKIE_BASE, maxAge: 0 });
  clearLegacy(res);
  return res;
}
