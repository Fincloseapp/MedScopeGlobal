import Image from "next/image";
import Link from "next/link";
import { BookOpen, Gauge, GraduationCap, Puzzle, Target, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MeDiprepLogo } from "@/components/prep/mediprep-mark";
import { MeDiprepInstallButton, MeDiprepPwaRegister } from "@/components/prep/mediprep-install-button";
import { MEDIPREP, MEDIPREP_ONBOARDING } from "@/lib/prep/branding";
import { PREP_FACULTIES, simulationTotals } from "@/lib/prep/faculties";
import { prepBankStats } from "@/lib/prep/questions";
import { PREP_CHAPTERS } from "@/lib/prep/curriculum";
import { MeDiprepDownloadPanel } from "@/components/prep/mediprep-download-panel";

const PILLARS = [
  {
    icon: Timer,
    title: "Simulace s odpočtem",
    body: "Bloky B/C/F podle vybrané fakulty, skóre a penalizace tam, kde dává smysl trénovat proti hádání.",
  },
  {
    icon: BookOpen,
    title: "Učení po kapitolách",
    body: "Krátký výklad, hned mini test s vysvětlením. Nejdřív pochopit, potom tempo.",
  },
  {
    icon: Target,
    title: "Drill slabých míst",
    body: "Po každém testu vidíte témata pod 70 %. Další sada jde přesně tam.",
  },
  {
    icon: Gauge,
    title: "Týdenní plán",
    body: "Sedm konkrétních kroků — kapitola, drill, simulace, pexeso.",
  },
  {
    icon: Puzzle,
    title: "Pexeso a rychlý kvíz",
    body: "Názvosloví a vztahy, které se biflováním neudrží.",
  },
  {
    icon: GraduationCap,
    title: "Osm českých LF",
    body: "1. LF, 2. LF, 3. LF, LFHK, LFP, MUNI, UPOL, LF OU — tréninkový formát, ne oficiální zadání.",
  },
] as const;

export function MeDiprepLanding() {
  const stats = prepBankStats();
  return (
    <div className="bg-[#F4F7FB]">
      <MeDiprepPwaRegister />
      <section className="relative overflow-hidden border-b border-[#0A192F]/10">
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_0%,rgba(34,211,238,0.22),transparent_42%),radial-gradient(ellipse_at_85%_10%,rgba(163,230,53,0.18),transparent_48%),linear-gradient(165deg,#07111F_0%,#0A192F_48%,#123056_100%)]"
          aria-hidden
        />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <MeDiprepLogo variant="dark" priority />
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200">
              {MEDIPREP.lockline}
            </p>
            <p className="mt-1 text-sm font-medium text-lime-300">Pro studenty a uchazeče o LF</p>
            <h1 className="mt-6 max-w-xl font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
              {MEDIPREP.headline}
              <span className="mt-2 block text-2xl font-semibold text-lime-300 sm:text-3xl">{MEDIPREP.socialLine}</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-8 text-sky-50/95">{MEDIPREP.heroSubline}</p>
            <p className="mt-2 text-base font-medium text-cyan-200">{MEDIPREP.heroSupport}</p>
            <p className="mt-2 max-w-xl text-sm font-semibold text-white">
              Rodiče: první test zdarma ukáže mezery. Pak dává smysl Student {MEDIPREP.priceMonthlyCzk} Kč
              místo nahodilého doučování.
            </p>
            <p className="mt-4 max-w-xl text-sm leading-6 text-sky-100/90">{MEDIPREP_ONBOARDING.marketing.otpBlurb}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <MeDiprepInstallButton variant="hero" tone="light" className="bg-[#F97316] hover:bg-[#ea6a0c]" />
              <Button asChild size="lg" className="h-12 rounded-full bg-white px-6 text-[#0A192F] hover:bg-lime-50">
                <Link href={MEDIPREP.routes.app}>Vyzkoušet v prohlížeči</Link>
              </Button>
            </div>
            <p className="mt-3 text-xs text-sky-100/80">
              Bez nastavování — ikona MeDiprep na ploše.
              {" · "}
              <Link href={MEDIPREP.routes.guide} className="underline underline-offset-2">
                Jak začít
              </Link>
            </p>
            <p className="mt-4 text-xs text-sky-100/75">
              {stats.total} originálních otázek · {PREP_CHAPTERS.length} kapitol · e-mail + kód · {MEDIPREP.domain} ·{" "}
              {MEDIPREP.supportPhone}
            </p>
          </div>
          <Link
            href={`${MEDIPREP.routes.app}?install=1`}
            className="relative block overflow-hidden rounded-2xl border border-cyan-200/20 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.65)]"
          >
            <Image
              src={MEDIPREP.assets.promo}
              alt={`${MEDIPREP.shortName} – ${MEDIPREP.promoLine}`}
              width={1600}
              height={900}
              priority
              className="aspect-[5/4] h-auto w-full object-cover object-[center_38%] sm:aspect-[16/9] sm:object-center"
            />
          </Link>
        </div>
        <div className="relative mx-auto max-w-6xl px-4 pb-10 sm:px-6">
          <Link
            href={`${MEDIPREP.routes.app}?install=1`}
            className="hidden overflow-hidden rounded-2xl border border-white/15 bg-[#07111F] shadow-[0_16px_40px_-20px_rgba(0,0,0,0.55)] md:block"
          >
            <Image
              src={MEDIPREP.assets.banner}
              alt={`${MEDIPREP.shortName} – ${MEDIPREP.headline}`}
              width={1920}
              height={600}
              className="h-auto w-full object-contain object-center"
              priority
            />
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="font-display text-3xl font-bold text-[#0A192F]">Osm českých LF</h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          Simulace podle fakulty. Otázky jsou originální banka MeDiprep — ne oficiální zadání.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PREP_FACULTIES.map((f) => {
            const tot = simulationTotals(f);
            return (
              <Link
                key={f.slug}
                href={`${MEDIPREP.routes.app}?tab=testy&mode=simulation&faculty=${f.slug}`}
                className="rounded-2xl border border-[#0A192F]/10 bg-white p-4 hover:border-[#A3E635]"
              >
                <p className="font-display text-lg font-semibold text-[#0A192F]">{f.shortName}</p>
                <p className="text-xs text-slate-500">{f.city}</p>
                <p className="mt-2 text-xs text-slate-600">
                  {tot.questions} otázek · {tot.minutes} min
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
        <h2 className="font-display text-3xl font-bold text-[#0A192F]">Co studenti stáhnou</h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          Celá příprava běží v aplikaci MeDiprep — testy, kapitoly, drill i hry. Web je jen vstup ke stažení.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((p) => {
            const Icon = p.icon;
            return (
              <article key={p.title} className="rounded-2xl border border-[#0A192F]/10 bg-white p-5">
                <Icon className="h-5 w-5 text-[#F97316]" aria-hidden />
                <h3 className="mt-3 font-display text-lg font-semibold text-[#0A192F]">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.body}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section id="stahnout" className="border-t border-[#0A192F]/10 bg-[#0A192F]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="font-display text-3xl font-bold text-white">Stáhnout MeDiprep</h2>
          <p className="mt-2 max-w-2xl text-sky-100/80">
            {MEDIPREP_ONBOARDING.marketing.startIn30} {MEDIPREP_ONBOARDING.marketing.otpBlurb}
          </p>
          <div className="mt-8">
            <MeDiprepDownloadPanel variant="marketing" />
          </div>
        </div>
      </section>

      <section className="border-t border-[#0A192F]/10 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#F97316]">{MEDIPREP.lockline}</p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-[#0A192F]">
              {MEDIPREP.priceMonthlyCzk} Kč/měsíc · {MEDIPREP.trialDays} dní zdarma
            </h2>
            <p className="mt-2 max-w-xl text-sm text-slate-600">
              {MEDIPREP.partnerLine}. Účet založíte e-mailem, heslo nepotřebujete.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <MeDiprepInstallButton variant="hero" className="bg-[#F97316] hover:bg-[#ea6a0c]" />
            <Button asChild variant="outline" className="rounded-full border-[#0A192F]/20">
              <Link href={MEDIPREP.routes.pricingAnchor}>Předplatné Student</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
