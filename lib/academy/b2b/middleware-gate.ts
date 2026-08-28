/**
 * Middleware-safe Lékařská zóna helpers — no next/headers / server client.
 */
import { NextResponse, type NextRequest } from "next/server";

const CLK_ID_PATTERN = /^[A-Za-z0-9\-./]{3,32}$/;

export function isValidClkId(clkId: string | null | undefined): boolean {
  if (!clkId) return false;
  return CLK_ID_PATTERN.test(clkId.trim());
}

/**
 * Paths that require verified_doctor + clk_id.
 * Public teaser `/academy/lekari` and verification form stay open.
 */
export function isLekarskaZonaPath(pathname: string): boolean {
  if (pathname.startsWith("/api/academy/b2b/verification")) return false;
  if (
    pathname.startsWith("/academy/partner") ||
    pathname.startsWith("/api/academy/b2b/partners")
  ) {
    return false;
  }
  if (
    pathname === "/academy/lekari/overeni" ||
    pathname.startsWith("/academy/lekari/overeni/")
  ) {
    return false;
  }
  if (pathname === "/academy/lekari") return false;

  return (
    pathname.startsWith("/academy/lekari/") ||
    pathname.startsWith("/api/academy/b2b/")
  );
}

export async function enforceLekarskaZonaMiddleware(
  request: NextRequest,
  // Middleware supabase client — keep loose to avoid deep generic instantiation.
  supabase: any,
  response: NextResponse
): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;
  if (!isLekarskaZonaPath(pathname)) return null;

  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    const login = new URL("/login", request.url);
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
