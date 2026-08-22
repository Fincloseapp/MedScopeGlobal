import Link from "next/link";
import { MEDIPACIENT } from "@/lib/medipacient/branding";
import { MeDipacientDownloadPanel } from "@/components/medipacient/medipacient-download-panel";
import { MeDipacientLockup } from "@/components/medipacient/medipacient-mark";
import { MeDipacientMarketingInfographic } from "@/components/medipacient/medipacient-marketing-infographic";
import { MeDipacientQrs } from "@/components/medipacient/medipacient-qrs";
import { MeDipacientInstallAuto } from "@/components/medipacient/medipacient-install-auto";

export function MeDipacientSmartDownload() {
  return (
    <div className="overflow-x-hidden bg-[#F5F7FA]">
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
        <MeDipacientLockup showTagline size="xl" />
        <MeDipacientMarketingInfographic variant="full" priority />
        <div className="mt-8">
          <MeDipacientDownloadPanel variant="marketing" />
        </div>
        <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#2D7FF9]">
          Stáhnout MeDipacient
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-[#1B1F23] sm:text-4xl">
          Na plochu telefonu i počítače
        </h1>
        <p className="mt-3 text-slate-600">
          Aplikace běží na medscopeglobal.com/app/pacient — v Chrome/Edge na počítači i v Safari/Chrome v telefonu,
          po přihlášení stejným účtem. Instalace na plochu je volitelná.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href={MEDIPACIENT.routes.app}
            className="inline-flex h-11 items-center rounded-full bg-[#2D7FF9] px-5 text-sm font-semibold text-white hover:bg-[#1f6ae0]"
          >
            Otevřít aplikaci v prohlížeči
          </Link>
          <Link
            href={`${MEDIPACIENT.routes.app}?install=1`}
            className="inline-flex h-11 items-center rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-[#1B1F23] hover:bg-slate-50"
          >
            Nainstalovat na plochu
          </Link>
        </div>
        <div className="mt-6">
          <MeDipacientInstallAuto />
        </div>
        <ol className="mt-8 space-y-3 text-sm leading-6 text-slate-700">
          <li>
            <strong>Android / Chrome:</strong> klepněte na „Nainstalovat“ nebo menu ⋮ → Nainstalovat aplikaci.
          </li>
          <li>
            <strong>iPhone:</strong> otevřete odkaz v Safari → Sdílet → Přidat na plochu.
          </li>
          <li>
            <strong>PC:</strong> ikona ⊕ v adresním řádku Chrome nebo Edge.
          </li>
        </ol>
        <div className="mt-8">
          <MeDipacientQrs />
        </div>
        <p className="mt-8 text-sm text-slate-500">
          <Link href={MEDIPACIENT.routes.marketing} className="font-semibold text-[#2D7FF9]">
            Jak MeDipacient funguje
          </Link>
          {" · "}
          Nenahrazuje lékařskou péči.
        </p>
      </div>
    </div>
  );
}
