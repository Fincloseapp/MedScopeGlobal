import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { AppDownloadPanel } from "@/components/apps/app-download-panel";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { softwareApplicationJsonLd } from "@/lib/seo/json-ld";
import { MEDIPREP, appSeoDescription, appSeoTitle } from "@/lib/apps/catalog";
import { getPrepDashboard } from "@/lib/mediprep/dashboard";
import { FACULTIES_ADMISSIONS_2026 } from "@/lib/prijimacky/faculties-admissions";
import { bankStats } from "@/lib/prijimacky/question-bank";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { getCzechFacultyOnlyCopy, isCzechFacultyLocale } from "@/lib/i18n/czech-faculty-only-copy";
import { CzechFacultyOnlyNotice } from "@/components/apps/czech-faculty-only";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  if (!isCzechFacultyLocale(locale)) {
    const copy = getCzechFacultyOnlyCopy(locale);
    return {
      ...(await buildLocalizedV20PageMetadata({
        title: copy.metaTitle,
        description: copy.metaDescription,
        path: MEDIPREP.marketingPath,
      })),
      robots: { index: false, follow: false },
    };
  }
  return {
    ...(await buildLocalizedV20PageMetadata({
      title: appSeoTitle(MEDIPREP),
      description: appSeoDescription(MEDIPREP),
      path: MEDIPREP.marketingPath,
    })),
    manifest: MEDIPREP.manifest,
  };
}

export default async function MediprepMarketingPage() {
  const locale = await getServerLocale();
  if (!isCzechFacultyLocale(locale)) {
    return <CzechFacultyOnlyNotice locale={locale} />;
  }
  const stats = bankStats();
  const dash = getPrepDashboard();
  const FEATURES = [
    { title: "Simulace s odpočtem", body: "Bloky B/C/F podle fakulty — tréninkový formát, ne oficiální zadání." },
    { title: "Drill slabých míst", body: "Po testu vidíte témata pod 70 %. Další sada jde přesně tam." },
    { title: "Týdenní plán", body: "Sedm konkrétních kroků: kapitola, mini test, simulace, opakování." },
    { title: "E-mail + kód", body: "Bez hesla. První test zdarma. Pak Student 149 Kč / 14 dní zdarma." },
  ] as const;
  return (
    <div className="bg-[#F8F4EA]">
      <JsonLdScript
        data={softwareApplicationJsonLd({
          name: MEDIPREP.shortName,
          description: appSeoDescription(MEDIPREP),
          url: MEDIPREP.marketingPath,
          installUrl: MEDIPREP.downloadPath,
          category: "EducationalApplication",
        })}
      />
      <section className="border-b border-[#e0d5c4] bg-[#0A192F] text-white">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="flex items-center gap-4">
            <Image
              src={MEDIPREP.assets.icon192}
              alt={MEDIPREP.shortName}
              width={72}
              height={72}
              className="rounded-[22%] ring-2 ring-white/20"
              priority
            />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200">
                Pro studenty a uchazeče o LF
              </p>
              <h1 className="mt-1 font-display text-4xl font-bold">
                Připrav se na medicínu s jistotou
              </h1>
              <p className="mt-2 text-lg text-white/80">{MEDIPREP.tagline}</p>
            </div>
          </div>
          <p className="mt-5 max-w-2xl text-white/85">{MEDIPREP.pitch}</p>
          <p className="mt-3 max-w-2xl text-sm text-white/70">
            Rodiče: první test zdarma ukáže mezery. Pak dává smysl Student 149 Kč místo nahodilého doučování.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={MEDIPREP.appPath}
              className="rounded-full bg-[#C45C26] px-6 py-2.5 text-sm font-semibold text-white"
            >
              Otevřít {MEDIPREP.shortName}
            </Link>
            <Link
              href={MEDIPREP.downloadPath}
              className="rounded-full border border-white/40 px-6 py-2.5 text-sm font-semibold text-white"
            >
              Stáhnout na plochu
            </Link>
          </div>
          <p className="mt-4 text-xs text-white/60">
            {stats.total} originálních otázek · e-mail + kód · medscopeglobal.com
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <h2 className="font-display text-2xl font-semibold text-[#0A192F]">Osm českých LF</h2>
        <p className="mt-2 text-sm text-slate-600">
          Simulace podle fakulty. Otázky jsou originální banka MeDiprep — ne oficiální zadání.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {FACULTIES_ADMISSIONS_2026.map((f) => (
            <article key={f.slug} className="rounded-2xl border border-[#e0d5c4] bg-white p-4">
              <p className="font-semibold text-[#0A192F]">{f.shortName}</p>
              <p className="text-sm text-slate-500">{f.city}</p>
              <p className="mt-1 text-xs text-slate-400">{f.examNote}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-10 sm:px-6">
        <h2 className="font-display text-2xl font-semibold text-[#0A192F]">Co studenti stáhnou</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <article key={f.title} className="rounded-2xl border border-[#e0d5c4] bg-white p-5">
              <h3 className="font-semibold text-[#0A192F]">{f.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{f.body}</p>
            </article>
          ))}
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border bg-white p-5">
            <h3 className="font-semibold">Slabá místa (ukázka)</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {dash.weakTopics.map((w) => (
                <li key={w.topic} className="flex justify-between">
                  <span>
                    {w.topic} <span className="text-slate-400">· {w.subject}</span>
                  </span>
                  <span className="font-semibold text-[#C45C26]">{w.pct} %</span>
                </li>
              ))}
            </ul>
          </article>
          <article className="rounded-2xl border bg-white p-5">
            <h3 className="font-semibold">Týdenní plán</h3>
            <ol className="mt-3 space-y-1.5 text-sm">
              {dash.weeklyPlan.map((row) => (
                <li key={row.day} className="flex gap-3">
                  <span className="w-8 font-bold text-[#C45C26]">{row.day}</span>
                  <span>{row.task}</span>
                </li>
              ))}
            </ol>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
        <AppDownloadPanel
          app={MEDIPREP}
          extraCta={{ href: "/predplatne#student", label: "149 Kč/měsíc · 14 dní zdarma" }}
        />
      </section>
    </div>
  );
}
