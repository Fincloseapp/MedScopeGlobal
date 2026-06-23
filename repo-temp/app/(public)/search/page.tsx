import { Suspense } from "react";
import { cookies } from "next/headers";
import { getReaderContext } from "@/lib/auth/reader-context";
import { normalizeLocale, LOCALE_COOKIE } from "@/lib/i18n/config";
import { SearchClient } from "./search-client";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const initialQ = sp.q ?? "";
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get(LOCALE_COOKIE)?.value);
  const { isVip, accessLevel } = await getReaderContext();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-4xl font-bold text-medical-navy">
        Search the archive
      </h1>
      <p className="mt-2 text-muted-foreground">
        Results refresh as you type (minimum two characters).
      </p>
      <Suspense fallback={<p className="mt-8 text-sm text-muted-foreground">Loading search…</p>}>
        <SearchClient
          initialQ={initialQ}
          isVip={isVip}
          accessLevel={accessLevel}
          locale={locale}
        />
      </Suspense>
    </div>
  );
}
