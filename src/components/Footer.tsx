import { Link } from 'react-router-dom';
import { specialtyLinks } from '../data/platform';
import type { Locale } from '../types/content';
import { withLocale } from '../utils/locale';

interface FooterProps {
  locale: Locale;
}

const footerGroups = [
  {
    title: 'Platform',
    links: [
      { label: 'Articles', href: '/articles' },
      { label: 'Knowledge hub', href: '/knowledge' },
      { label: 'Premium', href: '/premium' },
      { label: 'Institutions', href: '/institutions' },
    ],
  },
  {
    title: 'Commercial',
    links: [
      { label: 'Events & education', href: '/events' },
      { label: 'Jobs', href: '/jobs' },
      { label: 'Publish', href: '/publish' },
      { label: 'Partnerships', href: '/partnerships' },
    ],
  },
  {
    title: 'Trust',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Editorial', href: '/editorial' },
      { label: 'Authors', href: '/authors' },
      { label: 'Contact', href: '/contact' },
    ],
  },
];

export function Footer({ locale }: FooterProps) {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <strong>MedScopeGlobal</strong>
        <p>Professional medical knowledge platform for clinical, research, policy, pharma, education and careers.</p>
        <div className="footer-specialties">
          {specialtyLinks.map((link) => (
            <Link key={link.href} to={withLocale(locale, link.href)}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="footer-links">
        {footerGroups.map((group) => (
          <nav key={group.title} aria-label={`${group.title} footer links`}>
            <h2>{group.title}</h2>
            {group.links.map((link) => (
              <Link key={link.href} to={withLocale(locale, link.href)}>
                {link.label}
              </Link>
            ))}
          </nav>
        ))}
      </div>
    </footer>
  );
}
