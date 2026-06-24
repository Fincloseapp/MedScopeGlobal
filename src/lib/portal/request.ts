import { cookies } from "next/headers";
import { readSessionToken, sessionCookieName } from "./auth";
import type { SessionUser } from "./types";

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  return readSessionToken(cookieStore.get(sessionCookieName)?.value);
}

export function getSessionUserFromRequest(request: Request): SessionUser | null {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(new RegExp(`${sessionCookieName}=([^;]+)`));
  return readSessionToken(match?.[1] ? decodeURIComponent(match[1]) : null);
}

export function jsonResponse(data: unknown, init?: ResponseInit) {
  return Response.json(data, init);
}

export function errorResponse(message: string, status = 400) {
  if (message === "DATABASE_REQUIRED") {
    return Response.json(
      { error: "Databáze není nakonfigurována. Nastavte DATABASE_URL a DIRECT_URL ve Vercel.", code: "DATABASE_REQUIRED" },
      { status: 503 }
    );
  }
  return Response.json({ error: message }, { status });
}
