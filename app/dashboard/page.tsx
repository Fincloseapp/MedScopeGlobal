import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getPacientDashboard } from "@/lib/medipacient/store";
import { getPrepDashboard } from "@/lib/mediprep/dashboard";
import { getReaderContext } from "@/lib/auth/reader-context";
import { APP_PRODUCTS } from "@/lib/apps/catalog";
import { getLatestArticles } from "@/lib/queries/articles";

export const metadata: Metadata = {
  title: "Můj dashboard | MedScopeGlobal",
  description: "Přehled MeDipacient, MeDiprep a OrdiZapis — zkušební zprávy, testy a stažení na mobil.",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { user, isVip, accessLevel } = await getReaderContext();
  const [pacient, prep, articles] = await Promise.all([
    getPacientDashboard(user?.id),
    Promise.resolve(getPrepDashboard()),
    getLatestArticles(6, 0, isVip, accessLevel, "cs"),
  ]);

  return (
    <div className="bg-[#fafcff]">
      <section className="border-b border-[#d9e8f4] bg-[linear-gradient(180deg,#fff_0%,#f0f7fc_100%)]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#005B96]">
            Dashboard prostředí
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-[#021d33]">
            Všechny aplikace a zkušební data na jednom místě
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Ukázkové lékařské zprávy, přijímačkový plán i odkazy ke stažení na mobil. Žádný prázdný stav — maximum
            toho, co MeDipacient, MeDiprep a OrdiZapis umí.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
        <section className="grid gap-4 md:grid-cols-3">
          {APP_PRODUCTS.map((app) => (
            <article key={app.id} className="rounded-2xl border border-[#d9e8f4] bg-white p-5 shadow-sm">
              <Image src={app.assets.icon192} alt={app.shortName} width={48} height={48} className="rounded-[22%]" />
              <h2 className="mt-3 font-display text-xl font-semibold">{app.shortName}</h2>
              <p className="mt-1 text-sm text-slate-600">{app.tagline}</p>
              <p className="mt-2 text-xs text-[#005B96]">{app.priceNote}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={app.appPath}
                  className="rounded-full bg-[#005B96] px-4 py-1.5 text-sm font-semibold text-white"
                >
                  Otevřít
                </Link>
                <Link href={app.downloadPath} className="rounded-full border px-4 py-1.5 text-sm text-[#005B96]">
                  Stáhnout na mobil
                </Link>
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-[#d9e8f4] bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-semibold">MeDipacient · zkušební časová osa</h2>
              <p className="mt-1 text-sm text-slate-600">
                {pacient.stats.reports} zpráv · {pacient.stats.diagnoses} diagnóz · {pacient.stats.meds} léků · další
                krok: {pacient.nextVisit.label}
              </p>
            </div>
            <Link href="/app/pacient" className="text-sm font-medium text-[#005B96]">
              Otevřít plný dashboard →
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {pacient.diagnoses.slice(0, 8).map((dx) => (
              <span key={dx} className="rounded-full bg-[#eef5ff] px-3 py-1 text-xs font-medium text-[#021d33]">
                {dx}
              </span>
            ))}
          </div>
          <ol className="mt-5 space-y-3">
            {pacient.timeline.slice(0, 6).map((item) => (
              <li key={item.id} className="border-l-2 border-[#2D7FF9]/40 pl-4">
                <p className="text-[11px] text-slate-500">
                  {new Date(item.date).toLocaleDateString("cs-CZ")}
                  {item.demo ? " · zkušební ukázka" : ""}
                </p>
                <p className="font-medium">{item.title}</p>
                {item.highlight ? <p className="text-sm text-slate-600">{item.highlight}</p> : null}
              </li>
            ))}
          </ol>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#2D7FF9]">Léky</p>
              <ul className="mt-2 space-y-1 text-sm">
                {pacient.medications.slice(0, 6).map((m) => (
                  <li key={m.name}>
                    {m.name}
                    {m.dose ? ` · ${m.dose}` : ""}
                    {m.schedule ? ` · ${m.schedule}` : ""}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#2D7FF9]">Laboratoř</p>
              <ul className="mt-2 space-y-1 text-sm">
                {pacient.labValues.slice(0, 6).map((lab, i) => (
                  <li key={`${lab.name}-${i}`}>
                    {lab.name}: {lab.value} {lab.unit ?? ""}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <article className="rounded-2xl border border-[#d9e8f4] bg-white p-6 shadow-sm">
            <h2 className="font-display text-xl font-semibold">MeDiprep · plán a mezery</h2>
            <p className="mt-1 text-sm text-slate-600">
              Ukázkové skóre {prep.demoScore.pct} % · banka {prep.bank.total} otázek
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {prep.weakTopics.map((w) => (
                <li key={w.topic} className="flex justify-between">
                  <span>{w.topic}</span>
                  <span className="font-semibold text-[#C45C26]">{w.pct} %</span>
                </li>
              ))}
            </ul>
            <Link href="/app/priprava" className="mt-4 inline-block text-sm font-medium text-[#C45C26]">
              Spustit test →
            </Link>
          </article>
          <article className="rounded-2xl border border-[#d9e8f4] bg-white p-6 shadow-sm">
            <h2 className="font-display text-xl font-semibold">OrdiZapis · pro lékaře</h2>
            <p className="mt-1 text-sm text-slate-600">
              Nahrávání v mobilu, SOAP a anamnéza. Stejné stažení na plochu jako u ostatních aplikací.
            </p>
            <Link
              href="/app/dokumentace"
              className="mt-4 inline-flex rounded-full bg-[#005B96] px-4 py-2 text-sm font-semibold text-white"
            >
              Stáhnout OrdiZapis
            </Link>
          </article>
        </section>

        <section className="rounded-2xl border border-[#d9e8f4] bg-white p-6 shadow-sm">
          <h2 className="font-display text-xl font-semibold">Aktuální zprávy magazínu</h2>
          <ul className="mt-4 space-y-2">
            {articles.map((a) => (
              <li key={a.id}>
                <Link href={`/article/${a.slug}`} className="text-sm font-medium text-[#005B96] hover:underline">
                  {a.title}
                </Link>
              </li>
            ))}
            {articles.length === 0 ? (
              <li className="text-sm text-slate-500">Zprávy se načtou po publikaci — zkušební osu už vidíte výše.</li>
            ) : null}
          </ul>
        </section>
      </div>
    </div>
  );
}
