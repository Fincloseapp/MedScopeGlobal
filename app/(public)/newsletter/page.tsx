import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { V22NewsletterHub } from "@/components/v22/newsletter-view";
import { NewsletterCapture } from "@/components/monetization/newsletter-capture";
import { getServerLocale } from "@/lib/i18n/server-locale";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Newsletter",
  description: "Odborný medicínský newsletter 2× měsíčně v češtině.",
};

export default async function NewsletterPage() {
  const locale = await getServerLocale();
  return (
    <ModulePageShell
      eyebrow="Newsletter"
      title="Odborný medicínský newsletter"
      description="Automatické generování 2× měsíčně: studie, legislativa, léky, digitální zdravotnictví a univerzitní novinky."
      ctaHref="/newsletter/posledni"
      ctaLabel="Poslední vydání"
    >
      <NewsletterCapture locale={locale} source="newsletter-hub" className="mb-8" />
      <V22NewsletterHub />
      <div className="mt-6 flex flex-wrap gap-2 text-sm">
        <Link href="/newsletter/posledni" className="rounded-full border border-primary/30 px-3 py-1 text-primary">
          Archiv vydání
        </Link>
      </div>
    </ModulePageShell>
  );
}
