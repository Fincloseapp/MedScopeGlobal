import type { Metadata } from "next";
import Link from "next/link";
import { DokumentaceDownloadPanel } from "@/components/lekari/dokumentace-download-panel";
import { MEDIKTOR_APP } from "@/lib/apps/catalog";
import { MEDIKTOR } from "@/lib/lekari/dokumentace/branding";
import { buildV20PageMetadata } from "@/lib/v20/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildV20PageMetadata({
    title: `Stáhnout ${MEDIKTOR.shortName}`,
    description: MEDIKTOR.seoDescription,
    path: MEDIKTOR_APP.downloadPath,
  });
}

export default function MediktorDownloadPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#005B96]">
        Instalace na plochu · {MEDIKTOR.domain}
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold text-[#021d33]">
        Stáhnout {MEDIKTOR.shortName}
      </h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        Aplikace běží na {MEDIKTOR.domain}{MEDIKTOR.routes.app} — v Chrome/Edge na počítači i v Safari/Chrome
        v telefonu. Stažení PWA je vázané na ověřený lékařský účet MedScopeGlobal; historie se synchronizuje.
      </p>
      <div className="mt-8">
        <DokumentaceDownloadPanel variant="marketing" />
      </div>
      <p className="mt-6 text-sm">
        <Link href={MEDIKTOR.routes.marketing} className="text-[#005B96] hover:underline">
          ← Vše o {MEDIKTOR.shortName}
        </Link>
      </p>
    </div>
  );
}
