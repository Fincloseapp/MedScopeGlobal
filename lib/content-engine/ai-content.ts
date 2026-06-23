import { fetchPubMedItems } from "@/lib/ingestion/pubmed";
import { fetchRssItems, type RawFeedItem } from "@/lib/ingestion/rss";
import { EVENT_RSS_SOURCES, GLOBAL_RSS_SOURCES, PUBMED_BY_CATEGORY } from "@/lib/ingestion/sources";

export interface EngineItem {
  title: string;
  summary: string;
  href: string;
  source: string;
  badge: string;
  tags: string[];
  readTime: string;
  publishedAt?: string;
}

export interface SectionPageData {
  key?: string;
  title: string;
  eyebrow: string;
  description: string;
  metrics: { label: string; value: string }[];
  items: EngineItem[];
  cta: { label: string; href: string; tone: "primary" | "secondary" };
}

const sectionMeta: Record<string, Omit<SectionPageData, "items" | "metrics"> & { fallback: EngineItem[]; metrics: {label:string; value:string}[] }> = {
  "professional/clinical-insights": {
    eyebrow: "Professional",
    title: "Clinical insights",
    description:
      "Evidence-led clinical briefings, practice-focused updates, and specialist review coverage curated for busy clinicians.",
    fallback: [
      {
        title: "Clinical practice digest",
        summary: "A focused roundup of evidence, emerging therapies, and decision-ready summaries across cardiology, critical care, and primary care.",
        href: "/professional/clinical-insights",
        source: "Editorial desk",
        badge: "Clinical intelligence",
        tags: ["clinical", "evidence", "practice"],
        readTime: "4 min read",
      },
      {
        title: "Case-led interpretation",
        summary: "Structured clinical commentary with practical takeaways for complex presentations, referral pathways, and treatment sequencing.",
        href: "/professional/case-reports",
        source: "Editorial desk",
        badge: "Case review",
        tags: ["case report", "diagnostics", "workflow"],
        readTime: "5 min read",
      },
    ],
    cta: { label: "Explore professional coverage", href: "/professional/clinical-insights", tone: "primary" },
    metrics: [
      { label: "Curated briefs", value: "24/7" },
      { label: "Specialties", value: "18" },
      { label: "Medical sources", value: "12" },
    ],
  },
  "professional/case-reports": {
    eyebrow: "Professional",
    title: "Case reports",
    description:
      "Clinical cases, diagnostic framing, and real-world decision pathways translated into concise expert summaries.",
    fallback: [
      {
        title: "Case report briefings",
        summary: "Focused practice-based scenarios with summary of key symptoms, differential diagnosis, and management steps.",
        href: "/professional/case-reports",
        source: "Editorial desk",
        badge: "Case review",
        tags: ["case report", "diagnostics", "management"],
        readTime: "5 min read",
      },
    ],
    cta: { label: "See clinical case coverage", href: "/professional/case-reports", tone: "primary" },
    metrics: [
      { label: "Clinical pathways", value: "120+" },
      { label: "Editorial review", value: "Daily" },
      { label: "Practice ready", value: "Yes" },
    ],
  },
  "professional/guidelines": {
    eyebrow: "Professional",
    title: "Guidelines",
    description:
      "Guideline updates, policy-driven interpretation, and practical translation across care settings.",
    fallback: [
      {
        title: "Guideline translation",
        summary: "Trusted interpretation of new recommendations, practice shifts, and implications for multidisciplinary care.",
        href: "/professional/guidelines",
        source: "Editorial desk",
        badge: "Guideline review",
        tags: ["guideline", "policy", "practice"],
        readTime: "6 min read",
      },
    ],
    cta: { label: "Open guideline summaries", href: "/professional/guidelines", tone: "primary" },
    metrics: [
      { label: "Sources tracked", value: "WHO+EMA" },
      { label: "Summaries", value: "Daily" },
      { label: "Translation", value: "Practice-ready" },
    ],
  },
  "research/articles": {
    eyebrow: "Research",
    title: "Research articles",
    description:
      "Peer-reviewed and curated research streams with evidence summaries, specialty signals, and publication-ready framing.",
    fallback: [
      {
        title: "Research synthesis",
        summary: "High-value summaries of emerging clinical and translational studies across major medical specialties.",
        href: "/research/articles",
        source: "PubMed synthesis",
        badge: "Research digest",
        tags: ["research", "evidence", "specialty"],
        readTime: "6 min read",
      },
    ],
    cta: { label: "Browse research stream", href: "/research/articles", tone: "primary" },
    metrics: [
      { label: "New studies", value: "Live" },
      { label: "Specialties", value: "10+" },
      { label: "Review-ready", value: "Yes" },
    ],
  },
  "research/clinical-studies": {
    eyebrow: "Research",
    title: "Clinical studies",
    description:
      "Clinical trial updates, study interpretation, and translational intelligence for research and practice teams.",
    fallback: [
      {
        title: "Clinical trial monitor",
        summary: "Active and emerging trial signals, changes in trial design, and practical interpretation of outcomes.",
        href: "/research/clinical-studies",
        source: "PubMed synthesis",
        badge: "Trial intelligence",
        tags: ["trial", "outcomes", "clinical"],
        readTime: "5 min read",
      },
    ],
    cta: { label: "View clinical studies", href: "/research/clinical-studies", tone: "primary" },
    metrics: [
      { label: "Trial signals", value: "Live" },
      { label: "Evidence layers", value: "2" },
      { label: "Coverage", value: "Global" },
    ],
  },
  "research/preprints": {
    eyebrow: "Research",
    title: "Preprints",
    description:
      "Premature but high-signal research updates that help teams stay ahead of publication cycles.",
    fallback: [
      {
        title: "Preprint insight stream",
        summary: "Fast-moving research observations with framing around novelty, impact, and translational relevance.",
        href: "/research/preprints",
        source: "Editorial desk",
        badge: "Preprint watch",
        tags: ["preprint", "novelty", "translational"],
        readTime: "5 min read",
      },
    ],
    cta: { label: "Open preprint watch", href: "/research/preprints", tone: "primary" },
    metrics: [
      { label: "Signals", value: "Realtime" },
      { label: "Fast read", value: "3 min" },
      { label: "Focus", value: "Ahead of print" },
    ],
  },
  "research/student-research": {
    eyebrow: "Research",
    title: "Student research",
    description:
      "Training-ready research summaries, educational study highlights, and student publishing support.",
    fallback: [
      {
        title: "Student research pathway",
        summary: "Structured educational summaries that help trainees connect the evidence with learning objectives and submissions.",
        href: "/research/student-research",
        source: "Editorial desk",
        badge: "Student track",
        tags: ["student", "education", "research"],
        readTime: "4 min read",
      },
    ],
    cta: { label: "Open student research", href: "/research/student-research", tone: "primary" },
    metrics: [
      { label: "Learning tracks", value: "Active" },
      { label: "Mentoring", value: "Available" },
      { label: "Publishing", value: "Supported" },
    ],
  },
  "economics/costs-drg": {
    eyebrow: "Economics",
    title: "Costs & DRG",
    description:
      "Economic modeling, DRG implications, and reimbursement intelligence for clinical and operational leaders.",
    fallback: [
      {
        title: "Reimbursement and DRG watch",
        summary: "Coverage, coding, and incentive shifts translated into decision-ready health economics signals.",
        href: "/economics/costs-drg",
        source: "Editorial desk",
        badge: "Economic intelligence",
        tags: ["reimbursement", "DRG", "costs"],
        readTime: "5 min read",
      },
    ],
    cta: { label: "Read economics briefs", href: "/economics/costs-drg", tone: "primary" },
    metrics: [
      { label: "Coverage", value: "Market-level" },
      { label: "Reimbursement", value: "Tracked" },
      { label: "Signal speed", value: "Daily" },
    ],
  },
  "economics/insurance": {
    eyebrow: "Economics",
    title: "Insurance & reimbursement",
    description:
      "Payer-facing policy, reimbursement changes, and market movement across healthcare systems.",
    fallback: [
      {
        title: "Insurance positioning brief",
        summary: "Coverage shifts, payer sentiment, and cost pathways framed for healthcare executives and commercial teams.",
        href: "/economics/insurance",
        source: "Editorial desk",
        badge: "Market analysis",
        tags: ["insurance", "payer", "reimbursement"],
        readTime: "5 min read",
      },
    ],
    cta: { label: "Check market updates", href: "/economics/insurance", tone: "primary" },
    metrics: [
      { label: "Payer signals", value: "Live" },
      { label: "Coverage shift", value: "Tracked" },
      { label: "Decision use", value: "Executive" },
    ],
  },
  "economics/market-analysis": {
    eyebrow: "Economics",
    title: "Market analysis",
    description:
      "Competitive and sector intelligence covering product market movement, care economics, and commercialization signals.",
    fallback: [
      {
        title: "Healthcare market pulse",
        summary: "A macro view of market shifts, digital adoption, and strategic positioning across therapy areas.",
        href: "/economics/market-analysis",
        source: "Editorial desk",
        badge: "Market intel",
        tags: ["market", "strategy", "commercial"],
        readTime: "5 min read",
      },
    ],
    cta: { label: "Open market outlook", href: "/economics/market-analysis", tone: "primary" },
    metrics: [
      { label: "Sector view", value: "Global" },
      { label: "Signals", value: "Weekly" },
      { label: "Strategy", value: "Ready" },
    ],
  },
  "digital-health/ehealth": {
    eyebrow: "Digital health",
    title: "eHealth",
    description:
      "Digital care pathways, interoperability and service design signals for health systems and care teams.",
    fallback: [
      {
        title: "eHealth transformation note",
        summary: "System design, implementation lessons, and patient-facing digital pathway insights for care leaders.",
        href: "/digital-health/ehealth",
        source: "Editorial desk",
        badge: "Digital care",
        tags: ["ehealth", "digital", "systems"],
        readTime: "5 min read",
      },
    ],
    cta: { label: "Read eHealth coverage", href: "/digital-health/ehealth", tone: "primary" },
    metrics: [
      { label: "Digital pathways", value: "Live" },
      { label: "Systems", value: "Tracked" },
      { label: "Care models", value: "Reviewed" },
    ],
  },
  "digital-health/ai": {
    eyebrow: "Digital health",
    title: "AI in medicine",
    description:
      "Clinical AI, workflow automation, and decision intelligence shaped around real care deployment.",
    fallback: [
      {
        title: "AI in medicine overview",
        summary: "How AI is shaping diagnosis, triage, documentation, and workflow design in contemporary care.",
        href: "/digital-health/ai",
        source: "Editorial desk",
        badge: "AI intelligence",
        tags: ["AI", "workflow", "decision support"],
        readTime: "5 min read",
      },
    ],
    cta: { label: "View AI outlook", href: "/digital-health/ai", tone: "primary" },
    metrics: [
      { label: "AI use cases", value: "Growing" },
      { label: "Workflow coverage", value: "Clinical" },
      { label: "Deployment", value: "Tracked" },
    ],
  },
  "digital-health/systems": {
    eyebrow: "Digital health",
    title: "Systems & data",
    description:
      "Data architecture, governance, and analytics insight for digitally enabled healthcare organizations.",
    fallback: [
      {
        title: "Data systems briefing",
        summary: "Operational data strategy, interoperability, and analytics framing for healthcare leaders and innovation teams.",
        href: "/digital-health/systems",
        source: "Editorial desk",
        badge: "Data strategy",
        tags: ["data", "analytics", "interoperability"],
        readTime: "5 min read",
      },
    ],
    cta: { label: "Open systems coverage", href: "/digital-health/systems", tone: "primary" },
    metrics: [
      { label: "Integration", value: "Managed" },
      { label: "Governance", value: "Tracked" },
      { label: "Analytics", value: "Operational" },
    ],
  },
  "digital-health/ai-in-medicine": {
    eyebrow: "Digital health",
    title: "AI in medicine",
    description:
      "Clinical AI, workflow automation, and decision intelligence shaped around real care deployment.",
    fallback: [
      {
        title: "AI in medicine overview",
        summary: "How AI is shaping diagnosis, triage, documentation, and workflow design in contemporary care.",
        href: "/digital-health/ai-in-medicine",
        source: "Editorial desk",
        badge: "AI intelligence",
        tags: ["AI", "workflow", "decision support"],
        readTime: "5 min read",
      },
    ],
    cta: { label: "View AI outlook", href: "/digital-health/ai-in-medicine", tone: "primary" },
    metrics: [
      { label: "AI use cases", value: "Growing" },
      { label: "Workflow coverage", value: "Clinical" },
      { label: "Deployment", value: "Tracked" },
    ],
  },
  "digital-health/systems-and-data": {
    eyebrow: "Digital health",
    title: "Systems & data",
    description:
      "Data architecture, governance, and analytics insight for digitally enabled healthcare organizations.",
    fallback: [
      {
        title: "Data systems briefing",
        summary: "Operational data strategy, interoperability, and analytics framing for healthcare leaders and innovation teams.",
        href: "/digital-health/systems-and-data",
        source: "Editorial desk",
        badge: "Data strategy",
        tags: ["data", "analytics", "interoperability"],
        readTime: "5 min read",
      },
    ],
    cta: { label: "Open systems coverage", href: "/digital-health/systems-and-data", tone: "primary" },
    metrics: [
      { label: "Integration", value: "Managed" },
      { label: "Governance", value: "Tracked" },
      { label: "Analytics", value: "Operational" },
    ],
  },
  "policy/legislation": {
    eyebrow: "Policy",
    title: "Legislation",
    description:
      "Healthcare regulation, legal change, and policy interpretation across Czech and EU environments.",
    fallback: [
      {
        title: "Legislation briefing",
        summary: "Coverage of regulatory change, implementation risk, and legal implications for healthcare operations.",
        href: "/policy/legislation",
        source: "Editorial desk",
        badge: "Policy watch",
        tags: ["legislation", "regulation", "compliance"],
        readTime: "5 min read",
      },
    ],
    cta: { label: "Review policy updates", href: "/policy/legislation", tone: "primary" },
    metrics: [
      { label: "Regions", value: "CZ/EU" },
      { label: "Regulatory shifts", value: "Tracked" },
      { label: "Legal impact", value: "Scored" },
    ],
  },
  "policy/compliance": {
    eyebrow: "Policy",
    title: "Compliance",
    description:
      "Compliance workflows, audit readiness, and operational controls across regulated healthcare environments.",
    fallback: [
      {
        title: "Compliance and audit brief",
        summary: "Operational guidance for compliance teams, data controls, and legal alignment in changing environments.",
        href: "/policy/compliance",
        source: "Editorial desk",
        badge: "Compliance",
        tags: ["compliance", "audit", "governance"],
        readTime: "5 min read",
      },
    ],
    cta: { label: "Explore compliance coverage", href: "/policy/compliance", tone: "primary" },
    metrics: [
      { label: "Operational controls", value: "Tracked" },
      { label: "Audit readiness", value: "Built-in" },
      { label: "Risk framing", value: "Clear" },
    ],
  },
  "policy/healthcare-law": {
    eyebrow: "Policy",
    title: "Healthcare law",
    description:
      "Healthcare law, legal interpretation, and medical liability framing in an operational setting.",
    fallback: [
      {
        title: "Healthcare legal brief",
        summary: "A practical overview of law, liability and compliance signals that matter to medical leadership.",
        href: "/policy/healthcare-law",
        source: "Editorial desk",
        badge: "Healthcare law",
        tags: ["law", "liability", "medical"],
        readTime: "5 min read",
      },
    ],
    cta: { label: "Open legal coverage", href: "/policy/healthcare-law", tone: "primary" },
    metrics: [
      { label: "Legal signals", value: "Live" },
      { label: "Impact", value: "Operational" },
      { label: "Coverage", value: "Cross-border" },
    ],
  },
  "pharma/new-drugs": {
    eyebrow: "Pharma",
    title: "New drugs",
    description:
      "Therapy launches, repositioning, and clinical differentiation across the contemporary pharma landscape.",
    fallback: [
      {
        title: "Therapy launch brief",
        summary: "A practical review of new therapy positioning, evidence framing, and market-facing clinical relevance.",
        href: "/pharma/new-drugs",
        source: "Editorial desk",
        badge: "Pharma watch",
        tags: ["therapy", "launch", "clinical"],
        readTime: "5 min read",
      },
    ],
    cta: { label: "Open pharma tracking", href: "/pharma/new-drugs", tone: "primary" },
    metrics: [
      { label: "Therapy updates", value: "Daily" },
      { label: "Clinical framing", value: "Included" },
      { label: "Market angle", value: "Tracked" },
    ],
  },
  "pharma/drug-reviews": {
    eyebrow: "Pharma",
    title: "Drug reviews",
    description:
      "Comparative therapy reviews, safety framing, and specialist placement guidance for drug teams.",
    fallback: [
      {
        title: "Drug comparison review",
        summary: "Clinical comparison notes for therapy selection, adverse event framing, and practical stewardship.",
        href: "/pharma/drug-reviews",
        source: "Editorial desk",
        badge: "Therapy review",
        tags: ["drug review", "safety", "comparison"],
        readTime: "5 min read",
      },
    ],
    cta: { label: "Read drug reviews", href: "/pharma/drug-reviews", tone: "primary" },
    metrics: [
      { label: "Comparisons", value: "Curated" },
      { label: "Safety", value: "Highlighted" },
      { label: "Deployment", value: "Clinical" },
    ],
  },
  "pharma/clinical-trials": {
    eyebrow: "Pharma",
    title: "Clinical trials",
    description:
      "Trial-stage signals, route-to-market insights, and translational updates across therapeutic areas.",
    fallback: [
      {
        title: "Trial milestone note",
        summary: "Trial progression, interim signals, and practical implications for commercial and clinical strategy.",
        href: "/pharma/clinical-trials",
        source: "Editorial desk",
        badge: "Clinical trial intelligence",
        tags: ["trial", "development", "therapeutics"],
        readTime: "5 min read",
      },
    ],
    cta: { label: "Open trial intelligence", href: "/pharma/clinical-trials", tone: "primary" },
    metrics: [
      { label: "Trial timeline", value: "Live" },
      { label: "Therapy area", value: "Multi" },
      { label: "Signal speed", value: "Fast" },
    ],
  },
  "news/daily": {
    eyebrow: "News",
    title: "Daily news",
    description:
      "Daily authoritative headlines, medical intelligence updates, and source-backed recall of global healthcare movements.",
    fallback: [
      {
        title: "Daily medical news roundup",
        summary: "The latest healthcare headlines, policy updates, and global health signals in one editorial digest.",
        href: "/news/daily",
        source: "Editorial desk",
        badge: "Daily digest",
        tags: ["news", "healthcare", "updates"],
        readTime: "4 min read",
      },
    ],
    cta: { label: "Read daily news", href: "/news/daily", tone: "primary" },
    metrics: [
      { label: "Headlines", value: "Live" },
      { label: "Sources", value: "Global" },
      { label: "Refresh", value: "Daily" },
    ],
  },
  "news/key-updates": {
    eyebrow: "News",
    title: "Key updates",
    description:
      "Essential changes in regulatory, clinical, and operational environments summarized into quick update blocks.",
    fallback: [
      {
        title: "Key update bulletin",
        summary: "High-impact updates and changing healthcare signals condensed for rapid editorial review.",
        href: "/news/key-updates",
        source: "Editorial desk",
        badge: "Headline watch",
        tags: ["headline", "signal", "update"],
        readTime: "4 min read",
      },
    ],
    cta: { label: "Open key updates", href: "/news/key-updates", tone: "primary" },
    metrics: [
      { label: "Signals", value: "Realtime" },
      { label: "Coverage", value: "Cross-sector" },
      { label: "Focus", value: "Executive" },
    ],
  },
  "events/conferences": {
    eyebrow: "Events",
    title: "Conferences",
    description:
      "Conference calendars, expert panels, and event reporting across clinical, digital, and commercial healthcare.",
    fallback: [
      {
        title: "Conferences and congress watch",
        summary: "Event intelligence across scientific meetings, policy summits, and operational leadership forums.",
        href: "/events/conferences",
        source: "Editorial desk",
        badge: "Congress watch",
        tags: ["conference", "event", "calendar"],
        readTime: "4 min read",
      },
    ],
    cta: { label: "See event agenda", href: "/events/conferences", tone: "primary" },
    metrics: [
      { label: "Events", value: "Monthly" },
      { label: "Coverage", value: "Global" },
      { label: "Reports", value: "Available" },
    ],
  },
  "events/webinars": {
    eyebrow: "Events",
    title: "Webinars",
    description:
      "Webinar highlights, live learning opportunities, and event recaps for healthcare professionals.",
    fallback: [
      {
        title: "Webinar briefing",
        summary: "Thought leadership sessions, digital learning formats, and event takeaways for busy clinical teams.",
        href: "/events/webinars",
        source: "Editorial desk",
        badge: "Live learning",
        tags: ["webinar", "learning", "digital"],
        readTime: "4 min read",
      },
    ],
    cta: { label: "Open webinars", href: "/events/webinars", tone: "primary" },
    metrics: [
      { label: "Live sessions", value: "Weekly" },
      { label: "Learning", value: "Hands-on" },
      { label: "Reports", value: "After event" },
    ],
  },
  "events/reports": {
    eyebrow: "Events",
    title: "Reports",
    description:
      "Conference recaps, tracker reports, and event-led syntheses across major healthcare gatherings.",
    fallback: [
      {
        title: "Event report digest",
        summary: "Concise summaries of major healthcare events, expert takeaways, and future-facing implications.",
        href: "/events/reports",
        source: "Editorial desk",
        badge: "Report library",
        tags: ["report", "conference", "summary"],
        readTime: "4 min read",
      },
    ],
    cta: { label: "Read event reports", href: "/events/reports", tone: "primary" },
    metrics: [
      { label: "Summaries", value: "Monthly" },
      { label: "Keynotes", value: "Highlighted" },
      { label: "Coverage", value: "Global" },
    ],
  },
  careers: {
    eyebrow: "Careers",
    title: "Careers",
    description:
      "Clinical, operations and research roles across healthcare, academia and innovation-focused organizations.",
    fallback: [
      {
        title: "Clinical and research career paths",
        summary: "Curated professional opportunities for clinicians, operators, and research teams building long-term healthcare impact.",
        href: "/careers",
        source: "Editorial desk",
        badge: "Talent watch",
        tags: ["career", "clinical", "research"],
        readTime: "4 min read",
      },
    ],
    cta: { label: "See openings", href: "/careers", tone: "primary" },
    metrics: [
      { label: "Roles", value: "Active" },
      { label: "Fields", value: "Multi" },
      { label: "Growth", value: "Tracked" },
    ],
  },
  subscribe: {
    eyebrow: "Subscription",
    title: "Subscribe",
    description:
      "Unlock deeper editorial access, higher-value briefings, and specialist publication pathways with premium membership.",
    fallback: [
      {
        title: "Premium healthcare intelligence",
        summary: "Gain access to advanced analysis, higher-depth coverage, and specialist editorial pathways built for decision-makers.",
        href: "/subscribe",
        source: "Editorial desk",
        badge: "Membership",
        tags: ["subscription", "premium", "insights"],
        readTime: "4 min read",
      },
    ],
    cta: { label: "Join the community", href: "/signup", tone: "primary" },
    metrics: [
      { label: "Access tiers", value: "3" },
      { label: "Editorial depth", value: "Premium" },
      { label: "Support", value: "24/7" },
    ],
  },
  "submit-research": {
    eyebrow: "Publishing",
    title: "Submit research",
    description:
      "Share studies, educational work, and specialist content for editorial review, research positioning, and audience reach.",
    fallback: [
      {
        title: "Research publishing workflow",
        summary: "A streamlined pathway for research teams, authors and academic collaborators to submit, review, and publish through MedScopeGlobal.",
        href: "/submit-research",
        source: "Editorial desk",
        badge: "Submission support",
        tags: ["submit", "research", "publishing"],
        readTime: "4 min read",
      },
    ],
    cta: { label: "Start your submission", href: "/submit-research", tone: "primary" },
    metrics: [
      { label: "Editorial review", value: "Fast-track" },
      { label: "Audience", value: "Global" },
      { label: "Support", value: "Included" },
    ],
  },
};

const homepageSections = [
  "professional",
  "research",
  "economics",
  "digital-health",
  "policy",
  "pharma",
  "news",
  "events",
] as const;

const globalFallbacks: Record<string, EngineItem[]> = {
  economics: sectionMeta["economics/costs-drg"]?.fallback ?? [],
  "digital-health": sectionMeta["digital-health/ehealth"]?.fallback ?? [],
  policy: sectionMeta["policy/legislation"]?.fallback ?? [],
  pharma: sectionMeta["pharma/new-drugs"]?.fallback ?? [],
  events: sectionMeta["events/conferences"]?.fallback ?? [],
  careers: sectionMeta.careers?.fallback ?? [],
  subscribe: sectionMeta.subscribe?.fallback ?? [],
  "submit-research": sectionMeta["submit-research"]?.fallback ?? [],
};

export async function loadHomepageContent() {
  const [professional, research, news, economics, digitalHealth, policy, pharma, events] = await Promise.all([
    loadSectionItems("professional"),
    loadSectionItems("research"),
    loadSectionItems("news"),
    loadSectionItems("economics"),
    loadSectionItems("digital-health"),
    loadSectionItems("policy"),
    loadSectionItems("pharma"),
    loadSectionItems("events"),
  ]);

  return {
    professional,
    research,
    news,
    economics,
    "digital-health": digitalHealth,
    policy,
    pharma,
    events,
  };
}

export async function loadSectionItems(section: string, limit = 6): Promise<EngineItem[]> {
  try {
    if (section === "professional") {
      const sources = GLOBAL_RSS_SOURCES.slice(0, 6);
      const results = await Promise.allSettled(
        sources.map((source) => fetchRssItems(source.url, source.name, 3))
      );

      const items = results.flatMap((entry) =>
        entry.status === "fulfilled" ? entry.value.map((item) => normalizeEngineItem(item, section)) : []
      );

      return dedupe(sortByRecency(items)).slice(0, limit);
    }

    if (section === "research") {
      const queries = PUBMED_BY_CATEGORY.slice(0, 6);
      const results = await Promise.allSettled(
        queries.map((query) => fetchPubMedItems(query.query, query.categorySlug, 3))
      );

      const items = results.flatMap((entry) =>
        entry.status === "fulfilled" ? entry.value.map((item) => normalizeEngineItem(item, section)) : []
      );

      return dedupe(sortByRecency(items)).slice(0, limit);
    }

    if (section === "news") {
      const results = await Promise.allSettled(
        GLOBAL_RSS_SOURCES.map((source) => fetchRssItems(source.url, source.name, 2))
      );

      const items = results.flatMap((entry) =>
        entry.status === "fulfilled" ? entry.value.map((item) => normalizeEngineItem(item, section)) : []
      );

      return dedupe(sortByRecency(items)).slice(0, limit);
    }

    if (section === "events") {
      const results = await Promise.allSettled(
        EVENT_RSS_SOURCES.map((source) => fetchRssItems(source.url, source.name, 3))
      );

      const items = results.flatMap((entry) =>
        entry.status === "fulfilled" ? entry.value.map((item) => normalizeEngineItem(item, section)) : []
      );

      return dedupe(sortByRecency(items)).slice(0, limit);
    }

    return fallbackSection(section, limit);
  } catch {
    return fallbackSection(section, limit);
  }
}

export async function loadSectionPageData(slug: string): Promise<SectionPageData | null> {
  const meta = sectionMeta[slug];
  if (!meta) return null;

  const key = slug;
  const items = await loadSectionItems(getSectionBucket(slug), 10);

  return {
    key,
    title: meta.title,
    eyebrow: meta.eyebrow,
    description: meta.description,
    metrics: meta.metrics,
    items: items.length > 0 ? items : meta.fallback,
    cta: meta.cta,
  };
}

function getSectionBucket(slug: string) {
  if (slug.startsWith("professional/")) return "professional";
  if (slug.startsWith("research/")) return "research";
  if (slug.startsWith("news/")) return "news";
  if (slug.startsWith("events/")) return "events";
  if (slug.startsWith("digital-health/")) return "digital-health";
  if (slug.startsWith("policy/")) return "policy";
  if (slug.startsWith("pharma/")) return "pharma";
  if (slug.startsWith("economics/")) return "economics";
  if (slug === "careers") return "careers";
  if (slug === "subscribe") return "subscribe";
  if (slug === "submit-research") return "submit-research";
  return "news";
}

function normalizeEngineItem(item: RawFeedItem, section: string): EngineItem {
  const summary = item.description || "Editorial summary curated from reliable healthcare sources.";
  const readTime = `${Math.max(2, Math.ceil(summary.split(/\s+/).length / 180))} min read`;
  const tags = inferTags(item.title, section);

  return {
    title: item.title,
    summary: summary.replace(/\s+/g, " ").trim().slice(0, 220),
    href: item.link || "/",
    source: item.sourceName,
    badge: section.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()),
    tags,
    readTime,
    publishedAt: item.pubDate ?? undefined,
  };
}

function fallbackSection(section: string, limit = 6): EngineItem[] {
  const fallback = globalFallbacks[section] ?? [];
  return fallback.slice(0, limit);
}

function inferTags(title: string, section: string): string[] {
  const lowered = title.toLowerCase();
  const tags = new Set<string>();

  if (lowered.includes("cardio") || lowered.includes("heart")) tags.add("cardiology");
  if (lowered.includes("cancer") || lowered.includes("oncology")) tags.add("oncology");
  if (lowered.includes("covid") || lowered.includes("virus") || lowered.includes("infection")) tags.add("infectious disease");
  if (lowered.includes("diabetes")) tags.add("endocrinology");
  if (lowered.includes("stroke") || lowered.includes("brain")) tags.add("neurology");
  if (lowered.includes("pulmonary") || lowered.includes("lung")) tags.add("pulmonology");
  if (lowered.includes("ai") || lowered.includes("digital")) tags.add("digital health");
  if (lowered.includes("trial")) tags.add("clinical trial");
  if (
    lowered.includes("symposium") ||
    lowered.includes("seminar") ||
    lowered.includes("seminář") ||
    lowered.includes("conference") ||
    lowered.includes("konference") ||
    lowered.includes("webinar") ||
    lowered.includes("webinář")
  ) {
    tags.add("conference");
  }
  if (section === "professional") tags.add("clinical");
  if (section === "research") tags.add("research");
  if (section === "news") tags.add("news");
  if (section === "events") tags.add("events");
  if (section === "pharma") tags.add("pharma");

  return Array.from(tags).slice(0, 4);
}

function sortByRecency(items: EngineItem[]): EngineItem[] {
  return [...items].sort((a, b) => {
    const timeA = a.publishedAt ? new Date(a.publishedAt).getTime() : Number.NEGATIVE_INFINITY;
    const timeB = b.publishedAt ? new Date(b.publishedAt).getTime() : Number.NEGATIVE_INFINITY;

    if (Number.isNaN(timeA) && Number.isNaN(timeB)) return 0;
    if (Number.isNaN(timeA)) return 1;
    if (Number.isNaN(timeB)) return -1;

    return timeB - timeA;
  });
}

function dedupe(items: EngineItem[]): EngineItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.title}-${item.source}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
