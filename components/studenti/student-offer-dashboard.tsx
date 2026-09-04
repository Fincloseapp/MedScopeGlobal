import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Gift,
  GraduationCap,
  ShieldCheck,
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
import { APP_MARKETING_IMAGE } from "@/lib/brand/marketing-visuals";
import { MAGAZINE } from "@/lib/brand/magazine";
import {
  STUDENT_GIFT_HREF,
  studentIntroCharge,
  studentMonthlyCharge,
  studentPriceLine,
} from "@/lib/studenti/pricing";

const PHOTO = {
  hero: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1600&h=1100&fit=crop&q=80&auto=format",
  study: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&h=800&fit=crop&q=80&auto=format",
  lab: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=900&h=700&fit=crop&q=80&auto=format",
  peers: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&h=800&fit=crop&q=80&auto=format",
  clinic: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=900&h=700&fit=crop&q=80&auto=format",
  books: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=900&h=700&fit=crop&q=80&auto=format",
  parent: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&h=800&fit=crop&q=80&auto=format",
} as const;

const CATEGORIES = [
  {
    href: "/studenti/klub",
    csHref: "/cs/studenti/klub",
    image: PHOTO.lab,
    titleCs: "Klub kvízů B/C/F",
    titleEn: "B/C/F quiz club",
    bodyCs: "Osm otázek z banky přijímaček. Na tabuli jen přezdívka.",
    bodyEn: "Eight admissions questions. Nickname on the board only.",
  },
  {
    href: "/app/priprava",
    csHref: "/cs/app/priprava",
    image: APP_MARKETING_IMAGE.mediprep,
    titleCs: "MeDiprep simulace",
    titleEn: "MeDiprep mocks",
    bodyCs: "1 test zdarma. Cvičení, drill i simulace podle LF.",
    bodyEn: "1 free test. Drills and faculty-style mocks.",
  },
  {
    href: "/academy/courses?category=prijimacky",
    csHref: "/cs/academy/courses?category=prijimacky",
    image: PHOTO.clinic,
    titleCs: "Academy přijímačky",
    titleEn: "Admissions Academy",
    bodyCs: "Biologie, chemie, fyzika — první lekce k nahlédnutí.",
    bodyEn: "Biology, chemistry, physics — first lesson as a preview.",
  },
  {
    href: "/studenti/materialy",
    csHref: "/cs/studenti/materialy",
    image: PHOTO.books,
    titleCs: "Materiály a semestr",
    titleEn: "Materials & semester",
    bodyCs: "Knihovna témat, zkoušky, studijní plány.",
    bodyEn: "Topic library, exams, study plans.",
  },
  {
    href: "/studenti/hry",
    csHref: "/cs/studenti/hry",
    image: PHOTO.study,
    titleCs: "Odbornost a hry",
    titleEn: "Clinical games",
    bodyCs: "Anatomie, fyziologie, patologie — krátké opakování.",
    bodyEn: "Anatomy, physiology, pathology — short revision.",
  },
  {
    href: "/studenti/ai-tutor",
    csHref: "/cs/studenti/ai-tutor",
    image: "/assets/ai/assistant-brunette.webp",
    titleCs: "AI tutor",
    titleEn: "AI tutor",
    bodyCs: "Dotaz k látce, když seminář nemůže počkat.",
    bodyEn: "Ask about a topic when a seminar cannot wait.",
  },
  {
    href: "/studenti/zebricek",
    csHref: "/cs/studenti/zebricek",
    image: PHOTO.peers,
    titleCs: "Žebříček přezdívek",
    titleEn: "Nickname board",
    bodyCs: "Jen nicky. Žádná falešná jména, žádný e-mail.",
    bodyEn: "Nicknames only. No fake names, no email.",
  },
  {
    href: "/studenti/chci-studovat",
    csHref: "/cs/studenti/chci-studovat",
    image: PHOTO.hero,
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
  const productHref = (path: string, csHref: string) =>
    cs ? localizePublicHref(path, locale) : csHref;
  const faculties = facultiesForLocale(locale);
  const showDetail = faculties.every((f) => isCzechFacultySlug(f.slug));

  return (
    <div className="space-y-14">
      <section className="relative overflow-hidden rounded-[2rem] bg-[#021d33] text-white shadow-[0_40px_80px_-40px_rgba(2,29,51,0.65)]">
        <Image
          src={PHOTO.hero}
          alt={cs ? "Příprava na lékařskou fakultu" : "Preparing for medical school"}
          fill
          priority
          className="object-cover opacity-35"
          sizes="(max-width: 1024px) 100vw, 1100px"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#021d33] via-[#021d33]/88 to-[#021d33]/35" />
        <div className="relative grid gap-10 px-6 py-12 sm:px-10 lg:grid-cols-[1.15fr_0.85fr] lg:py-16">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#d4af37]">
              {cs ? "Student LF · ViaLongeVita" : "Student plan · ViaLongeVita"}
            </p>
            <h2 className="mt-4 max-w-xl font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
              {cs ? (
                <>
                  Příprava, která vypadá
                  <span className="mt-1 block text-[#9fd4ff]">jako studium — ne jako sleva.</span>
                </>
              ) : (
                <>
                  Prep that looks like
                  <span className="mt-1 block text-[#9fd4ff]">study — not a discount bin.</span>
                </>
              )}
            </h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-sky-100/90">
              {cs
                ? "Sestaveno podle oficiálních požadavků lékařských fakult a banky B/C/F. 1 test zdarma. Dnes 89 Kč, další měsíc 149 Kč. V EU 10 €. Zrušíte kdykoli. Přijetí nepředstíráme."
                : "Built from official faculty requirements and the B/C/F bank. 1 free test. Intro month, then the regular month (€10 in EU editions). Cancel anytime. We do not promise admission."}
            </p>
            <p className="mt-3 text-sm font-medium text-[#d4af37]">{studentPriceLine(locale)}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <V27CheckoutButton
                kind="subscription"
                productId="student-month"
                locale={locale}
                label={cs ? `Otevřít měsíc · ${intro.formatted}` : `Open the month · ${intro.formatted}`}
                className="rounded-full bg-white px-6 text-[#021d33] hover:bg-sky-50"
              />
              <V27CheckoutButton
                kind="subscription"
                productId="student-month"
                locale={locale}
                gift
                label={cs ? "Koupit jako dárek" : "Buy as a gift"}
                className="rounded-full border border-white/35 bg-transparent px-6 text-white hover:bg-white/10"
              />
              <Button asChild variant="ghost" className="rounded-full text-sky-100 hover:bg-white/10 hover:text-white">
                <Link href={productHref("/app/priprava", "/cs/app/priprava")}>
                  {cs ? "Nejdřív 1 test" : "Try 1 free test"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="relative hidden min-h-[320px] lg:block">
            <div className="absolute right-0 top-0 h-[78%] w-[78%] overflow-hidden rounded-[1.6rem] border border-white/15 shadow-2xl">
              <Image
                src={PHOTO.study}
                alt=""
                fill
                className="object-cover"
                sizes="420px"
              />
            </div>
            <div className="absolute bottom-0 left-0 h-[58%] w-[48%] overflow-hidden rounded-[1.4rem] border border-white/20 shadow-2xl">
              <Image
                src={APP_MARKETING_IMAGE.mediprep}
                alt="MeDiprep"
                fill
                className="object-cover object-top"
                sizes="240px"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {(cs
          ? [
              ["B/C/F", "Stejné předměty jako u českých přijímaček"],
              ["Oficiální fakulty", "Odkazy na weby škol ve vaší zemi — termíny jen z nich"],
              ["Bez hry na drahé", `${intro.formatted} dnes · ${monthly.formatted} dál · zrušíte kdykoli`],
            ]
          : [
              ["B/C/F", "The same science subjects as Czech admissions"],
              ["Official faculties", "School sites in your country — dates only from them"],
              ["Priced like one lesson", `${intro.formatted} today · then ${monthly.formatted} · cancel anytime`],
            ]
        ).map(([title, body]) => (
          <div
            key={title}
            className="rounded-2xl border border-[#d7e6f3] bg-white px-5 py-4 shadow-[0_16px_40px_-28px_rgba(2,29,51,0.35)]"
          >
            <p className="font-display text-lg font-semibold text-[#021d33]">{title}</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">{body}</p>
          </div>
        ))}
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#005B96]">
              {cs ? "Mapa místností" : "Room map"}
            </p>
            <h3 className="mt-2 font-display text-3xl font-semibold text-[#021d33]">
              {cs ? "Vše, co student opravdu otevře" : "Everything a student actually opens"}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              {cs
                ? "Přehled kategorií — ne seznam slev. Kvízy MeDiprep jsou české B/C/F. Fakulty níže jsou oficiální odkazy vaší země."
                : "A map of rooms — not a coupon list. MeDiprep quizzes are Czech B/C/F. Faculties below are official links in your country."}
            </p>
          </div>
          <Image
            src={MAGAZINE.emailLockup}
            alt={MAGAZINE.name}
            width={220}
            height={62}
            className="h-10 w-auto object-contain opacity-80"
          />
        </div>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((item) => (
            <Link
              key={item.href}
              href={productHref(item.href, item.csHref)}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_40px_-32px_rgba(2,29,51,0.45)] transition hover:-translate-y-0.5 hover:border-[#005B96]/35"
            >
              <div className="relative aspect-[5/3] overflow-hidden bg-[#0a2a44]">
                <Image
                  src={item.image}
                  alt=""
                  fill
                  className="object-cover transition duration-500 group-hover:scale-[1.04]"
                  sizes="(max-width: 640px) 100vw, 280px"
                />
              </div>
              <div className="px-4 py-4">
                <p className="font-display text-lg font-semibold text-[#021d33]">
                  {cs ? item.titleCs : item.titleEn}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  {cs ? item.bodyCs : item.bodyEn}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-[#cfe1f3] bg-[#f4f8fc]">
        <div className="grid lg:grid-cols-2">
          <div className="relative min-h-[280px]">
            <Image
              src={PHOTO.peers}
              alt={cs ? "Studenti u přípravy" : "Students preparing"}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 560px"
            />
          </div>
          <div className="flex flex-col justify-center px-6 py-10 sm:px-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#005B96]">
              {cs ? "Cena jako jedno doučování" : "Priced like one tutoring hour"}
            </p>
            <div className="mt-5 flex flex-wrap items-end gap-8">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  {cs ? "Dnes / po testu" : "Today / after the test"}
                </p>
                <p className="font-display text-5xl font-bold tracking-tight text-[#005B96]">
                  {intro.formatted}
                </p>
              </div>
              <ArrowRight className="mb-3 h-6 w-6 text-slate-300" aria-hidden />
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  {cs ? "Další měsíc" : "Following months"}
                </p>
                <p className="font-display text-5xl font-bold tracking-tight text-[#021d33]">
                  {monthly.formatted}
                </p>
              </div>
            </div>
            <ul className="mt-6 space-y-2">
              {(cs
                ? [
                    "Zrušení kdykoli v účtu / Stripe",
                    "18+ nebo koupě rodičem s předáním odkazu",
                    "Veřejný žebříček jen s přezdívkou",
                  ]
                : [
                    "Cancel anytime in your account / Stripe",
                    "18+ or a parent purchase that forwards the link",
                    "Public board shows a nickname only",
                  ]
              ).map((line) => (
                <li key={line} className="flex items-start gap-2 text-sm text-slate-600">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#005B96]" aria-hidden />
                  {line}
                </li>
              ))}
            </ul>
          </div>
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
            ? "Stejný formát jako u českých LF. Zahraniční termíny neuvádíme odhadem — vždy ověřte na webu fakulty."
            : "Same format as the Czech faculties. We do not invent foreign deadlines — always verify on the faculty site."
        }
      />

      <section
        id="pro-rodice"
        className="scroll-mt-24 overflow-hidden rounded-[2rem] border border-[#cfe1f3] bg-white"
      >
        <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative min-h-[260px]">
            <Image
              src={PHOTO.parent}
              alt={cs ? "Příprava, kterou může koupit i rodič" : "Prep a parent can buy"}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 480px"
            />
          </div>
          <div className="px-6 py-10 sm:px-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#005B96]">
              {cs ? "Pro rodiče" : "For parents"}
            </p>
            <h3 className="mt-3 font-display text-3xl font-semibold text-[#021d33]">
              {cs ? "Zaplatíte vy. Odkaz pošlete." : "You pay. They get the link."}
            </h3>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600">
              {cs
                ? "První měsíc 89 Kč, další 149 Kč. Po platbě vznikne odkaz. Student ho otevře, přihlásí se a aktivuje přístup. Jedna platba = jeden účet. Není to přijímací řízení."
                : "Intro month, then the regular month. Payment creates a link. The student signs in and activates access. One payment = one account. This is not an admissions exam."}
            </p>
            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {(cs
                ? [
                    "Odkaz po platbě — žádný druhý nákup",
                    "Zrušení kdykoli",
                    "Veřejně jen přezdívka",
                    "Nejdřív 1 test zdarma",
                  ]
                : [
                    "Link after payment — no second checkout",
                    "Cancel anytime",
                    "Public nickname only",
                    "1 free test first",
                  ]
              ).map((line) => (
                <li key={line} className="flex items-start gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#005B96]" aria-hidden />
                  {line}
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-wrap gap-2">
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

      <p className="flex items-center justify-center gap-2 text-center text-xs text-slate-500">
        <GraduationCap className="h-3.5 w-3.5" aria-hidden />
        {cs
          ? "Uchazeč · student LF · rodič — bez vymyšlených recenzí a bez slibu přijetí."
          : "Applicant · faculty student · parent — no invented reviews, no admission promise."}
      </p>
    </div>
  );
}
