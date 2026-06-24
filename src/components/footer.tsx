import Link from "next/link";
import { footerSections, siteConfig } from "@/lib/site";

export function Footer() {
  return (
    <footer className="footer">
      <div>
        <strong>{siteConfig.name}</strong>
        <p>{siteConfig.description}</p>
        <p>
          <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
        </p>
      </div>
      {footerSections.map((section) => (
        <div key={section.title}>
          <h2>{section.title}</h2>
          {section.links.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
      ))}
    </footer>
  );
}
