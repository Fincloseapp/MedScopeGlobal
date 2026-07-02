import type { Metadata } from "next";
import Link from "next/link";
import { AudienceHub } from "@/components/home/audience-hub";
import { LOCALE_COOKIE, normalizeLocale } from "@/lib/i18n/config";
import { cookies } from "next/headers";

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get(LOCALE_COOKIE)?.value);
  return {
    title: locale === "cs" ? "Pro koho" : "Audiences",
  };
}

export default async function ProKohoPage() {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get(LOCALE_COOKIE)?.value);
  const isCs = locale === "cs";

  return (
    <div>
      <section className="border-b bg-[#f0f7ff]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <nav className="text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              {isCs ? "Domů" : "Home"}
            </Link>
            <span className="mx-2">/</span>
            <span>{isCs ? "Pro koho" : "Audiences"}</span>
          </nav>
          <h1 className="mt-4 font-display text-4xl font-bold text-[#005B96]">
            {isCs ? "Obsah podle vaší role" : "Content by your role"}
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            {isCs
              ? "Vyberte perspektivu, která odpovídá tomu, jak čtete medicínské informace. Filtry a úrovně přístupu se přizpůsobí vašim potřebám."
              : "Choose the perspective that matches how you consume medical information."}
          </p>
          <Link href="/access-levels" className="mt-4 inline-block text-sm font-medium text-[#005B96] hover:underline">
            {isCs ? "Detail úrovní přístupu →" : "Access levels →"}
          </Link>
        </div>
      </section>
      <AudienceHub locale={locale} />
    </div>
  );
}
