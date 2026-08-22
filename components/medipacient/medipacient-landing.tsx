import Link from "next/link";
import { FileHeart, Smartphone, WifiOff, Shield } from "lucide-react";
import { MEDIPACIENT } from "@/lib/medipacient/branding";
import { MeDipacientDownloadPanel } from "@/components/medipacient/medipacient-download-panel";
import { MeDipacientInstallButton } from "@/components/medipacient/medipacient-install-button";
import { MeDipacientLockup } from "@/components/medipacient/medipacient-mark";
import { MeDipacientMarketingInfographic } from "@/components/medipacient/medipacient-marketing-infographic";
import { MeDipacientPwaRegister } from "@/components/medipacient/medipacient-pwa-register";
import { MeDipacientQrs } from "@/components/medipacient/medipacient-qrs";

export function MeDipacientLanding() {
  return (
    <div className="bg-[#F5F7FA]">
      <MeDipacientPwaRegister />
      <section className="mx-auto w-full max-w-5xl overflow-x-hidden px-4 py-14 sm:px-6">
        <MeDipacientLockup showTagline size="xl" />
        <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#2D7FF9]">
          Aplikace pro veřejnost · MedScopeGlobal
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-[#1B1F23] sm:text-5xl">
          {MEDIPACIENT.tagline}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-7 text-slate-600">{MEDIPACIENT.description}</p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <MeDipacientInstallButton variant="hero" className="w-full sm:w-auto sm:min-w-[280px]" />
          <Link
            href={`${MEDIPACIENT.routes.app}?install=1`}
            className="inline-flex h-12 items-center rounded-full border border-slate-300 bg-white px-6 text-sm font-semibold text-[#1B1F23] hover:bg-slate-50"
          >
            Otevřít v prohlížeči
          </Link>
        </div>
        <MeDipacientMarketingInfographic variant="full" priority />
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {[
            {
              Icon: Smartphone,
              title: "Na plochu telefonu",
              body: "PWA — nainstalujete z prohlížeče, bez obchodu. iPhone Safari, Android Chrome.",
            },
            {
              Icon: WifiOff,
              title: "Funguje i offline",
              body: "Vyfoťte nebo nahrajte zprávu bez dat. Po připojení se fronta sama odešle a OCR doběhne.",
            },
            {
              Icon: Shield,
              title: "AES-256 a GDPR",
              body: "Soubory se šifrují, antivir ClamAV, servery v EU. Není to zdravotnický prostředek.",
            },
          ].map(({ Icon, title, body }) => (
            <article key={title} className="rounded-2xl border border-slate-200 bg-white p-5">
              <Icon className="h-5 w-5 text-[#2D7FF9]" aria-hidden />
              <h2 className="mt-3 font-semibold text-[#1B1F23]">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
            </article>
          ))}
        </div>
        <div className="mt-10">
          <MeDipacientDownloadPanel variant="marketing" />
        </div>
        <div className="mt-10">
          <MeDipacientQrs />
        </div>
        <p className="mt-8 flex items-center gap-2 text-sm text-slate-500">
          <FileHeart className="h-4 w-4" aria-hidden />
          Produkt MedScopeGlobal · {MEDIPACIENT.price} · {MEDIPACIENT.supportEmail}
        </p>
      </section>
    </div>
  );
}
