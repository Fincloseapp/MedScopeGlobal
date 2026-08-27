import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { AppDownloadPanel } from "@/components/apps/app-download-panel";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { softwareApplicationJsonLd } from "@/lib/seo/json-ld";
import { MEDIPACIENT, appSeoDescription, appSeoTitle } from "@/lib/apps/catalog";
import { MEDIPACIENT_DEMO_REPORTS } from "@/lib/medipacient/demo-reports";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";
import { GlobalAdSlot } from "@/components/monetization/global-ad-slot";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...(await buildLocalizedV20PageMetadata({
      title: appSeoTitle(MEDIPACIENT),
      description: appSeoDescription(MEDIPACIENT),
      path: MEDIPACIENT.marketingPath,
    })),
    manifest: MEDIPACIENT.manifest,
    appleWebApp: { capable: true, title: MEDIPACIENT.shortName, statusBarStyle: "default" },
    icons: {
      icon: [{ url: MEDIPACIENT.assets.icon192 }, { url: MEDIPACIENT.assets.icon512 }],
      apple: [{ url: MEDIPACIENT.assets.appleTouch }],
    },
  };
}

const STEPS = [
  { n: "1 / 6", title: "Po vyšetření si nahrajete zprávu.", cta: "Nahrát zprávu" },
  { n: "2 / 6", title: "AI zprávu přečte, vyhodnotí a uloží." },
  { n: "3 / 6", title: "Už nikdy nezapomeňte." },
  { n: "4 / 6", title: "Všechny vaše zprávy na jednom místě.", cta: "Nahrát zprávu" },
  { n: "5 / 6", title: "Jednoduché pro každého. Od studentů po seniory." },
  { n: "6 / 6", title: "Premium vám hlídá zdraví. Vy jen žijete." },
] as const;

export default function MedipacientMarketingPage() {
  return (
    <div className="bg-[#fafcff]">
      <JsonLdScript
        data={softwareApplicationJsonLd({
          name: MEDIPACIENT.shortName,
          description: appSeoDescription(MEDIPACIENT),
          url: MEDIPACIENT.marketingPath,
          installUrl: MEDIPACIENT.downloadPath,
        })}
      />
      <section className="border-b border-[#d9e8f4] bg-gradient-to-br from-[#021d33] via-[#0a3d6b] to-[#2D7FF9] text-white">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="flex items-center gap-4">
            <Image
              src={MEDIPACIENT.assets.icon192}
              alt={MEDIPACIENT.shortName}
              width={72}
              height={72}
              className="rounded-[22%] ring-2 ring-white/25"
              priority
            />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-200">
                Aplikace pro veřejnost · {MEDIPACIENT.domain}
              </p>
              <h1 className="mt-1 font-display text-4xl font-bold">{MEDIPACIENT.tagline}</h1>
            </div>
          </div>
          <p className="mt-5 max-w-2xl text-lg text-white/85">{MEDIPACIENT.pitch}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={MEDIPACIENT.appPath}
              className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-[#021d33]"
            >
              Stáhnout {MEDIPACIENT.shortName}
            </Link>
            <Link
              href={MEDIPACIENT.downloadPath}
              className="rounded-full border border-white/40 px-6 py-2.5 text-sm font-semibold text-white"
            >
              Průvodce stažením
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((s) => (
            <article key={s.n} className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#2D7FF9]">{s.n}</p>
              <h2 className="mt-2 font-display text-lg font-semibold text-[#021d33]">{s.title}</h2>
              {"cta" in s && s.cta ? (
                <Link href={MEDIPACIENT.appPath} className="mt-3 inline-block text-sm font-medium text-[#2D7FF9]">
                  {s.cta} →
                </Link>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-2 sm:px-6">
        <GlobalAdSlot placement="in-content" locale="cs" />
      </div>

      <section className="mx-auto max-w-5xl px-4 pb-10 sm:px-6">
        <div className="rounded-3xl border border-[#cfe1f3] bg-white p-6 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#2D7FF9]">
            Zkušební dashboard
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold text-[#021d33]">
            Už teď vidíte, co aplikace umí
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Pět zkušebních zpráv (květen–červenec) skládá diagnózy, léky, laboratoř a otázky k lékaři. Vaše nahrávky
            se přidají do stejné osy.
          </p>
          <ol className="mt-5 space-y-3">
            {MEDIPACIENT_DEMO_REPORTS.map((doc) => (
              <li key={doc.id} className="border-l-2 border-[#2D7FF9]/40 pl-4">
                <p className="text-[11px] text-slate-500">
                  {new Date(doc.createdAt).toLocaleDateString("cs-CZ")} · {doc.facility}
                </p>
                <p className="font-medium text-[#021d33]">{doc.title}</p>
                <p className="text-sm text-slate-600">{doc.excerpt}</p>
              </li>
            ))}
          </ol>
          <Link
            href={MEDIPACIENT.appPath}
            className="mt-5 inline-flex rounded-full bg-[#2D7FF9] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Otevřít plný dashboard
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-8 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border bg-white p-5">
            <p className="text-xs font-semibold uppercase text-[#2D7FF9]">Zdarma</p>
            <ul className="mt-2 space-y-1 text-sm text-slate-700">
              <li>Nahrávání zpráv</li>
              <li>Základní analýza a časová osa</li>
              <li>Zkušební ukázkové zprávy v dashboardu</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-[#2D7FF9]/30 bg-white p-5">
            <p className="text-xs font-semibold uppercase text-[#2D7FF9]">Premium od 99 Kč</p>
            <ul className="mt-2 space-y-1 text-sm text-slate-700">
              <li>Pokročilá analýza a lékový plán</li>
              <li>Chytré připomínky kontrol</li>
              <li>Celý magazín Veřejnost bez reklam</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
        <AppDownloadPanel app={MEDIPACIENT} extraCta={{ href: "/predplatne#public", label: "Předplatné 99 Kč" }} />
        <p className="mt-4 text-center text-xs text-slate-500">
          Vzdělávací přehled zpráv — nenahrazuje lékařskou péči.
        </p>
      </section>
    </div>
  );
}
