/**
 * Wire into root middleware.ts (after createMiddlewareClient):
 *
 *   import { enforceLekarskaZonaMiddleware, isLekarskaZonaPath } from "@/lib/academy/b2b/verification";
 *
 *   if (isLekarskaZonaPath(pathname)) {
 *     const gated = await enforceLekarskaZonaMiddleware(request, supabase, response);
 *     if (gated) return wrapWithSecurityHeaders(gated);
 *   }
 *
 * Also add matcher entries if needed:
 *   "/academy/lekari/:path*",
 *   "/api/academy/b2b/:path*"
 */

export {
  enforceLekarskaZonaMiddleware,
  isLekarskaZonaPath,
} from "@/lib/academy/b2b/verification";
