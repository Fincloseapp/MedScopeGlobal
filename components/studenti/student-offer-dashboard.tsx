import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Gift,
  GraduationCap,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { V27CheckoutButton } from "@/components/v27/checkout-button";
import { FacultyDeadlinesBoard } from "@/components/prijimacky/faculty-deadlines-board";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { isCzechFacultyLocale } from "@/lib/i18n/czech-faculty-only-copy";
import {
  facultiesForLocale,
  facultyCountryLabel,
  isCzechFacultySlug,
} from "@/lib/prijimacky/faculties-by-country";
import {
  STUDENT_GIFT_HREF,
  studentIntroCharge,
  studentMonthlyCharge,
  studentPriceLine,
} from "@/lib/studenti/pricing";

const CATEGORIES = [
  {
    href: "/studenti/klub",
    csHref: "/cs/studenti/klub",
    titleCs: "Klub kvízů B/C/F",
    titleEn: "B/C/F quiz club",
    bodyCs: "Osmiotázková kola z banky přijímaček. Nick na tabuli — e-mail nikdy.",
    bodyEn: "Eight-question rounds from the admissions bank. Nickname on the board — never email.",
  },
  {
    href: "/app/priprava",
    csHref: "/cs/app/priprava",
    titleCs: "MeDiprep simulace",
    titleEn: "MeDiprep mocks",
    bodyCs: "1 test zdarma. Cvičení, rychlý drill i simulace podle LF.",
    bodyEn: "1 free test. Drills and faculty-style mocks.",
  },
  {
    href: "/academy/courses?category=prijimacky",
    csHref: "/cs/academy/courses?category=prijimacky",
    titleCs: "Academy přijímačky",
    titleEn: "Admissions Academy",
    bodyCs: "Kurzy biologie, chemie a fyziky — první lekce k nahlédnutí.",
    bodyEn: "Biology, chemistry, physics courses — first lesson as a preview.",
  },
  {
    href: "/studenti/materialy",
    csHref: "/cs/studenti/materialy",
    titleCs: "Materiály a semestr",
    titleEn: "Materials & semester",
    bodyCs: "Knihovna témat, zkoušky, studijní plány.",
    bodyEn: "Topic library, exams, study plans.",
  },
  {
    href: "/studenti/hry",
    csHref: "/cs/studenti/hry",
    titleCs: "Odbornost a hry",
    titleEn: "Clinical games",
    bodyCs: "Anatomie, fyziologie, patologie — krátké opakování.",
    bodyEn: "Anatomy, physiology, pathology — short revision.",
  },
  {
    href: "/studenti/ai-tutor",
    csHref: "/cs/studenti/ai-tutor",
    titleCs: "AI tutor",
    titleEn: "AI tutor",
    bodyCs: "Dotazy k látce, když není čas čekat na seminář.",
    bodyEn: "Ask about a topic when a seminar cannot wait.",
  },
  {
    href: "/studenti/zebricek",
    csHref: "/cs/studenti/zebricek",
    titleCs: "Žebříček přezdívek",
    titleEn: "Nickname board",
    bodyCs: "Jen nicky. Žádná falešná jména, žádný e-mail.",
    bodyEn: "Nicknames only. No fake names, no email.",
  },
  {
    href: "/studenti/chci-studovat",
    csHref: "/cs/studenti/chci-studovat",
    titleCs: "Chci na medicínu",
    titleEn: "I want medicine",
    bodyCs: "Mapa uchazeče — self-test, fakulty, příprava.",
    bodyEn: "Applicant map — self-test, faculties, prep.",
  },
] as const;

export function StudentOfferDashboard({ locale }: { locale: string }) {
  const cs = isCzechFacultyLocale(locale);
  const intro = studentIntroCharge(locale);
  const monthly = studentMonthlyCharge(locale);
  const h = (path: string) => (cs ? localizePublicHref(path, locale) : path.startsWith("/cs/") ? path : `/cs${path.startsWith("/") ? path : `/${path}`}`);
  const faculties = facultiesForLocale(locale);
  const showDetail = faculties.every((f) => isCzechFacultySlug(f.slug));

  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-3xl border border-[#005B96]/20 bg-[linear-gradient(135deg,#f4f9ff_0%,#ffffff_45%,#e8f3ff_100%)] p-6 sm:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#005B96]">
          {cs ? "Student LF · přehled" : "Student plan · dashboard"}
        </p>
        <h2 className="mt-3 max-w-3xl font-display text-3xl font-bold tracking-tight text-[#021d33] sm:text-4xl">
          {cs
            ? "Všechno pro přijímačky a semestr — za cenu jednoho doučování"
            : "Everything for admissions and the semester — priced like one tutoring hour"}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
          {cs
            ? "Jeden test zdarma. Když dnes koupíte (nebo po ochutnávce), první měsíc je 89 Kč. Další měsíce 149 Kč. V EU edicích průběžná cena 10 €. Zrušíte kdykoli. Přijetí na fakultu nepředstíráme."
            : "One free test. Buy today (or after the taste): first month at the intro price, then the regular month. Euro editions list €10 ongoing. Cancel anytime. We do not promise admission."}
        </p>
        <p className="mt-2 text-sm font-semibold text-[#0a4a7a]">{studentPriceLine(locale)}</p>
        <div className="mt-6 flex flex-wrap items-end gap-6">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-500">
              {cs ? "Dnes / po zkoušce" : "Today / after the free test"}
            </p>
            <p className="font-display text-3xl font-bold text-[#005B96]">{intro.formatted}</p>
          </div>
          <ArrowRight className="mb-2 h-5 w-5 text-slate-400" aria-hidden />
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-500">
              {cs ? "Další měsíc" : "Following months"}
            </p>
            <p className="font-display text-3xl font-bold text-[#021d33]">{monthly.formatted}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <V27CheckoutButton
            kind="subscription"
            productId="student-month"
            locale={locale}
            label={cs ? `Koupit dnes · ${intro.formatted}` : `Buy today · ${intro.formatted}`}
            className="rounded-full bg-[#005B96] px-6 text-white"
          />
          <V27CheckoutButton
            kind="subscription"
            productId="student-month"
            locale={locale}
            gift
            label={cs ? "Koupit jako dárek a poslat odkaz" : "Buy as a gift and forward the link"}
            className="rounded-full border border-[#005B96]/30 bg-white px-6 text-[#005B96]"
          />
          <Button asChild variant="ghost" className="rounded-full text-[#005B96]">
            <Link href={h("/app/priprava")}>{cs ? "Nejdřív 1 test zdarma" : "Try 1 free test first"}</Link>
          </Button>
        </div>
        <ul className="mt-6 grid gap-2 sm:grid-cols-2">
          {(cs
            ? [
                "Zrušení kdykoli v Stripe / účtu — žádné skryté poplatky",
                "18+ nebo koupě rodičem, který předá odkaz",
                "Veřejný žebříček jen s přezdívkou",
                "Kvízy MeDiprep jsou pro české LF (B/C/F); fakulty níže jsou oficiální odkazy vaší země",
              ]
            : [
                "Cancel anytime in Stripe / your account — no hidden fees",
                "18+ or a parent purchase that forwards the link",
                "Public board shows a nickname only",
                "MeDiprep quizzes target Czech LF B/C/F; faculties below are official links in your country",
              ]
          ).map((line) => (
            <li key={line} className="flex items-start gap-2 text-xs text-slate-600">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#005B96]" aria-hidden />
              {line}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#005B96]">
          {cs ? "Co je v 149 Kč / 10 €" : "What 149 Kč / €10 opens"}
        </p>
        <h3 className="mt-2 font-display text-2xl font-semibold text-[#021d33]">
          {cs ? "Kompletní studentská mapa" : "The full student map"}
        </h3>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((item) => (
            <Link
              key={item.href}
              href={cs ? localizePublicHref(item.href, locale) : item.csHref}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-4 transition hover:border-[#005B96]/35 hover:bg-[#f8fbff]"
            >
              <BookOpen className="h-4 w-4 text-[#005B96]" aria-hidden />
              <p className="mt-2 font-medium text-[#021d33]">{cs ? item.titleCs : item.titleEn}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{cs ? item.bodyCs : item.bodyEn}</p>
            </Link>
          ))}
        </div>
      </section>

      <FacultyDeadlinesBoard
        compact
        faculties={faculties}
        showFacultyDetail={showDetail}
        cycleLabel={facultyCountryLabel(locale)}
        title={
          cs
            ? `Oficiální weby — ${facultyCountryLabel(locale)}`
            : `Official sites — ${facultyCountryLabel(locale)}`
        }
        lead={
          cs
            ? "Stejný formát jako u českých LF: název, město, oficiální přihláška. Termíny u zahraničních fakult neuvádíme odhadem — vždy ověřte na webu fakulty."
            : "Same format as the Czech faculties: name, city, official application. We do not invent foreign deadlines — always verify on the faculty site."
        }
      />

      <section
        id="pro-rodice"
        className="scroll-mt-24 rounded-3xl border border-[#cfe1f3] bg-white p-6 sm:p-8"
      >
        <div className="flex flex-wrap items-start gap-4">
          <HeartHandshake className="h-7 w-7 shrink-0 text-[#005B96]" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#005B96]">
              {cs ? "Pro rodiče" : "For parents"}
            </p>
            <h3 className="mt-2 font-display text-2xl font-semibold text-[#021d33]">
              {cs ? "Koupíte vy — dítě dostane odkaz" : "You pay — the student gets the link"}
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-700">
              {cs
                ? "Zaplatíte první měsíc 89 Kč (další 149 Kč). Po platbě dostanete odkaz, který přepošlete e-mailem nebo zprávou. Student ho otevře, přihlásí se a aktivuje přístup na svém účtu. Jedna platba = jeden účet. Nepředstíráme přijetí na medicínu."
                : "You pay the intro month, then the regular month. After payment you get a link to forward. The student opens it, signs in and activates access on their account. One payment = one account. We do not claim this gets anyone into medical school."}
            </p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {(cs
                ? [
                    "Odkaz po platbě — žádný druhý nákup",
                    "Zrušení kdykoli, bez vázanosti na akademický rok",
                    "Veřejně jen přezdívka, ne e-mail dítěte",
                    "1 test zdarma, než se rozhodnete",
                  ]
                : [
                    "Link after payment — no second checkout",
                    "Cancel anytime, not tied to an academic year",
                    "Public nickname only — not the student’s email",
                    "1 free test before you decide",
                  ]
              ).map((line) => (
                <li key={line} className="flex items-start gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#005B96]" aria-hidden />
                  {line}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-2">
              <V27CheckoutButton
                kind="subscription"
                productId="student-month"
                locale={locale}
                gift
                label={cs ? "Zaplatit dárek" : "Pay for the gift"}
                className="rounded-full bg-[#005B96] px-6 text-white"
              />
              <Button asChild variant="outline" className="rounded-full">
                <Link href={localizePublicHref(STUDENT_GIFT_HREF, locale)}>
                  <Gift className="mr-2 h-4 w-4" />
                  {cs ? "Jak odkaz funguje" : "How the link works"}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-[#005B96]/20 bg-[#021d33] p-6 text-white sm:p-8">
        <div className="flex flex-wrap items-start gap-3">
          <Sparkles className="h-6 w-6 text-sky-200" aria-hidden />
          <div>
            <h3 className="font-display text-xl font-semibold sm:text-2xl">
              {cs ? "Není to drahé. Je to pravidelný trénink." : "It is not expensive. It is regular training."}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-sky-100">
              {cs
                ? "89 Kč dnes, 149 Kč příští měsíc — méně než jedno doučování. Kvízy, fakulty, Academy a AI tutor na jednom místě. Když to nesedí, zrušíte před dalším inkasem."
                : "Intro month, then the regular month — less than one tutoring session. Quizzes, faculty links, Academy and the AI tutor in one place. If it is not a fit, cancel before the next charge."}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild className="rounded-full bg-white text-[#005B96] hover:bg-sky-50">
                <Link href={h("/app/priprava")}>
                  {cs ? "Spustit volný test" : "Start the free test"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <span className="inline-flex items-center gap-2 text-xs text-sky-200">
                <Target className="h-4 w-4" aria-hidden />
                {cs ? "Uchazeč · student LF · rodič" : "Applicant · faculty student · parent"}
                <GraduationCap className="h-4 w-4" aria-hidden />
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
