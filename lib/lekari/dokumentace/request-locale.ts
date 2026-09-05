import { normalizeLocale } from "@/lib/i18n/config";

export function dokumentaceLocaleFromRequest(
  request: Request,
  extra?: string | null
): string {
  const header =
    request.headers.get("x-medscope-locale") ??
    request.headers.get("x-dokumentace-locale");
  const raw = (extra && extra.trim()) || header || "";
  return normalizeLocale(raw || "cs");
}

export function dokumentaceLocaleFromForm(request: Request, form: FormData): string {
  const field = form.get("locale");
  return dokumentaceLocaleFromRequest(
    request,
    typeof field === "string" ? field : null
  );
}

export function dokumentaceLocaleHeaders(locale: string): Record<string, string> {
  return {
    "x-medscope-locale": locale,
    "x-dokumentace-locale": locale,
  };
}

export function dokumentaceLocaleFromUrl(request: Request): string {
  const url = new URL(request.url);
  return dokumentaceLocaleFromRequest(request, url.searchParams.get("locale"));
}
