import { NextResponse } from "next/server";
import { getReaderContext } from "@/lib/auth/reader-context";
import { normalizeLocale, type LocaleCode } from "@/lib/i18n/config";
import { createClient } from "@/lib/supabase/server";
import { mergedArticleSearch } from "@/utils/merged-article-search";
import { sanitizeSearchInput } from "@/utils/search";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = sanitizeSearchInput(url.searchParams.get("q") ?? "");
  const locale = normalizeLocale(url.searchParams.get("locale") ?? "cs") as LocaleCode;
  const { isVip, accessLevel } = await getReaderContext();

  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  let supabase = null;
  try {
    supabase = await createClient();
  } catch {
    supabase = null;
  }

  const results = await mergedArticleSearch(supabase, q, 16, isVip, accessLevel, locale);
  return NextResponse.json({ results });
}
