import type { ContentCategory } from '../types/content';

export interface NavigationItem {
  label: string;
  path?: string;
  section?: string;
  children?: NavigationChild[];
}

export interface NavigationChild {
  label: string;
  path: string;
  category: ContentCategory;
}

export const navigation: NavigationItem[] = [
  { label: 'HOME', path: '/' },
  {
    label: 'PROFESSIONAL',
    section: '/professional',
    children: [
      { label: 'Clinical Insights', path: '/professional/clinical-insights', category: 'clinical-insights' },
      { label: 'Case Reports', path: '/professional/case-reports', category: 'case-reports' },
      { label: 'Guidelines', path: '/professional/guidelines', category: 'guidelines' },
    ],
  },
  {
    label: 'RESEARCH',
    section: '/research',
    children: [
      { label: 'Articles', path: '/research/articles', category: 'research-articles' },
      { label: 'Clinical Studies', path: '/research/clinical-studies', category: 'clinical-studies' },
      { label: 'Preprints', path: '/research/preprints', category: 'preprints' },
      { label: 'Student Research', path: '/research/student-research', category: 'student-research' },
    ],
  },
  {
    label: 'HEALTHCARE ECONOMICS',
    section: '/economics',
    children: [
      { label: 'Costs & DRG', path: '/economics/costs-drg', category: 'costs-drg' },
      { label: 'Insurance', path: '/economics/insurance', category: 'insurance' },
      { label: 'Market Analysis', path: '/economics/market-analysis', category: 'market-analysis' },
    ],
  },
  {
    label: 'DIGITAL HEALTH',
    section: '/digital-health',
    children: [
      { label: 'eHealth', path: '/digital-health/ehealth', category: 'ehealth' },
      { label: 'AI', path: '/digital-health/ai', category: 'ai' },
      { label: 'Systems', path: '/digital-health/systems', category: 'systems' },
    ],
  },
  {
    label: 'REGULATION & POLICY',
    section: '/policy',
    children: [
      { label: 'Legislation', path: '/policy/legislation', category: 'legislation' },
      { label: 'Compliance', path: '/policy/compliance', category: 'compliance' },
      { label: 'Healthcare Law', path: '/policy/healthcare-law', category: 'healthcare-law' },
    ],
  },
  {
    label: 'PHARMA & DRUGS',
    section: '/pharma',
    children: [
      { label: 'New Drugs', path: '/pharma/new-drugs', category: 'new-drugs' },
      { label: 'Drug Reviews', path: '/pharma/drug-reviews', category: 'drug-reviews' },
      { label: 'Clinical Trials', path: '/pharma/clinical-trials', category: 'clinical-trials' },
    ],
  },
  {
    label: 'NEWS & UPDATES',
    section: '/news',
    children: [
      { label: 'Daily', path: '/news/daily', category: 'daily-news' },
      { label: 'Key Updates', path: '/news/key-updates', category: 'key-updates' },
    ],
  },
  {
    label: 'CONGRESSES & EVENTS',
    section: '/events',
    children: [
      { label: 'Conferences', path: '/events/conferences', category: 'conferences' },
      { label: 'Webinars', path: '/events/webinars', category: 'webinars' },
      { label: 'Reports', path: '/events/reports', category: 'reports' },
    ],
  },
  { label: 'CAREERS', path: '/careers' },
  { label: 'SUBSCRIBE', path: '/subscribe' },
];

export const navChildren = navigation.flatMap((item) => item.children ?? []);
