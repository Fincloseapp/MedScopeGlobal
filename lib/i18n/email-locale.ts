import { LOCALE_COOKIE, LOCALE_REQUEST_HEADER, resolveSupportedLocale, type LocaleCode } from "@/lib/i18n/config";

/**
 * Locale for outbound reader/account mail.
 * Unknown or missing values fall back to English — never Czech chrome on non-CS.
 */
export function resolveEmailLocale(
  raw?: string | null,
  request?: Request | null
): LocaleCode {
  const fromInput = resolveSupportedLocale(raw);
  if (fromInput) return fromInput;
  if (request) {
    const header = request.headers.get(LOCALE_REQUEST_HEADER);
    const fromHeader = resolveSupportedLocale(header);
    if (fromHeader) return fromHeader;
    const cookie = request.headers.get("cookie") ?? "";
    const match = cookie.match(new RegExp(`(?:^|;\\s*)${LOCALE_COOKIE}=([^;]+)`));
    const fromCookie = resolveSupportedLocale(match ? decodeURIComponent(match[1]) : null);
    if (fromCookie) return fromCookie;
  }
  return "en";
}
