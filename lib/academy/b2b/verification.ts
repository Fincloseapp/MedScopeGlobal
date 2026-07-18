import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import type { PhysicianProfile } from "@/types/academy-b2b";

const CLK_ID_PATTERN = /^[A-Za-z0-9\-./]{3,32}$/;

export function isValidClkId(clkId: string | null | undefined): boolean {
  if (!clkId) return false;
  const trimmed = clkId.trim();
  return CLK_ID_PATTERN.test(trimmed);
}

export function isVerifiedPhysician(profile: PhysicianProfile | null | undefined): boolean {
  if (!profile) return false;
  return profile.verified_doctor === true && isValidClkId(profile.clk_id);
}

export async function getPhysicianProfile(
  userId: string
): Promise<PhysicianProfile | null> {
  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("users")
    .select(
      "id, email, full_name, first_name, last_name, clk_id, specialization, verified_doctor"
    )
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return data as PhysicianProfile;
}

export async function requireVerifiedPhysician(): Promise<
  | { ok: true; profile: PhysicianProfile; userId: string }
  | { ok: false; status: 401 | 403; error: string; code: string }
> {
  const supabase = await createClient();
  if (!supabase) {
    return { ok: false, status: 401, error: "Auth není dostupná", code: "AUTH_UNAVAILABLE" };
  }

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return { ok: false, status: 401, error: "Přihlaste se", code: "UNAUTHENTICATED" };
  }

  const profile = await getPhysicianProfile(auth.user.id);
  if (!isVerifiedPhysician(profile)) {
    return {
      ok: false,
      status: 403,
      error:
        "Lékařská zóna je dostupná pouze ověřeným lékařům s platným ČLK číslem (Zákon o regulaci reklamy).",
      code: "DOCTOR_VERIFICATION_REQUIRED",
    };
  }

  return { ok: true, profile: profile!, userId: auth.user.id };
}

export function physicianGateJsonError(
  result: Extract<Awaited<ReturnType<typeof requireVerifiedPhysician>>, { ok: false }>
) {
  return NextResponse.json(
    { ok: false, error: result.error, code: result.code },
    { status: result.status }
  );
}

/**
 * Middleware gate for Lékařská zóna routes.
 * Student Academy (`/academy` catalog, přijímačky) stays public;
 * accredited CME lives under `/academy/lekari`.
 */
/**
 * Paths that require verified_doctor + clk_id.
 * Public teaser `/academy/lekari` and verification form stay open.
 * Student Academy (`/academy/courses`, přijímačky) is unaffected.
 */
export function isLekarskaZonaPath(pathname: string): boolean {
  if (pathname.startsWith("/api/academy/b2b/verification")) return false;
  if (
    pathname === "/academy/lekari/overeni" ||
    pathname.startsWith("/academy/lekari/overeni/")
  ) {
    return false;
  }
  // Catalog teaser is public; course content is gated
  if (pathname === "/academy/lekari") return false;

  return (
    pathname.startsWith("/academy/lekari/") ||
    pathname.startsWith("/api/academy/b2b/")
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function enforceLekarskaZonaMiddleware(
  request: NextRequest,
  supabase: any,
  response: NextResponse
): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;
  if (!isLekarskaZonaPath(pathname)) return null;

  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    const login = new URL("/prihlaseni", request.url);
    login.searchParams.set("next", pathname);
    login.searchParams.set("reason", "lekarska-zona");
    return NextResponse.redirect(login);
  }

  const { data: profile } = await supabase
    .from("users")
    .select("verified_doctor, clk_id")
    .eq("id", data.user.id)
    .maybeSingle();

  const verified =
    profile?.verified_doctor === true && isValidClkId(profile?.clk_id ?? null);

  if (!verified) {
    const denied = new URL("/academy/lekari/overeni", request.url);
    denied.searchParams.set("from", pathname);
    return NextResponse.redirect(denied);
  }

  return response;
}

export function resolvePhysicianDisplayName(profile: PhysicianProfile): string {
  const parts = [profile.first_name, profile.last_name].filter(Boolean);
  if (parts.length) return parts.join(" ");
  if (profile.full_name?.trim()) return profile.full_name.trim();
  return profile.email?.split("@")[0] ?? "Lékař";
}

export function splitFullName(fullName: string | null | undefined): {
  firstName: string;
  lastName: string;
} {
  const parts = (fullName ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}
