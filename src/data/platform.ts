import type { ContentCategory } from '../types/content';

export interface AuthorProfile {
  id: string;
  name: string;
  title: string;
  affiliation: string;
  specialties: string[];
  bio: string;
  disclosure: string;
}

export interface EditorialArticle {
  slug: string;
  title: string;
  dek: string;
  category: ContentCategory;
  specialty: string;
  tags: string[];
  authorId: string;
  publishedAt: string;
  updatedAt: string;
  premium: boolean;
  readingMinutes: number;
  evidenceLevel: string;
  summary: string[];
  sections: Array<{ heading: string; body: string }>;
  relatedPaths: string[];
}

export interface PlatformEvent {
  slug: string;
  title: string;
  type: 'Conference' | 'Webinar' | 'Course' | 'Report briefing';
  date: string;
  location: string;
  audience: string;
  summary: string;
  sponsorSafe: boolean;
  ctaLabel: string;
}

export interface JobListing {
  slug: string;
  title: string;
  employer: string;
  location: string;
  specialty: string;
  employmentType: string;
  summary: string;
  requirements: string[];
}

export interface CommercialPage {
  path: string;
  title: string;
  eyebrow: string;
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  pillars: Array<{ title: string; body: string }>;
}

export const authors: AuthorProfile[] = [
  {
    id: 'elena-novak',
    name: 'Elena Novak',
    title: 'MD, PhD',
    affiliation: 'MedScopeGlobal Editorial Board',
    specialties: ['Internal Medicine', 'Evidence Review', 'Clinical Governance'],
    bio: 'Clinical editor focused on translating evidence into practical, auditable knowledge products for physicians and hospital leaders.',
    disclosure: 'Editorial role; no patient-specific advice is provided on MedScopeGlobal.',
  },
  {
    id: 'maya-stein',
    name: 'Maya Stein',
    title: 'MD, MSc',
    affiliation: 'Research Hub',
    specialties: ['Clinical Research', 'Trial Design', 'Medical Education'],
    bio: 'Research editor responsible for transparent metadata, source separation and early-career research workflows.',
    disclosure: 'Editorial role; research summaries are not substitutes for full source appraisal.',
  },
  {
    id: 'jonas-keller',
    name: 'Jonas Keller',
    title: 'MSc Health Economics',
    affiliation: 'Healthcare Economics Desk',
    specialties: ['DRG', 'Market Access', 'Institutional Strategy'],
    bio: 'Health-economics analyst covering reimbursement, institutional licensing needs and evidence-to-value communication.',
    disclosure: 'Commercial analysis is clearly separated from sponsored or partner content.',
  },
];

export const editorialArticles: EditorialArticle[] = [
  {
    slug: 'clinical-ai-governance-checklist',
    title: 'Clinical AI governance checklist for hospital leaders',
    dek: 'A practical framework for evaluating AI tools before clinical workflow deployment.',
    category: 'ai',
    specialty: 'Digital Health',
    tags: ['AI in medicine', 'governance', 'clinical safety'],
    authorId: 'elena-novak',
    publishedAt: '2026-05-20T09:00:00.000Z',
    updatedAt: '2026-05-24T09:00:00.000Z',
    premium: true,
    readingMinutes: 8,
    evidenceLevel: 'Practice framework',
    summary: [
      'Separate clinical validation from vendor performance claims.',
      'Assign accountable clinical ownership before workflow rollout.',
      'Track model drift, safety incidents and exclusion criteria after launch.',
    ],
    sections: [
      {
        heading: 'Why governance matters',
        body: 'Clinical AI can improve triage, documentation and decision support only when validation, accountability and monitoring are explicit. A governance checklist helps teams avoid fragmented procurement decisions and hidden safety debt.',
      },
      {
        heading: 'Minimum pre-deployment questions',
        body: 'Hospitals should document intended use, excluded populations, evidence sources, bias testing, escalation rules and rollback procedures. Procurement teams should require clinical evidence and post-market monitoring commitments.',
      },
      {
        heading: 'Operational controls',
        body: 'A safe deployment plan includes named clinical owners, monitoring dashboards, user training, audit logs, incident review and periodic revalidation when workflow, population or model versions change.',
      },
    ],
    relatedPaths: ['/digital-health/ai', '/institutions', '/premium'],
  },
  {
    slug: 'drg-cost-analysis-executive-brief',
    title: 'DRG cost analysis: what clinical teams need from finance data',
    dek: 'How to translate reimbursement and cost signals into safer service-line decisions.',
    category: 'costs-drg',
    specialty: 'Healthcare Economics',
    tags: ['DRG', 'cost analysis', 'hospital finance'],
    authorId: 'jonas-keller',
    publishedAt: '2026-05-18T10:00:00.000Z',
    updatedAt: '2026-05-22T10:00:00.000Z',
    premium: false,
    readingMinutes: 6,
    evidenceLevel: 'Executive digest',
    summary: [
      'DRG analysis is most useful when paired with clinical complexity and pathway data.',
      'Service-line reviews should distinguish avoidable variation from case-mix reality.',
      'Shared dashboards can reduce conflict between clinical and finance teams.',
    ],
    sections: [
      {
        heading: 'The clinical translation problem',
        body: 'Finance dashboards often describe cost and reimbursement but not the clinical context behind variation. Medical leaders need a bridge between coded activity, pathway design and operational constraints.',
      },
      {
        heading: 'Metrics worth standardizing',
        body: 'Length of stay, readmission signal, consumable variation, staffing intensity and procedure mix should be reviewed together. This avoids simplistic conclusions from single cost indicators.',
      },
      {
        heading: 'Institutional readiness',
        body: 'Hospitals preparing for enterprise knowledge products should define shared terminology, data ownership and review cadence before introducing benchmark dashboards.',
      },
    ],
    relatedPaths: ['/economics/costs-drg', '/institutions', '/reports'],
  },
  {
    slug: 'early-career-research-publication-pathway',
    title: 'A publication pathway for student and early-career research',
    dek: 'Submission readiness, mentorship and editorial triage for emerging medical authors.',
    category: 'student-research',
    specialty: 'Medical Education',
    tags: ['student research', 'publishing', 'mentorship'],
    authorId: 'maya-stein',
    publishedAt: '2026-05-15T08:30:00.000Z',
    updatedAt: '2026-05-21T08:30:00.000Z',
    premium: false,
    readingMinutes: 5,
    evidenceLevel: 'Editorial workflow guide',
    summary: [
      'A strong submission begins with a clear question, transparent methods and appropriate supervision.',
      'Editorial triage should separate mentorship needs from publication readiness.',
      'Early-career programmes can support quality without lowering evidence standards.',
    ],
    sections: [
      {
        heading: 'Submission readiness',
        body: 'Student research should include a concise question, ethics status where relevant, authorship clarity, limitations and an honest description of data sources.',
      },
      {
        heading: 'Mentorship before publication',
        body: 'Not every promising project is publication-ready. A structured pathway can route projects to mentoring, poster development, methods review or editorial submission.',
      },
      {
        heading: 'Future workflow',
        body: 'MedScopeGlobal is prepared for editorial-service and open-access style workflows, but production submission routing requires a configured backend or CRM endpoint.',
      },
    ],
    relatedPaths: ['/research/student-research', '/research/submit', '/publish'],
  },
];

export const platformEvents: PlatformEvent[] = [
  {
    slug: 'ai-governance-webinar',
    title: 'AI governance in clinical workflows',
    type: 'Webinar',
    date: '2026-06-18T16:00:00.000Z',
    location: 'Online',
    audience: 'CMIOs, clinical safety leads and digital health teams',
    summary: 'A practical education session on validation, monitoring and accountability for AI-enabled clinical workflows.',
    sponsorSafe: true,
    ctaLabel: 'Register interest',
  },
  {
    slug: 'hospital-economics-briefing',
    title: 'Hospital economics briefing: DRG, cost and payer trends',
    type: 'Report briefing',
    date: '2026-07-09T14:00:00.000Z',
    location: 'Online',
    audience: 'Hospital executives, service-line leaders and health economists',
    summary: 'An executive briefing format for reimbursement pressure, service-line variation and institutional data products.',
    sponsorSafe: true,
    ctaLabel: 'Request invitation',
  },
  {
    slug: 'early-career-publication-clinic',
    title: 'Early-career publication clinic',
    type: 'Course',
    date: '2026-08-12T15:00:00.000Z',
    location: 'Online cohort',
    audience: 'Students, residents and early-career researchers',
    summary: 'A structured education series on abstracts, reporting standards, peer review expectations and editorial triage.',
    sponsorSafe: false,
    ctaLabel: 'Join waitlist',
  },
];

export const jobListings: JobListing[] = [
  {
    slug: 'clinical-evidence-editor',
    title: 'Clinical Evidence Editor',
    employer: 'MedScopeGlobal Editorial Network',
    location: 'Remote / Europe-friendly hours',
    specialty: 'Evidence Review',
    employmentType: 'Contract',
    summary: 'Review and structure clinical summaries, evidence digests and specialty collections for professional audiences.',
    requirements: ['MD, PharmD or advanced biomedical degree', 'Experience with evidence appraisal', 'Strong medical writing discipline'],
  },
  {
    slug: 'health-economics-analyst',
    title: 'Healthcare Economics Analyst',
    employer: 'MedScopeGlobal Market Intelligence',
    location: 'Remote',
    specialty: 'Healthcare Economics',
    employmentType: 'Part-time advisory',
    summary: 'Support DRG, reimbursement and payer-trend briefs for institutional readers and future benchmark products.',
    requirements: ['Health economics or market access background', 'Comfort with reimbursement terminology', 'Clear disclosure of conflicts'],
  },
  {
    slug: 'medical-education-producer',
    title: 'Medical Education Producer',
    employer: 'MedScopeGlobal Education',
    location: 'Hybrid / Remote',
    specialty: 'Events & Education',
    employmentType: 'Project-based',
    summary: 'Coordinate webinars, educational series and sponsor-safe event pages with clear editorial labeling.',
    requirements: ['Experience with medical education', 'Excellent agenda and speaker coordination', 'Understanding of sponsor separation'],
  },
];

export const commercialPages: CommercialPage[] = [
  {
    path: '/premium',
    title: 'Premium membership',
    eyebrow: 'Freemium knowledge platform',
    description:
      'A future-ready membership layer for clinical summaries, evidence digests, advanced search, saved reading and premium education.',
    primaryCta: { label: 'Start membership inquiry', href: '/subscribe' },
    secondaryCta: { label: 'View evidence digest', href: '/articles/clinical-ai-governance-checklist' },
    pillars: [
      { title: 'Clinical summaries', body: 'Concise, source-linked summaries designed for professional review rather than generic health advice.' },
      { title: 'Evidence digests', body: 'Specialty collections with metadata, update dates, editorial disclosures and related reading.' },
      { title: 'Personalization-ready', body: 'Interfaces are prepared for saved content and reading lists when authentication is introduced.' },
    ],
  },
  {
    path: '/institutions',
    title: 'For institutions',
    eyebrow: 'B2B licensing and enterprise knowledge',
    description:
      'Institutional subscription and licensing pathways for hospitals, clinics, universities, research organizations and partner education teams.',
    primaryCta: { label: 'Request institutional demo', href: '/contact' },
    secondaryCta: { label: 'Explore reports', href: '/reports' },
    pillars: [
      { title: 'Hospital knowledge access', body: 'Support teams with curated clinical, policy, economics and digital health intelligence.' },
      { title: 'Education and events', body: 'Sponsor-safe educational pages, webinars and institutional learning pathways.' },
      { title: 'Data roadmap', body: 'Architecture prepared for benchmark dashboards and analytics products without fake production AI claims.' },
    ],
  },
  {
    path: '/publish',
    title: 'Publish and contribute',
    eyebrow: 'Hybrid publishing readiness',
    description:
      'Submission, editorial-service and open-access style workflows are scaffolded for future backend integration and governance.',
    primaryCta: { label: 'Submit research', href: '/research/submit' },
    secondaryCta: { label: 'Meet editorial team', href: '/editorial' },
    pillars: [
      { title: 'Open/public publication', body: 'Public article and author profile structures support discoverability and citation context.' },
      { title: 'Gated premium formats', body: 'Premium article flags and membership callouts prepare for future access control.' },
      { title: 'Editorial workflow', body: 'Forms capture structured submission metadata and can be routed to CRM or editorial systems.' },
    ],
  },
  {
    path: '/partnerships',
    title: 'Partnerships and sponsored knowledge',
    eyebrow: 'Trust-preserving commercialization',
    description:
      'Commercial education, knowledge products and sponsored reports are supported with explicit labeling and editorial separation.',
    primaryCta: { label: 'Discuss partnership', href: '/contact' },
    secondaryCta: { label: 'View events', href: '/events' },
    pillars: [
      { title: 'Clear labeling', body: 'Sponsored and partner content patterns are visually separate from editorial articles.' },
      { title: 'Education formats', body: 'Webinars, reports, topic collections and whitepaper pages can support selective sponsorship.' },
      { title: 'Editorial integrity', body: 'Medical trust signals, author metadata and disclosures remain first-class content elements.' },
    ],
  },
];

export const specialtyLinks = [
  { label: 'Clinical Practice', href: '/professional/clinical-insights' },
  { label: 'Research', href: '/research/articles' },
  { label: 'Digital Health', href: '/digital-health/ai' },
  { label: 'Healthcare Economics', href: '/economics/costs-drg' },
  { label: 'Pharma & Drugs', href: '/pharma/new-drugs' },
  { label: 'Policy & Law', href: '/policy/legislation' },
];
