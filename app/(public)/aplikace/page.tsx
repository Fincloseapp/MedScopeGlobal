import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { AppDownloadPanel } from "@/components/apps/app-download-panel";
import { DokumentaceDownloadPanel } from "@/components/lekari/dokumentace-download-panel";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { softwareApplicationJsonLd } from "@/lib/seo/json-ld";
import { APP_PRODUCTS, appLockline, appSeoDescription } from "@/lib/apps/catalog";
import { buildV20PageMetadata } from "@/lib/v20/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildV20PageMetadata({
    title: "Aplikace MedScopeGlobal — MediFlow, MeDipacient, OrdiZapis",
    description:
      "Wellness deník MediFlow, MeDipacient pro zprávy a OrdiZapis pro lékaře — plus legacy MeDiprep pro přípravu na LF. Stažení na mobil jako PWA.",
    path: "/aplikace",
  });
}

export default function AplikaceHubPage() {
  return (
    <div className="bg-[#f7fbfe]">
      {APP_PRODUCTS.map((app) => (
        <JsonLdScript
          key={app.id}
          data={softwareApplicationJsonLd({
            name: app.shortName,
            description: appSeoDescription(app),
            url: app.marketingPath,
            installUrl: app.downloadPath,
            category: app.id === "mediprep" ? "EducationalApplication" : "HealthApplication",
          })}
        />
      ))}
      <section className="border-b bg-[#021d33] text-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-200">Aplikace MedScopeGlobal</p>
          <h1 className="mt-2 font-display text-4xl font-bold">Wellness, zprávy a zápisy — na jedné platformě</h1>
          <p className="mt-4 max-w-2xl text-white/80">
            MediFlow pro dlouhověkost a vlastní deník, MeDipacient pro lékařské zprávy, OrdiZapis pro ověřené lékaře.
            MeDiprep (přijímačky LF) zůstává dostupný jako doplňková aplikace. Stažení na plochu telefonu — Chrome
            nebo Safari.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/predplatne?trial=1" className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#021d33]">
              14 dní zdarma
            </Link>
            <Link href="/dashboard" className="rounded-full border border-white/40 px-5 py-2.5 text-sm font-semibold text-white">
              Ukázkový dashboard
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-10 px-4 py-12 sm:px-6">
        {APP_PRODUCTS.map((app) => (
          <article key={app.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-wrap items-start gap-4">
              <Image
                src={app.assets.icon192}
                alt={app.shortName}
                width={64}
                height={64}
                className="rounded-[22%]"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#005B96]">
                  {app.audience} · {appLockline(app)}
                </p>
                <h2 className="mt-1 font-display text-2xl font-semibold text-[#021d33]">{app.shortName}</h2>
                <p className="mt-1 text-slate-600">{app.pitch}</p>
                <p className="mt-2 text-sm font-medium text-[#005B96]">{app.priceNote}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={app.appPath}
                    className="rounded-full bg-[#005B96] px-4 py-2 text-sm font-semibold text-white"
                  >
                    Otevřít {app.shortName}
                  </Link>
                  <Link
                    href={app.marketingPath}
                    className="rounded-full border border-[#005B96]/30 px-4 py-2 text-sm font-semibold text-[#005B96]"
                  >
                    Jak to funguje
                  </Link>
                </div>
              </div>
            </div>
            {app.id === "ordizapis" ? (
              <DokumentaceDownloadPanel />
            ) : (
              <AppDownloadPanel app={app} />
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
