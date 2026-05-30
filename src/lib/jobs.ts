import type { JobListing, JobType } from "./types";

export const jobListings: JobListing[] = [
  {
    id: "job-001",
    slug: "internista-fakultni-nemocnice-praha",
    title: "Internista / Internistka – lůžkové oddělení",
    employer: "Fakultní nemocnice v Motole",
    employerType: "hospital",
    location: "Praha 5",
    region: "cz",
    specialization: "Interní medicína",
    jobType: "full-time",
    summary: "Posílení interního týmu s důrazem na multidisciplinární spolupráci a klinický výzkum.",
    description:
      "Hledáme zkušeného internistu pro lůžkové oddělení s možností účasti na klinických studiích a odborné edukaci rezidentů. Pracoviště disponuje moderní diagnostikou a silnou vazbou na 1. LF UK.",
    requirements: [
      "Specializace v oboru interní medicína",
      "Minimálně 3 roky praxe na lůžkovém oddělení",
      "Komunikační dovednosti a týmová spolupráce",
      "Angličtina na úrovni B2 výhodou"
    ],
    benefits: ["5 týdnů dovolené", "Příspěvek na vzdělávání", "Flexibilní služby", "Výzkumné příležitosti"],
    salaryHint: "Dle platových tabulek + bonusy",
    applyUrl: "mailto:info@medscopeglobal.com?subject=Poptávka%20-%20Internista%20FN%20Motol",
    applyEmail: "info@medscopeglobal.com",
    postedAt: "2026-05-01",
    featured: true
  },
  {
    id: "job-002",
    slug: "kardiolog-klinicka-praxe-brno",
    title: "Kardiolog – ambulantní a invazivní praxe",
    employer: "Kardiocentrum Brno",
    employerType: "clinic",
    location: "Brno",
    region: "cz",
    specialization: "Kardiologie",
    jobType: "full-time",
    summary: "Rozšíření kardiologického týmu pro invazivní i preventivní programy.",
    description:
      "Nabízíme stabilní pozici v kardiologickém centru s vysokou návštěvností pacientů a možností podílet se na preventivních programech ESC.",
    requirements: ["Atestace z kardiologie", "Zkušenost s katetrizační laboratoří výhodou", "Orientace v klinických guidelines"],
    benefits: ["Moderní vybavení", "Mentoring", "Participace na kongresech"],
    applyUrl: "mailto:info@medscopeglobal.com?subject=Poptávka%20-%20Kardiolog%20Brno",
    postedAt: "2026-05-08"
  },
  {
    id: "job-003",
    slug: "clinical-research-associate-eu",
    title: "Clinical Research Associate (m/ž)",
    employer: "European Clinical Research Network",
    employerType: "research",
    location: "Remote / EU",
    region: "eu",
    specialization: "Klinický výzkum",
    jobType: "contract",
    summary: "Monitorování multicentrických studií napříč EU s důrazem na GCP compliance.",
    description:
      "CRA role pro fázi II–III studií v onkologii a kardiologii. Hybridní režim, cestování 30–40 %.",
    requirements: ["GCP certifikace", "Min. 2 roky CRA praxe", "Angličtina C1"],
    benefits: ["Remote-first", "Mezinárodní projekty", "Career path do PM"],
    applyUrl: "mailto:info@medscopeglobal.com?subject=CRA%20-%20EU",
    postedAt: "2026-05-12"
  },
  {
    id: "job-004",
    slug: "medical-science-liaison-oncology",
    title: "Medical Science Liaison – Oncology",
    employer: "Global Pharma Partner (anonymizováno)",
    employerType: "pharma",
    location: "Praha / hybrid",
    region: "cz",
    specialization: "Onkologie",
    jobType: "full-time",
    summary: "Vědecká podpora odborné komunity v onkologii s etickým engagement modelem.",
    description:
      "MSL pozice zaměřená na vzdělávání, evidence review a partnerství s KOL. Bez prodejních cílů.",
    requirements: ["PharmDr./MUDr./PhD", "Praxe v onkologii nebo MSL min. 2 roky", "Prezentace a publikace"],
    benefits: ["Hybrid", "Odborné konference", "Výzkumné granty"],
    applyUrl: "mailto:ads@medscopeglobal.com?subject=MSL%20Oncology",
    postedAt: "2026-05-18",
    featured: true
  },
  {
    id: "job-005",
    slug: "lektor-vseobecne-lekarstvi-lf-uk",
    title: "Odborný asistent – všeobecné lékařství",
    employer: "1. lékařská fakulta UK",
    employerType: "university",
    location: "Praha",
    region: "cz",
    specialization: "Všeobecné lékařství",
    jobType: "part-time",
    summary: "Výuka a klinická praxe v oboru všeobecného lékařství.",
    description: "Kombinace pregraduální výuky a ambulantní praxe v partnerské síti.",
    requirements: ["Atestace VLP", "Pedagogické zkušenosti výhodou"],
    benefits: ["Akademické prostředí", "Publikace", "Stabilní úvazek"],
    applyUrl: "mailto:info@medscopeglobal.com?subject=VLP%20LF%20UK",
    postedAt: "2026-05-22"
  }
];

export interface JobFilters {
  query?: string;
  specialization?: string;
  region?: string;
  jobType?: JobType | "";
}

function normalized(value: string) {
  return value.trim().toLocaleLowerCase("cs-CZ");
}

export function filterJobs(filters: JobFilters): JobListing[] {
  const query = normalized(filters.query ?? "");
  return jobListings
    .filter((job) => {
      const matchesQuery =
        !query ||
        [job.title, job.summary, job.employer, job.location, job.specialization].some((v) => normalized(v).includes(query));
      return (
        matchesQuery &&
        (!filters.specialization || job.specialization === filters.specialization) &&
        (!filters.region || job.region === filters.region) &&
        (!filters.jobType || job.jobType === filters.jobType)
      );
    })
    .sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
}

export function getJobBySlug(slug: string): JobListing | undefined {
  return jobListings.find((job) => job.slug === slug);
}

export function jobSpecializations(): string[] {
  return [...new Set(jobListings.map((job) => job.specialization))].sort();
}
