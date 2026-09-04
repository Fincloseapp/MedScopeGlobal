import type { Metadata } from "next";
import { ArrowRight, Gift } from "lucide-react";
import { PageHero } from "@/components/public/page-hero";
import { PublicPage } from "@/components/public/public-page";
import { SiteChrome } from "@/components/public/site-chrome";
import { StudentOfferDashboard } from "@/components/studenti/student-offer-dashboard";
import { createMetadata, localizedAlternates } from "@/lib/seo";
import { localizedPath } from "lib/i18n/paths";
import { getRequestLocale } from "lib/i18n/server";
import { withLocale } from "lib/i18n/with-locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const copy = COPY[locale] ?? COPY.en;
  return createMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: "/studenti",
    locale,
    alternates: localizedAlternates("/studenti"),
  });
}

export default async function StudentiPage() {
  const locale = await getRequestLocale();
  const copy = COPY[locale] ?? COPY.en;
  const hrefs = MORE_HREFS.map((href) => withLocale(locale, href));
  const predplatne = withLocale(locale, "/predplatne#student");
  const darkove = withLocale(locale, "/studenti/darkove");

  return (
    <SiteChrome>
      <PublicPage className="space-y-6">
        <StudentOfferDashboard locale={locale} />

        <section className="overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--paper-2)] px-5 py-6 sm:px-8">
          <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--gold)]">
            <Gift className="h-4 w-4" aria-hidden />
            {copy.parentsKicker}
          </div>
          <h2 className="mt-3 max-w-3xl font-serif text-3xl text-[var(--ink)]">{copy.parentsTitle}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">{copy.parentsLead}</p>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">{copy.parentsLegal}</p>
          <a
            href={darkove}
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--gold)] px-5 text-sm font-semibold text-[var(--ink)]"
          >
            {copy.parentsCta}
          </a>
        </section>

        <PageHero kicker={copy.moreKicker} title={copy.moreTitle} lead={copy.moreLead} />
        <div className="grid gap-3 md:grid-cols-2">
          {copy.more.map((item, index) => (
            <a
              key={item.title}
              href={hrefs[index]}
              className="rounded-[1.4rem] border border-[var(--line)] bg-[var(--paper)] px-5 py-5 no-underline transition hover:border-[var(--gold)]"
            >
              <strong className="font-serif text-xl text-[var(--ink)]">{item.title}</strong>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.body}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[var(--gold)]">
                {item.cta} <ArrowRight className="h-4 w-4" />
              </span>
            </a>
          ))}
        </div>
        <p className="text-center text-sm text-[var(--muted)]">
          <a href={predplatne} className="font-semibold text-[var(--gold)] no-underline">
            {copy.cta}
          </a>
        </p>
      </PublicPage>
    </SiteChrome>
  );
}

const MORE_HREFS = [
  localizedPath("cs", "/studenti/klub"),
  "/studenti/testy",
  "/studenti/materialy",
  "/studenti/ai-tutor",
  "/studenti/zkousky",
  localizedPath("cs", "/mediprep"),
  localizedPath("cs", "/academy"),
] as const;

const COPY: Record<
  string,
  {
    metaTitle: string;
    metaDescription: string;
    cta: string;
    moreKicker: string;
    moreTitle: string;
    moreLead: string;
    more: { title: string; body: string; cta: string }[];
    parentsKicker: string;
    parentsTitle: string;
    parentsLead: string;
    parentsLegal: string;
    parentsCta: string;
  }
> = {
  cs: {
    metaTitle: "Studenti medicíny — 1 test zdarma, první měsíc 89 Kč",
    metaDescription:
      "Přijímačky, B/C/F, AI tutor a termíny fakult. Jeden test zdarma, první měsíc 89 Kč, potom 149 Kč. Rodiče můžou předplatné koupit jako dárek.",
    cta: "Otevřít student tarif — 89 Kč první měsíc",
    moreKicker: "Místnosti",
    moreTitle: "Kde začít po prvním testu",
    moreLead: "Stejný tarif otevírá každou místnost. Quiz banka MeDiprep zůstává v češtině.",
    more: [
      { title: "Klub kvízů", body: "Osm otázek B/C/F. Na tabuli jen přezdívka.", cta: "Otevřít klub" },
      { title: "Testy", body: "B / C / F a nácvik pod časem.", cta: "Otevřít testy" },
      { title: "Materiály", body: "Karty, vzorce a odkazy na oficiální weby.", cta: "Otevřít materiály" },
      { title: "AI tutor", body: "Vysvětlení bez vymýšlení faktů.", cta: "Otevřít tutora" },
      { title: "Zkoušky", body: "Termíny jen z oficiálních fakult.", cta: "Otevřít termíny" },
      { title: "MeDiprep", body: "Česká banka otázek a nácvik.", cta: "Otevřít MeDiprep" },
      { title: "Akademie", body: "Delší kurzy a certifikace.", cta: "Otevřít akademii" },
    ],
    parentsKicker: "Rodiče",
    parentsTitle: "Koupit měsíc a poslat odkaz",
    parentsLead:
      "Zaplatíte první měsíc 89 Kč (nebo 149 Kč další). Po platbě dostanete odkaz. Student ho uplatní po přihlášení — na veřejném žebříčku zůstane přezdívka, ne e-mail.",
    parentsLegal:
      "Cena je na stránce před platbou. Předplatné lze zrušit. Žádné skryté poplatky. Určeno pro studenty 18+ nebo se souhlasem zákonného zástupce.",
    parentsCta: "Koupit dárek",
  },
  en: {
    metaTitle: "Medical students — 1 free test, first month 89 CZK",
    metaDescription:
      "Admissions, B/C/F, AI tutor and faculty dates. One free test, first month 89 CZK, then 149 CZK. Parents can buy a gift month.",
    cta: "Open the student plan — first month 89 CZK",
    moreKicker: "Rooms",
    moreTitle: "Where to go after the free test",
    moreLead: "The same plan opens every room. The MeDiprep question bank stays in Czech.",
    more: [
      { title: "Quiz club", body: "Eight B/C/F questions. Nickname on the board only.", cta: "Open the club" },
      { title: "Tests", body: "B / C / F under timed conditions.", cta: "Open tests" },
      { title: "Materials", body: "Cards, formulas, official links.", cta: "Open materials" },
      { title: "AI tutor", body: "Explanations without invented facts.", cta: "Open the tutor" },
      { title: "Exams", body: "Dates from official faculty pages only.", cta: "Open dates" },
      { title: "MeDiprep", body: "Czech question bank and drills.", cta: "Open MeDiprep" },
      { title: "Academy", body: "Longer courses and certificates.", cta: "Open the academy" },
    ],
    parentsKicker: "Parents",
    parentsTitle: "Buy a month and send the link",
    parentsLead:
      "Pay the first month (89 CZK) or the regular month (149 CZK). After checkout you receive a link. The student redeems it after sign-in. The public board shows a nickname, not an email.",
    parentsLegal:
      "The price is shown before payment. Cancel anytime. No hidden charges. For students 18+ or with a guardian.",
    parentsCta: "Buy a gift",
  },
  sk: {
    metaTitle: "Študenti medicíny — 1 test zadarmo, prvý mesiac 89 Kč",
    metaDescription:
      "Prijímačky, B/C/F, AI tutor a termíny fakúlt. Jeden test zadarmo, prvý mesiac 89 Kč, potom 149 Kč. Rodičia môžu kúpiť darček.",
    cta: "Otvoriť študentský tarif — 89 Kč prvý mesiac",
    moreKicker: "Miestnosti",
    moreTitle: "Kde začať po prvom teste",
    moreLead: "Rovnaký tarif otvára každú miestnosť. Quiz banka MeDiprep ostáva v češtine.",
    more: [
      { title: "Klub kvízov", body: "Osem otázok B/C/F. Na tabuli len prezývka.", cta: "Otvoriť klub" },
      { title: "Testy", body: "B / C / F pod časom.", cta: "Otvoriť testy" },
      { title: "Materiály", body: "Karty, vzorce, oficiálne odkazy.", cta: "Otvoriť materiály" },
      { title: "AI tutor", body: "Vysvetlenie bez vymýšľania faktov.", cta: "Otvoriť tutora" },
      { title: "Skúšky", body: "Termíny len z oficiálnych fakúlt.", cta: "Otvoriť termíny" },
      { title: "MeDiprep", body: "Česká banka otázok.", cta: "Otvoriť MeDiprep" },
      { title: "Akadémia", body: "Dlhšie kurzy.", cta: "Otvoriť akadémiu" },
    ],
    parentsKicker: "Rodičia",
    parentsTitle: "Kúpiť mesiac a poslať odkaz",
    parentsLead:
      "Zaplatíte prvý mesiac 89 Kč alebo ďalší 149 Kč. Po platbe dostanete odkaz. Študent ho uplatní po prihlásení. Na verejnej tabuli ostane prezývka, nie e-mail.",
    parentsLegal:
      "Cena je pred platbou. Predplatné možno zrušiť. Žiadne skryté poplatky. Pre študentov 18+ alebo so súhlasom zákonného zástupcu.",
    parentsCta: "Kúpiť darček",
  },
  de: {
    metaTitle: "Medizinstudierende — 1 Test frei, erster Monat 6 €",
    metaDescription:
      "Aufnahme, B/C/F, KI-Tutor und Fakultätstermine. Ein Test frei, erster Monat 6 €, danach 10 €. Eltern können einen Monat schenken.",
    cta: "Studentenplan öffnen — erster Monat 6 €",
    moreKicker: "Räume",
    moreTitle: "Wohin nach dem freien Test",
    moreLead: "Derselbe Plan öffnet jeden Raum. Die MeDiprep-Fragenbank bleibt Tschechisch.",
    more: [
      { title: "Quiz-Club", body: "Acht B/C/F-Fragen. Nur ein Spitzname auf der Tafel.", cta: "Club öffnen" },
      { title: "Tests", body: "B / C / F unter Zeit.", cta: "Tests öffnen" },
      { title: "Material", body: "Karten, Formeln, offizielle Links.", cta: "Material öffnen" },
      { title: "KI-Tutor", body: "Erklärungen ohne erfundene Fakten.", cta: "Tutor öffnen" },
      { title: "Prüfungen", body: "Termine nur von Fakultätsseiten.", cta: "Termine öffnen" },
      { title: "MeDiprep", body: "Tschechische Fragenbank.", cta: "MeDiprep öffnen" },
      { title: "Akademie", body: "Längere Kurse.", cta: "Akademie öffnen" },
    ],
    parentsKicker: "Eltern",
    parentsTitle: "Monat kaufen und Link senden",
    parentsLead:
      "Zahlen Sie den ersten Monat (6 €) oder den Folgemonat (10 €). Nach der Zahlung erhalten Sie einen Link. Die Studentin löst ihn nach der Anmeldung ein. Das Board zeigt einen Spitznamen, keine E-Mail.",
    parentsLegal:
      "Der Preis steht vor der Zahlung. Jederzeit kündbar. Keine versteckten Kosten. Für Studierende 18+ oder mit Erziehungsberechtigten.",
    parentsCta: "Geschenk kaufen",
  },
  fr: {
    metaTitle: "Étudiants en médecine — 1 test offert, premier mois 6 €",
    metaDescription:
      "Concours, B/C/F, tuteur IA et dates facultaires. Un test offert, premier mois 6 €, puis 10 €. Les parents peuvent offrir un mois.",
    cta: "Ouvrir l’offre étudiante — premier mois 6 €",
    moreKicker: "Salles",
    moreTitle: "Où aller après le test offert",
    moreLead: "Le même forfait ouvre chaque salle. La banque MeDiprep reste en tchèque.",
    more: [
      { title: "Club quiz", body: "Huit questions B/C/F. Surnom uniquement sur le tableau.", cta: "Ouvrir le club" },
      { title: "Tests", body: "B / C / F chronométrés.", cta: "Ouvrir les tests" },
      { title: "Supports", body: "Fiches, formules, liens officiels.", cta: "Ouvrir les supports" },
      { title: "Tuteur IA", body: "Explications sans faits inventés.", cta: "Ouvrir le tuteur" },
      { title: "Examens", body: "Dates des sites facultaires uniquement.", cta: "Ouvrir les dates" },
      { title: "MeDiprep", body: "Banque tchèque.", cta: "Ouvrir MeDiprep" },
      { title: "Académie", body: "Cours plus longs.", cta: "Ouvrir l’académie" },
    ],
    parentsKicker: "Parents",
    parentsTitle: "Acheter un mois et envoyer le lien",
    parentsLead:
      "Payez le premier mois (6 €) ou le mois suivant (10 €). Après le paiement vous recevez un lien. L’étudiant l’utilise après connexion. Le tableau public montre un surnom, pas un e-mail.",
    parentsLegal:
      "Le prix est affiché avant le paiement. Résiliable. Aucun frais caché. Pour les 18+ ou avec un tuteur légal.",
    parentsCta: "Offrir un mois",
  },
};
