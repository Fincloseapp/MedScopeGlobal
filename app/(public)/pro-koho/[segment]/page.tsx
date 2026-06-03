import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LOCALE_COOKIE, normalizeLocale } from "@/lib/i18n/config";
import { cookies } from "next/headers";

const SEGMENTS = {
  "laik-student": {
    cs: {
      title: "Laik a student",
      lead: "Srozumitelné výklady, prevence a příprava na studium medicíny.",
      links: [
        { href: "/articles", label: "Všechny články" },
        { href: "/medicina/priprava", label: "Příprava na medicínu" },
        { href: "/medicina/studium", label: "Studium medicíny" },
        { href: "/access-levels", label: "Úrovně přístupu" },
      ],
      disclaimer:
        "Obsah pro laiky a studenty je vzdělávací. Neposkytuje individuální lékařskou radu ani závazná doporučení k léčbě.",
    },
    en: {
      title: "Public & students",
      lead: "Accessible explanations, prevention, and pre-med preparation.",
      links: [
        { href: "/articles", label: "All articles" },
        { href: "/medicina/priprava", label: "Pre-med prep" },
        { href: "/medicina/studium", label: "Medical school" },
        { href: "/access-levels", label: "Access levels" },
      ],
      disclaimer: "Educational content only — not individual medical advice.",
    },
  },
  lekar: {
    cs: {
      title: "Lékař v praxi",
      lead: "Klinické postupy, guidelines, kazuistiky a rozhodovací podpora pro každodenní praxi.",
      links: [
        { href: "/articles", label: "Články" },
        { href: "/professional/clinical-insights", label: "Klinické postřehy" },
        { href: "/professional/case-reports", label: "Kazuistiky" },
        { href: "/professional/guidelines", label: "Guidelines" },
        { href: "/signup", label: "Registrace s ověřením" },
      ],
      disclaimer:
        "Odborný obsah doplňuje, ale nenahrazuje klinické guidelines vaší instituce ani individuální úsudek lékaře.",
    },
    en: {
      title: "Clinicians",
      lead: "Practice-ready clinical intelligence and case-led learning.",
      links: [
        { href: "/articles", label: "Articles" },
        { href: "/professional/clinical-insights", label: "Clinical insights" },
        { href: "/professional/case-reports", label: "Case reports" },
        { href: "/signup", label: "Register" },
      ],
      disclaimer: "Clinical content supports but does not replace institutional protocols.",
    },
  },
  vedec: {
    cs: {
      title: "Vědec a výzkumník",
      lead: "Monitoring publikací, evidence digesty a výzkumné briefy s citacemi a metadaty.",
      links: [
        { href: "/research/articles", label: "Výzkumné články" },
        { href: "/research/clinical-studies", label: "Klinické studie" },
        { href: "/submit-research", label: "Odeslat výzkum" },
        { href: "/articles", label: "Přehled článků" },
      ],
      disclaimer:
        "Shrnutí studií nejsou náhradou za plné texty publikací ani peer review. Vždy ověřte primární zdroj.",
    },
    en: {
      title: "Researchers",
      lead: "Publication monitoring, evidence digests, and study briefs.",
      links: [
        { href: "/research/articles", label: "Research articles" },
        { href: "/research/clinical-studies", label: "Clinical studies" },
        { href: "/submit-research", label: "Submit research" },
      ],
      disclaimer: "Summaries are not a substitute for full publications.",
    },
  },
} as const;

type SegmentKey = keyof typeof SEGMENTS;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ segment: string }>;
}): Promise<Metadata> {
  const { segment } = await params;
  const key = segment as SegmentKey;
  if (!SEGMENTS[key]) return { title: "Pro koho" };
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get(LOCALE_COOKIE)?.value);
  const copy = locale === "cs" ? SEGMENTS[key].cs : SEGMENTS[key].en;
  return { title: copy.title, description: copy.lead };
}

export default async function ProKohoSegmentPage({
  params,
}: {
  params: Promise<{ segment: string }>;
}) {
  const { segment } = await params;
  const key = segment as SegmentKey;
  if (!SEGMENTS[key]) notFound();

  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get(LOCALE_COOKIE)?.value);
  const copy = locale === "cs" ? SEGMENTS[key].cs : SEGMENTS[key].en;
  const isCs = locale === "cs";

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <nav className="text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          {isCs ? "Domů" : "Home"}
        </Link>
        <span className="mx-2">/</span>
        <Link href="/pro-koho" className="hover:text-foreground">
          {isCs ? "Pro koho" : "Audiences"}
        </Link>
        <span className="mx-2">/</span>
        <span>{copy.title}</span>
      </nav>
      <h1 className="mt-4 font-display text-4xl font-bold text-[#005B96]">{copy.title}</h1>
      <p className="mt-4 text-lg text-muted-foreground">{copy.lead}</p>
      <ul className="mt-8 space-y-3">
        {copy.links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="flex items-center justify-between rounded-2xl border bg-white px-4 py-3 text-sm font-medium text-[#005B96] hover:bg-[#f0f7ff]"
            >
              {link.label}
              <span aria-hidden>→</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        {copy.disclaimer}
      </p>
    </div>
  );
}
