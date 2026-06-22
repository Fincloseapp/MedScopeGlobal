import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { V22NewsletterHub } from "@/components/v22/newsletter-view";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Newsletter",
  description: "Odborný medicínský newsletter 2× měsíčně v češtině.",
};

export default function NewsletterPage() {
  return (
    <ModulePageShell
      eyebrow="Newsletter"
      title="Odborný medicínský newsletter"
      description="Automatické generování 2× měsíčně: studie, legislativa, léky, digitální zdravotnictví a univerzitní novinky."
      ctaHref="/newsletter/posledni"
      ctaLabel="Poslední vydání"
    >
      <V22NewsletterHub />
      <div className="mt-6 flex flex-wrap gap-2 text-sm">
        <Link href="/newsletter/posledni" className="rounded-full border border-primary/30 px-3 py-1 text-primary">
          Archiv vydání
        </Link>
        <Link href="/subscribe" className="rounded-full bg-primary px-3 py-1 text-white">
          Přihlásit k odběru
        </Link>
      </div>
    </ModulePageShell>
  );
}
