import type { Metadata } from "next";
import Link from "next/link";
import { AppDownloadPanel } from "@/components/apps/app-download-panel";
import { MEDIFLOW } from "@/lib/apps/catalog";
import { buildV20PageMetadata } from "@/lib/v20/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildV20PageMetadata({
    title: `Stáhnout ${MEDIFLOW.shortName}`,
    description: MEDIFLOW.pitch,
    path: MEDIFLOW.downloadPath,
  });
}

export default function MediFlowDownloadPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-emerald-600">Instalace MediFlow</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-[#0a1628]">Wellness deník na ploše telefonu i PC</h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        MediFlow běží na medscopeglobal.com{MEDIFLOW.appPath} — ukládejte články, sledujte symptomy a suplementy.
        Instalace na plochu je volitelná; po přihlášení stejným účtem funguje i v prohlížeči.
      </p>
      <ol className="mt-6 space-y-2 text-sm text-slate-700">
        <li>1. Na tomto zařízení klepněte na „Nainstalovat MediFlow na plochu“.</li>
        <li>2. Chrome/Edge: ikona ⊕ v adresním řádku, nebo … → Aplikace → Instalovat.</li>
        <li>3. iPhone: Safari → Sdílet → Přidat na plochu.</li>
      </ol>
      <div className="mt-8">
        <AppDownloadPanel app={MEDIFLOW} />
      </div>
      <p className="mt-6 text-sm">
        <Link href={MEDIFLOW.marketingPath} className="text-emerald-700 hover:underline">
          ← Zpět na MediFlow
        </Link>
      </p>
    </div>
  );
}
