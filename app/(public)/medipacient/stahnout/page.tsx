import type { Metadata } from "next";
import Link from "next/link";
import { AppDownloadPanel } from "@/components/apps/app-download-panel";
import { MEDIPACIENT } from "@/lib/apps/catalog";
import { buildV20PageMetadata } from "@/lib/v20/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildV20PageMetadata({
    title: `Stáhnout ${MEDIPACIENT.shortName}`,
    description: MEDIPACIENT.pitch,
    path: MEDIPACIENT.downloadPath,
  });
}

export default function MedipacientDownloadPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#2D7FF9]">Instalace na plochu</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-[#021d33]">Na plochu telefonu i počítače</h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        Aplikace běží na medscopeglobal.com{MEDIPACIENT.appPath} — v Chrome/Edge na počítači i v Safari/Chrome v
        telefonu, po přihlášení stejným účtem. Instalace na plochu je volitelná.
      </p>
      <div className="mt-8">
        <AppDownloadPanel app={MEDIPACIENT} />
      </div>
      <p className="mt-6 text-sm">
        <Link href={MEDIPACIENT.marketingPath} className="text-[#2D7FF9] hover:underline">
          ← Jak {MEDIPACIENT.shortName} funguje
        </Link>
      </p>
    </div>
  );
}
