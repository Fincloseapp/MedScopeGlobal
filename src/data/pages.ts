import { navChildren } from './navigation';
import type { ContentCategory } from '../types/content';

export interface PageDefinition {
  path: string;
  title: string;
  eyebrow: string;
  description: string;
  categories: ContentCategory[];
}

const descriptions: Record<ContentCategory, string> = {
  'clinical-insights': 'Specialty-tagged clinical insight articles selected from indexed literature and editorial sources.',
  'case-reports': 'Case reports, diagnostic lessons and rare-disease observations for practicing clinicians.',
  guidelines: 'Guideline surveillance across professional societies, WHO updates and standard-of-care changes.',
  'research-articles': 'Peer-reviewed research articles with author metadata, citations, affiliations and specialty tagging.',
  'clinical-studies': 'Clinical study registry intelligence, trial status updates and sponsor information.',
  preprints: 'Preprint monitoring from MedRxiv and BioRxiv, clearly separated from peer-reviewed literature.',
  'student-research': 'Student and early-career research, mentoring pathways and submission opportunities.',
  'daily-news': 'Daily medical news from institutional sources and trusted medical intelligence feeds.',
  'key-updates': 'High-priority regulatory, guideline and public-health updates for clinical leaders.',
  conferences: 'International medical congresses, abstract deadlines and CME-relevant conference listings.',
  webinars: 'Live and on-demand webinars for clinical practice, policy, digital health and pharma updates.',
  reports: 'Congress reports, late-breaking abstract summaries and post-event expert analysis.',
  'new-drugs': 'FDA and EMA drug approval intelligence, new indications and safety communications.',
  'drug-reviews': 'Drug reviews covering evidence, safety signals, prescribing context and clinical pharmacology.',
  'clinical-trials': 'Pharma-focused clinical trial intelligence from registry sources and sponsor updates.',
  'costs-drg': 'DRG, cost analysis and hospital finance intelligence for medical and executive audiences.',
  insurance: 'Insurance trends, payer policy, reimbursement movement and market access implications.',
  'market-analysis': 'Healthcare market analysis across providers, payers, access and regional demand.',
  ehealth: 'eHealth, telemedicine and interoperability implementation intelligence.',
  ai: 'AI in medicine, validation evidence, governance frameworks and clinical workflow impact.',
  systems: 'Healthcare data systems, EHR architecture, interoperability and infrastructure updates.',
  legislation: 'Healthcare legislation and policy movements affecting clinical delivery and reimbursement.',
  compliance: 'Healthcare compliance updates across privacy, quality, reporting and cross-border obligations.',
  'healthcare-law': 'Healthcare law briefs, liability questions and legal developments for medical leaders.',
  careers: 'Medical jobs, fellowships, editorial opportunities and early-career programs.',
};

export const pageDefinitions: PageDefinition[] = navChildren.map((child) => ({
  path: child.path,
  title: child.label,
  eyebrow: child.path.split('/')[1]?.replace('-', ' ') ?? 'MedScopeGlobal',
  description: descriptions[child.category],
  categories: [child.category],
}));

export function getPageDefinition(path: string): PageDefinition | undefined {
  return pageDefinitions.find((page) => page.path === path);
}
