import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  HeartHandshake,
  Sparkles,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { getMarketingCopy } from "@/lib/i18n/marketing-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { StudentOfferDashboard } from "@/components/studenti/student-offer-dashboard";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getMarketingCopy(locale).students;
  return await buildLocalizedV20PageMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: "/studenti",
    locale,
  });
}

const APPLICANT_HREFS = [
  "/studenti/chci-studovat",
  "/academy/prijimacky/self-test",
  "/studium/prijimacky",
] as const;
const APPLICANT_STEP_HREFS = [
  "/app/priprava",
  "/academy/courses?category=prijimacky",
  "/predplatne#student",
] as const;
const LF_HREFS = ["/studenti/materialy", "/studenti/testy", "/studenti/ai-tutor"] as const;
const LF_STEP_HREFS = ["/studenti/materialy", "/studenti/testy", "/studenti/ai-tutor"] as const;
const MORE_HREFS = ["/studenti/hry", "/studenti/leky", "/studenti/zkousky", "/medicina/plany"] as const;

function StepCards({
  steps,
  hrefs,
  locale,
}: {
  steps: readonly { title: string; body: string; cta: string }[];
  hrefs: readonly string[];
  locale: string;
}) {
  return (
    <ol className="mt-6 grid gap-4 sm:grid-cols-3">
      {steps.map((step, index) => (
        <li
          key={step.title}
          className="flex flex-col rounded-2xl border border-white bg-white/90 p-5 shadow-[0_12px_28px_-24px_rgba(0,91,150,0.45)]"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#005B96] text-sm font-bold text-white">
            {index + 1}
          </span>
          <p className="mt-3 font-medium text-[#021d33]">{step.title}</p>
          <p className="mt-1 flex-1 text-xs leading-relaxed text-slate-500">{step.body}</p>
          <Link
            href={localizePublicHref(hrefs[index] ?? "/studenti", locale)}
            className="mt-4 inline-flex items-center text-sm font-medium text-[#005B96] hover:underline"
          >
            {step.cta}
            <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </li>
      ))}
    </ol>
  );
}

export default async function StudentiHubPage() {
  const locale = await getServerLocale();
  const copy = getMarketingCopy(locale).students;
  const h = (path: string) => localizePublicHref(path, locale);

  return (
    <>
      <section className="relative overflow-hidden border-b border-[#d9e8f4]">
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_0%,rgba(0,91,150,0.14),transparent_55%),radial-gradient(ellipse_50%_40%_at_90%_20%,rgba(14,116,144,0.08),transparent_50%),linear-gradient(180deg,#f8fbff_0%,#ffffff_70%)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="msg-hero-copy text-[11px] font-semibold uppercase tracking-[0.3em] text-[#005B96]">
            {copy.eyebrow}
          </p>
          <h1 className="msg-hero-copy mt-4 max-w-3xl font-display text-4xl font-bold tracking-tight text-[#021d33] sm:text-5xl">
            {copy.title}
            <span className="mt-1 block text-[0.85em] font-semibold text-[#005B96]">{copy.titleLine2}</span>
          </h1>
          <p className="msg-hero-copy mt-5 max-w-xl text-lg leading-8 text-slate-600">{copy.lead}</p>
          <p className="msg-hero-copy mt-3 text-sm font-medium text-[#0a4a7a]/90">{copy.priceLine}</p>
          <div className="msg-hero-cta mt-8 flex flex-wrap gap-3">
            <Button asChild className="rounded-full bg-[#005B96] px-6">
              <Link href="/app/priprava">
                {copy.downloadPrep}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-[#005B96]/35 px-6">
              <Link href={h("/studenti/chci-studovat")}>{copy.wantMedicine}</Link>
            </Button>
            <Button asChild variant="ghost" className="rounded-full text-[#005B96]">
              <Link href="#pro-rodice">{copy.iAmParent}</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-[#005B96]/35 px-6">
              <Link href={h("/studenti/klub")}>Klub kvízů</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <nav className="mb-8 text-sm text-muted-foreground" aria-label={copy.crumbAria}>
          <Link href={h("/")} className="hover:text-foreground">
            {copy.home}
          </Link>
          <span className="mx-2">/</span>
          <span>{copy.students}</span>
        </nav>

        <div className="mb-12">
          <StudentOfferDashboard locale={locale} />
        </div>

        <section className="msg-path mb-12 rounded-3xl border border-[#cfe1f3] bg-[#f0f7ff]/70 p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#005B96]">
            {copy.applicantEyebrow}
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-[#021d33]">{copy.applicantTitle}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">{copy.applicantLead}</p>
          <StepCards steps={copy.applicantSteps} hrefs={APPLICANT_STEP_HREFS} locale={locale} />
        </section>

        <section
          id="klub-kvizu"
          className="mb-12 scroll-mt-24 rounded-3xl border border-[#cfe1f3] bg-white p-6 sm:p-8"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#005B96]">
            Kvízy · odbornost · univerzity
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-[#021d33]">
            Přehledná mapa klubu
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
            Soutěžní kvízy z banky přijímaček, studijní hry, oficiální weby fakult a žebříček
            přezdívek. 1 test zdarma — první měsíc 89 Kč, další 149 Kč, zrušíte kdykoli.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                href: "/studenti/klub",
                title: "Soutěžní kvízy",
                body: "8 otázek z biologie, chemie a fyziky. Nick na tabuli, e-mail jen u účtu.",
              },
              {
                href: "/studenti/hry",
                title: "Odbornost",
                body: "Anatomie, fyziologie, patologie — existující studijní hry a materiály.",
              },
              {
                href: "/studenti/chci-studovat",
                title: "Univerzity",
                body: "Osm českých lékařských fakult, termíny a příprava na přijímačky.",
              },
              {
                href: "/studenti/zebricek",
                title: "Žebříček",
                body: "Kdo je teď nejlepší — jen přezdívky, žádná falešná jména.",
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={h(item.href)}
                className="rounded-2xl border border-slate-200 bg-[#f8fbff] px-4 py-4 transition hover:border-[#005B96]/35 hover:bg-white"
              >
                <p className="font-medium text-[#021d33]">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.body}</p>
              </Link>
            ))}
          </div>
        </section>

        <p className="msg-path mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#005B96]">
          {copy.pickPath}
        </p>

        <div className="msg-path grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-[#cfe1f3] bg-white p-6 shadow-[0_20px_44px_-32px_rgba(0,91,150,0.5)]">
            <div className="flex items-start gap-3">
              <Target className="mt-0.5 h-7 w-7 shrink-0 text-[#005B96]" aria-hidden />
              <div>
                <h2 className="font-display text-2xl font-semibold text-[#021d33]">{copy.applicantH2}</h2>
                <p className="mt-1 text-sm text-slate-600">{copy.applicantSub}</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-700">{copy.applicantBody}</p>
            <ul className="mt-5 space-y-2">
              {copy.applicant.map((item, index) => (
                <li key={item.href}>
                  <Link
                    href={h(APPLICANT_HREFS[index] ?? item.href)}
                    className="group flex items-start justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 transition hover:border-[#005B96]/45 hover:bg-[#f8fbff]"
                  >
                    <span>
                      <span className="block font-medium text-[#021d33] group-hover:text-[#005B96]">
                        {item.title}
                      </span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">{item.body}</span>
                    </span>
                    <ArrowRight
                      className="mt-1 h-4 w-4 shrink-0 text-[#005B96] transition group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-5">
              <Button asChild className="rounded-full bg-[#005B96]">
                <Link href={h("/studenti/chci-studovat")}>
                  {copy.openPrep}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </section>

          <section id="pro-studenty-lf" className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6">
            <div className="flex items-start gap-3">
              <GraduationCap className="mt-0.5 h-7 w-7 shrink-0 text-[#005B96]" aria-hidden />
              <div>
                <h2 className="font-display text-2xl font-semibold text-[#021d33]">{copy.onLfH2}</h2>
                <p className="mt-1 text-sm text-slate-600">{copy.onLfSub}</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-700">{copy.onLfBody}</p>
            <ul className="mt-5 space-y-2">
              {copy.onLf.map((item, index) => (
                <li key={item.href}>
                  <Link
                    href={h(LF_HREFS[index] ?? item.href)}
                    className="group flex items-start justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 transition hover:border-[#005B96]/45 hover:bg-[#f8fbff]"
                  >
                    <span>
                      <span className="block font-medium text-[#021d33] group-hover:text-[#005B96]">
                        {item.title}
                      </span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">{item.body}</span>
                    </span>
                    <ArrowRight
                      className="mt-1 h-4 w-4 shrink-0 text-[#005B96] transition group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button asChild className="rounded-full bg-[#005B96]">
                <Link href={h("/studenti/materialy")}>
                  {copy.openMaterials}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href={h("/predplatne#student")}>{copy.studentPlan}</Link>
              </Button>
            </div>
          </section>
        </div>

        <section id="lf-start" className="msg-path mt-10 scroll-mt-24 rounded-3xl border border-slate-200 bg-slate-50/80 p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#005B96]">{copy.lfEyebrow}</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-[#021d33]">{copy.lfTitle}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">{copy.lfLead}</p>
          <StepCards steps={copy.lfSteps} hrefs={LF_STEP_HREFS} locale={locale} />
        </section>

        <section id="pro-rodice" className="mt-12 scroll-mt-24 rounded-3xl border border-[#cfe1f3] bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-start gap-4">
            <HeartHandshake className="h-7 w-7 shrink-0 text-[#005B96]" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#005B96]">
                {copy.parentsEyebrow}
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-[#021d33]">{copy.parentsTitle}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-700">{copy.parentsBody}</p>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {copy.parentBullets.map((line) => (
                  <li key={line} className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#005B96]" aria-hidden />
                    {line}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-2">
                <Button asChild className="rounded-full bg-[#005B96]">
                  <Link href={h("/studenti/darkove")} data-cta="studenti-parent-gift">
                    {copy.giftTrial}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full">
                  <Link href={h("/studenti/chci-studovat")} data-cta="studenti-parent-prep">
                    {copy.showPrep}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12 overflow-hidden rounded-3xl border border-[#005B96]/25 bg-[linear-gradient(135deg,#005B96_0%,#0a4a7a_55%,#021d33_100%)] p-6 text-white sm:p-8">
          <div className="flex flex-wrap items-start gap-4">
            <Sparkles className="h-6 w-6 shrink-0 text-sky-200" aria-hidden />
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-xl font-semibold sm:text-2xl">{copy.subTitle}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-sky-100">{copy.subLead}</p>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {copy.subBenefits.map((line) => (
                  <li key={line} className="flex items-start gap-2 text-sm text-sky-50">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" aria-hidden />
                    {line}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-2">
                <Button asChild className="rounded-full bg-white text-[#005B96] hover:bg-sky-50">
                  <Link href={h("/predplatne#student")} data-cta="studenti-sub-buy">
                    {copy.daysFree}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full border-white/40 bg-transparent text-white hover:bg-white/10"
                >
                  <Link href={h("/predplatne#student")}>{copy.comparePlans}</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-semibold text-[#021d33]">{copy.moreTitle}</h2>
              <p className="mt-1 text-sm text-slate-600">{copy.moreLead}</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {copy.more.map((item, index) => (
              <Link
                key={item.href}
                href={h(MORE_HREFS[index] ?? item.href)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-4 transition hover:border-[#005B96]/35 hover:bg-[#f8fbff]"
              >
                <BookOpen className="h-4 w-4 text-[#005B96]" aria-hidden />
                <p className="mt-2 font-medium text-[#021d33]">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.body}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
