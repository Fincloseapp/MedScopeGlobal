import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { V27CheckoutButton } from "@/components/v27/checkout-button";
import { StudentStudioDesk } from "@/components/studenti/student-studio-desk";
import { StudentSectionNav } from "@/components/studenti/student-section-nav";
import { studentPublicHref } from "@/lib/studenti/href";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { chromePack } from "@/lib/i18n/chrome-pack";
import {
  facultiesForLocale,
  facultyCountryLabel,
} from "@/lib/prijimacky/faculties-by-country";
import { APP_MARKETING_IMAGE } from "@/lib/brand/marketing-visuals";
import {
  STUDENT_GIFT_HREF,
  studentIntroCharge,
  studentMonthlyCharge,
} from "@/lib/studenti/pricing";
import { generateSelfTest } from "@/lib/prijimacky/quiz-from-bank";
import { subjectLabel } from "@/lib/prijimacky/faculties-admissions";

const PHOTO = {
  cover: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1800&h=1200&fit=crop&q=80&auto=format",
  lab: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&h=900&fit=crop&q=80&auto=format",
  notes: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=900&fit=crop&q=80&auto=format",
  anatomy: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=900&h=700&fit=crop&q=80&auto=format",
} as const;

const ROOMS = [
  {
    href: "/studenti/klub",
    csHref: "/cs/studenti/klub",
    image: PHOTO.lab,
    featured: true,
    title: { cs: "Klub B/C/F", en: "B/C/F club", de: "B/C/F-Club", fr: "Club B/C/F" },
    body: {
      cs: "Osm otázek z banky přijímaček. Na tabuli jen přezdívka.",
      en: "Eight admissions questions. Nickname on the board only.",
      de: "Acht Aufnahmefragen. Nur ein Spitzname auf der Tafel.",
      fr: "Huit questions d’admission. Surnom uniquement.",
    },
  },
  {
    href: "/app/priprava",
    csHref: "/app/priprava",
    image: APP_MARKETING_IMAGE.mediprep,
    featured: true,
    title: { cs: "MeDiprep desk", en: "MeDiprep desk", de: "MeDiprep-Desk", fr: "Bureau MeDiprep" },
    body: {
      cs: "1 test zdarma. Cvičení a simulace podle požadavků LF.",
      en: "1 free test. Drills and mocks from faculty requirements.",
      de: "1 Test frei. Übungen nach Fakultätsanforderungen.",
      fr: "1 test offert. Exercices selon les exigences facultaires.",
    },
  },
  {
    href: "/studenti/testy",
    csHref: "/cs/studenti/testy",
    image: PHOTO.notes,
    title: { cs: "Testy", en: "Tests", de: "Tests", fr: "Tests" },
    body: {
      cs: "Self-test, klub a hry — jedna mapa k procvičení.",
      en: "Self-test, club and games — one map for drills.",
      de: "Selbsttest, Club und Spiele — eine Karte zum Üben.",
      fr: "Auto-test, club et jeux — une carte d’entraînement.",
    },
  },
  {
    href: "/academy/courses?category=prijimacky",
    csHref: "/cs/academy/courses?category=prijimacky",
    image: PHOTO.anatomy,
    title: { cs: "Academy", en: "Academy", de: "Academy", fr: "Academy" },
    body: {
      cs: "Biologie, chemie, fyzika — první lekce k nahlédnutí.",
      en: "Biology, chemistry, physics — first lesson as a preview.",
      de: "Biologie, Chemie, Physik — erste Lektion zum Einblick.",
      fr: "Biologie, chimie, physique — première leçon en aperçu.",
    },
  },
  {
    href: "/studenti/materialy",
    csHref: "/cs/studenti/materialy",
    image: PHOTO.notes,
    title: { cs: "Materiály", en: "Materials", de: "Material", fr: "Supports" },
    body: {
      cs: "Témata, zkoušky, semestr — knihovna, ne skládka souborů.",
      en: "Topics, exams, semester — a library, not a file dump.",
      de: "Themen, Prüfungen, Semester — Bibliothek, kein Dateiordner.",
      fr: "Sujets, examens, semestre — une bibliothèque.",
    },
  },
  {
    href: "/studenti/ai-tutor",
    csHref: "/cs/studenti/ai-tutor",
    image: "/assets/ai/assistant-brunette.webp",
    title: { cs: "AI tutor", en: "AI tutor", de: "KI-Tutor", fr: "Tuteur IA" },
    body: {
      cs: "Vysvětlení látky. Nevymýšlí fakta ani slib přijetí.",
      en: "Explains the topic. Does not invent facts or promise admission.",
      de: "Erklärt das Thema. Erfindet keine Fakten, verspricht keine Zulassung.",
      fr: "Explique le sujet. N’invente pas de faits, ne promet pas l’admission.",
    },
  },
  {
    href: "/studenti/hry",
    csHref: "/cs/studenti/hry",
    image: PHOTO.cover,
    title: { cs: "Odbornost", en: "Revision", de: "Wiederholung", fr: "Révision" },
    body: {
      cs: "Krátké opakování anatomie, fyziologie, patologie.",
      en: "Short revision of anatomy, physiology, pathology.",
      de: "Kurze Wiederholung Anatomie, Physiologie, Pathologie.",
      fr: "Révision courte : anatomie, physiologie, pathologie.",
    },
  },
  {
    href: "/studenti/zebricek",
    csHref: "/cs/studenti/zebricek",
    image: PHOTO.notes,
    title: { cs: "Žebříček", en: "Board", de: "Tafel", fr: "Tableau" },
    body: {
      cs: "Jen přezdívky. Žádný e-mail, žádná falešná jména.",
      en: "Nicknames only. No email, no invented names.",
      de: "Nur Spitznamen. Keine E-Mail, keine erfundenen Namen.",
      fr: "Surnoms seulement. Pas d’e-mail, pas de faux noms.",
    },
  },
  {
    href: "/studenti/chci-studovat",
    csHref: "/cs/studenti/chci-studovat",
    image: PHOTO.lab,
    title: { cs: "Chci na medicínu", en: "I want medicine", de: "Ich will Medizin", fr: "Je veux la médecine" },
    body: {
      cs: "Self-test, fakulty, příprava — jedna osa uchazeče.",
      en: "Self-test, faculties, prep — one applicant axis.",
      de: "Selbsttest, Fakultäten, Vorbereitung — eine Achse.",
      fr: "Auto-test, facultés, prépa — un seul axe.",
    },
  },
] as const;

type Pack = "cs" | "en" | "de" | "fr";

function packOf(locale: string): Pack {
  const key = chromePack(locale);
  if (key === "cs" || key === "de" || key === "fr") return key;
  return "en";
}

const COPY: Record<
  Pack,
  {
    kicker: string;
    title: [string, string];
    lead: string;
    open: string;
    test: string;
    gift: string;
    methodKicker: string;
    methodTitle: string;
    method: [string, string, string][];
    roomsKicker: string;
    roomsTitle: string;
    roomsLead: string;
    facultyKicker: string;
    facultyLead: string;
    official: string;
    parentKicker: string;
    parentTitle: string;
    parentLead: string;
    parentCta: string;
    footnote: string;
  }
> = {
  cs: {
    kicker: "Ateliér Student LF",
    title: ["Jedna mapa.", "Od požadavků fakult k dennímu kvízu."],
    lead: "Sestaveno podle oficiálních požadavků lékařských fakult, banky B/C/F a toho, co uchazeči i studenti LF opravdu otevírají. Žádné vymyšlené recenze. Přijetí neslibujeme.",
    open: "Otevřít desk",
    test: "Nejdřív 1 test",
    gift: "Poslat jako dárek",
    methodKicker: "Jak to vzniklo",
    methodTitle: "Fakulty, pedagogika, studenti — ve stejném pořadí.",
    method: [
      ["01  Fakulty", "Oficiální weby škol ve vaší zemi. Termíny jen z nich — nic si nevymýšlíme.", ""],
      ["02  Pedagogika", "Stejné předměty jako u přijímaček: biologie, chemie, fyzika. Banka B/C/F.", ""],
      ["03  Studenti", "Desk ukazuje místnosti, které se skutečně používají — kvíz, simulace, tutor, semestr.", ""],
    ],
    roomsKicker: "Desk",
    roomsTitle: "Místnosti, ne slevy.",
    roomsLead: "Přehled toho, co otevřete po prvním testu. Kvízy MeDiprep zůstávají české B/C/F.",
    facultyKicker: "Konzultace s weby škol",
    facultyLead: "Stejný formát jako u českých LF. Zahraniční termíny neuvádíme odhadem.",
    official: "Oficiální web",
    parentKicker: "Rodiče",
    parentTitle: "Zaplatíte. Odkaz pošlete.",
    parentLead: "Jedna platba, jeden účet. Student ho aktivuje po přihlášení. Veřejně zůstane přezdívka. 18+ nebo se souhlasem zákonného zástupce.",
    parentCta: "Jak odkaz funguje",
    footnote: "Uchazeč · student LF · rodič — bez slibu přijetí.",
  },
  en: {
    kicker: "Student LF atelier",
    title: ["One map.", "From faculty requirements to the daily quiz."],
    lead: "Built from official faculty requirements, the B/C/F bank, and the rooms applicants and faculty students actually open. No invented reviews. We do not promise admission.",
    open: "Open the desk",
    test: "Try 1 free test",
    gift: "Send as a gift",
    methodKicker: "How it was made",
    methodTitle: "Faculties, pedagogy, students — in that order.",
    method: [
      ["01  Faculties", "Official school sites in your country. Dates only from them — we invent none.", ""],
      ["02  Pedagogy", "The same subjects as admissions: biology, chemistry, physics. The B/C/F bank.", ""],
      ["03  Students", "The desk shows rooms people actually use — quiz, mocks, tutor, semester.", ""],
    ],
    roomsKicker: "Desk",
    roomsTitle: "Rooms, not coupons.",
    roomsLead: "What you open after the free test. MeDiprep quizzes stay Czech B/C/F.",
    facultyKicker: "Read from the school sites",
    facultyLead: "Same format as the Czech faculties. We do not invent foreign deadlines.",
    official: "Official site",
    parentKicker: "Parents",
    parentTitle: "You pay. They get the link.",
    parentLead: "One payment, one account. The student activates it after sign-in. Public board shows a nickname. 18+ or with a guardian.",
    parentCta: "How the link works",
    footnote: "Applicant · faculty student · parent — no admission promise.",
  },
  de: {
    kicker: "Atelier Student LF",
    title: ["Eine Karte.", "Von Fakultätsanforderungen zum täglichen Quiz."],
    lead: "Gebaut aus offiziellen Fakultätsanforderungen, der B/C/F-Bank und den Räumen, die Bewerber und Studierende wirklich öffnen. Keine erfundenen Rezensionen. Keine Zulassungsversprechen.",
    open: "Desk öffnen",
    test: "Zuerst 1 Test",
    gift: "Als Geschenk senden",
    methodKicker: "Wie es entstand",
    methodTitle: "Fakultäten, Pädagogik, Studierende — in dieser Reihenfolge.",
    method: [
      ["01  Fakultäten", "Offizielle Hochschulseiten in Ihrem Land. Termine nur von dort.", ""],
      ["02  Pädagogik", "Dieselben Fächer wie in der Aufnahme: Biologie, Chemie, Physik. B/C/F-Bank.", ""],
      ["03  Studierende", "Der Desk zeigt Räume, die wirklich genutzt werden — Quiz, Simulation, Tutor, Semester.", ""],
    ],
    roomsKicker: "Desk",
    roomsTitle: "Räume, keine Coupons.",
    roomsLead: "Was nach dem freien Test offen ist. MeDiprep-Quiz bleibt tschechisches B/C/F.",
    facultyKicker: "Von den Hochschulseiten gelesen",
    facultyLead: "Gleiches Format wie die tschechischen Fakultäten. Keine erfundenen Auslandsfristen.",
    official: "Offizielle Seite",
    parentKicker: "Eltern",
    parentTitle: "Sie zahlen. Den Link senden.",
    parentLead: "Eine Zahlung, ein Konto. Die Studentin aktiviert ihn nach der Anmeldung. Öffentlich nur ein Spitzname. 18+ oder mit Erziehungsberechtigten.",
    parentCta: "So funktioniert der Link",
    footnote: "Bewerber · Fakultätsstudium · Eltern — kein Zulassungsversprechen.",
  },
  fr: {
    kicker: "Atelier Student LF",
    title: ["Une carte.", "Des exigences facultaires au quiz du jour."],
    lead: "Construit à partir des exigences officielles des facultés, de la banque B/C/F et des salles que les candidats et les étudiants ouvrent vraiment. Pas d’avis inventés. Pas de promesse d’admission.",
    open: "Ouvrir le bureau",
    test: "D’abord 1 test",
    gift: "Offrir le mois",
    methodKicker: "Comment c’est fait",
    methodTitle: "Facultés, pédagogie, étudiants — dans cet ordre.",
    method: [
      ["01  Facultés", "Sites officiels des écoles de votre pays. Dates uniquement de là.", ""],
      ["02  Pédagogie", "Les mêmes matières qu’aux concours : biologie, chimie, physique. Banque B/C/F.", ""],
      ["03  Étudiants", "Le bureau montre les salles vraiment utilisées — quiz, simulations, tuteur, semestre.", ""],
    ],
    roomsKicker: "Bureau",
    roomsTitle: "Des salles, pas des coupons.",
    roomsLead: "Ce que vous ouvrez après le test offert. Les quiz MeDiprep restent en B/C/F tchèque.",
    facultyKicker: "Lu sur les sites des écoles",
    facultyLead: "Même format que les facultés tchèques. Pas de dates étrangères inventées.",
    official: "Site officiel",
    parentKicker: "Parents",
    parentTitle: "Vous payez. Ils reçoivent le lien.",
    parentLead: "Un paiement, un compte. L’étudiant l’active après connexion. Tableau public : surnom. 18+ ou avec tuteur légal.",
    parentCta: "Comment fonctionne le lien",
    footnote: "Candidat · étudiant · parent — pas de promesse d’admission.",
  },
};

function t(pack: Pack, rec: { cs: string; en: string; de: string; fr: string }) {
  return rec[pack];
}

export function StudentOfferDashboard({ locale }: { locale: string }) {
  const pack = packOf(locale);
  const cs = pack === "cs";
  const copy = COPY[pack];
  const intro = studentIntroCharge(locale);
  const monthly = studentMonthlyCharge(locale);
  const faculties = facultiesForLocale(locale);
  const productHref = (path: string, csHref: string) =>
    pack === "cs" ? studentPublicHref(path, locale) : csHref;
  const featured = ROOMS.filter((r) => "featured" in r && r.featured);
  const rest = ROOMS.filter((r) => !("featured" in r && r.featured));
  const preview = generateSelfTest({ count: 1, seed: "atelier-desk" }).questions[0];

  return (
    <div className="overflow-hidden bg-[#f3eee6] text-[#1b1712]">
      <section className="relative isolate overflow-hidden bg-[#14110e] text-[#f6f1e8]">
        <Image
          src={PHOTO.cover}
          alt=""
          fill
          priority
          className="object-cover opacity-[0.18]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#14110e] via-[#14110e]/92 to-[#14110e]/70" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#c6a15b]">
              {copy.kicker}
            </p>
            <h1 className="mt-5 max-w-xl font-display text-[2.6rem] font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              {copy.title[0]}
              <span className="mt-2 block font-normal text-[#e7d3a4]">{copy.title[1]}</span>
            </h1>
            <p className="mt-6 max-w-lg text-[15px] leading-7 text-[#d8d0c4]">{copy.lead}</p>
            <p className="mt-4 font-mono text-[12px] tracking-wide text-[#c6a15b]">
              1 · {intro.formatted} · {monthly.formatted}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <V27CheckoutButton
                kind="subscription"
                productId="student-month"
                locale={locale}
                label={`${copy.open} · ${intro.formatted}`}
                className="rounded-full bg-[#f6f1e8] px-6 text-[#14110e] hover:bg-white"
              />
              <Button
                asChild
                variant="ghost"
                className="rounded-full text-[#f6f1e8] hover:bg-white/10 hover:text-white"
              >
                <Link href={productHref("/app/priprava", "/app/priprava")}>
                  {copy.test}
                  <ArrowUpRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <V27CheckoutButton
                kind="subscription"
                productId="student-month"
                locale={locale}
                gift
                label={copy.gift}
                className="rounded-full border border-white/20 bg-transparent px-5 text-[#f6f1e8] hover:bg-white/10"
              />
            </div>
          </div>
          <StudentStudioDesk
            cs={cs}
            faculties={faculties}
            introLabel={intro.formatted}
            monthlyLabel={monthly.formatted}
            question={preview?.question_text}
            options={preview?.options}
            subject={preview ? subjectLabel(preview.meta.subject) : undefined}
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8a6d32]">
          {copy.methodKicker}
        </p>
        <h2 className="mt-3 max-w-3xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {copy.methodTitle}
        </h2>
        <div className="mt-10 grid gap-10 md:grid-cols-3">
          {copy.method.map(([title, body]) => (
            <div key={title} className="border-t border-[#1b1712]/15 pt-5">
              <p className="font-display text-xl">{title}</p>
              <p className="mt-3 text-sm leading-7 text-[#5c564c]">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-6 sm:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8a6d32]">
          {copy.roomsKicker}
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {copy.roomsTitle}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5c564c]">{copy.roomsLead}</p>
        <div className="mt-6">
          <StudentSectionNav current="/studenti" />
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {featured.map((item) => (
            <Link
              key={item.href}
              href={productHref(item.href, item.csHref)}
              className="group relative min-h-[280px] overflow-hidden rounded-[1.6rem] bg-[#14110e] text-[#f6f1e8]"
            >
              <Image
                src={item.image}
                alt=""
                fill
                className="object-cover opacity-55 transition duration-700 group-hover:scale-[1.03] group-hover:opacity-65"
                sizes="(max-width: 1024px) 100vw, 560px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#14110e] via-[#14110e]/35 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="font-display text-3xl">{t(pack, item.title)}</p>
                <p className="mt-2 max-w-md text-sm leading-6 text-[#ddd4c6]">{t(pack, item.body)}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((item, index) => (
            <Link
              key={item.href}
              href={productHref(item.href, item.csHref)}
              className="group overflow-hidden rounded-[1.3rem] border border-[#1b1712]/10 bg-[#faf7f1]"
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-[#14110e]">
                <Image
                  src={item.image}
                  alt=""
                  fill
                  className="object-cover transition duration-700 group-hover:scale-[1.04]"
                  sizes="(max-width: 640px) 100vw, 320px"
                />
              </div>
              <div className="px-4 py-4">
                <p className="font-mono text-[10px] tracking-[0.2em] text-[#8a6d32]">
                  {String(index + 3).padStart(2, "0")}
                </p>
                <p className="mt-1 font-display text-xl">{t(pack, item.title)}</p>
                <p className="mt-1 text-sm leading-6 text-[#5c564c]">{t(pack, item.body)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8a6d32]">
              {copy.facultyKicker}
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold">{facultyCountryLabel(locale)}</h2>
            <p className="mt-2 max-w-xl text-sm leading-7 text-[#5c564c]">{copy.facultyLead}</p>
          </div>
        </div>
        <ul className="mt-8 divide-y divide-[#1b1712]/10 border-y border-[#1b1712]/10">
          {faculties.map((f) => (
            <li key={f.slug}>
              <a
                href={f.applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-wrap items-baseline justify-between gap-2 py-3.5 text-[#1b1712] no-underline transition hover:text-[#8a6d32]"
              >
                <span className="font-display text-lg">{f.shortName}</span>
                <span className="text-sm text-[#5c564c]">{f.city}</span>
                <span className="ml-auto text-xs uppercase tracking-[0.16em] text-[#8a6d32]">
                  {copy.official}
                  <ArrowUpRight className="ml-1 inline h-3 w-3" />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section
        id="pro-rodice"
        className="mx-auto max-w-7xl scroll-mt-24 px-5 pb-16 sm:px-8"
      >
        <div className="grid gap-10 border-t border-[#1b1712]/15 pt-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8a6d32]">
              {copy.parentKicker}
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold">{copy.parentTitle}</h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-[#5c564c]">{copy.parentLead}</p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <V27CheckoutButton
              kind="subscription"
              productId="student-month"
              locale={locale}
              gift
              label={`${copy.gift} · ${intro.formatted}`}
              className="rounded-full bg-[#14110e] px-6 text-[#f6f1e8] hover:bg-black"
            />
            <Button asChild variant="outline" className="rounded-full border-[#1b1712]/20">
              <Link href={localizePublicHref(STUDENT_GIFT_HREF, locale)}>
                <Gift className="mr-2 h-4 w-4" />
                {copy.parentCta}
              </Link>
            </Button>
          </div>
        </div>
        <p className="mt-10 text-center text-xs tracking-wide text-[#8a8377]">{copy.footnote}</p>
      </section>
    </div>
  );
}
