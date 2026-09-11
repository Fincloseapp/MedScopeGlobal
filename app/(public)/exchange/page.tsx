import type { Metadata } from "next";
import Link from "next/link";
import { EXCHANGE_LISTINGS } from "@/lib/b2b/exchange-listings";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { buildLocalizedPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return await buildLocalizedPageMetadata({
    title: "B2B Tržiště — výrobci a laboratoře v Česku a EU",
    description:
      "Poptávky zdarma pro nemocnice a laboratoře. Kontakty vidí platící inzerent. Česko a EU, CE / IVDR / ISO.",
    path: "/exchange",
  });
}

export default async function ExchangePage() {
  const locale = await getServerLocale();
  const firmyHref = localizePublicHref("/firmy", locale);
  const adsHref = localizePublicHref("/firmy/reklama/nova", locale);
  const contactHref = localizePublicHref("/kontakt", locale);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#005B96]">
        MedScopeGlobal.com · B2B
      </p>
      <h1 className="mt-2 font-display text-4xl font-bold text-[#021d33]">
        Tržiště pro výrobce, nemocnice a laboratoře
      </h1>
      <p className="mt-4 max-w-3xl text-lg text-slate-600">
        Kupující z Česka a EU poptává zdarma. Kontakty vidí jen platící inzerent — bez provize
        z obchodu. Magazín ViaLongeVita sem nepatří: čtenářská inzerce je na{" "}
        <Link href={firmyHref} className="font-semibold text-[#005B96] hover:underline">
          /firmy
        </Link>
        .
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={contactHref}
          className="rounded-full bg-[#021d33] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#004a7a]"
        >
          Registrovat firmu
        </Link>
        <Link
          href={adsHref}
          className="rounded-full border border-[#005B96] px-5 py-2.5 text-sm font-semibold text-[#005B96] hover:bg-[#f0f7ff]"
        >
          Inzerce v magazínu
        </Link>
      </div>

      <p className="mt-4 text-sm text-slate-500">
        Regiony: Česko · EU. Certifikace: CE / IVDR / ISO.
      </p>

      <ul className="mt-10 grid gap-4">
        {EXCHANGE_LISTINGS.map((item) => (
          <li
            key={item.id}
            id={item.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-[#005B96]">
              {item.region} · {item.category}
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-[#021d33]">{item.title}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {item.maker} · {item.cert}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-700">{item.summary}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
