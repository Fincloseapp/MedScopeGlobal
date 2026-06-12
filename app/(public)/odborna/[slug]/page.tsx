import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { OdbornaGate } from "@/components/odborna/odborna-gate";
import { ProfessionalDisclaimer } from "@/components/odborna/professional-disclaimer";
import { getOdbornaAccess } from "@/lib/auth/odborna-access";
import {
  getOdbornaSection,
  ODBORNA_SECTIONS,
} from "@/lib/config/odborna-sections";
import { logSecurityEvent } from "@/lib/security/security-log";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const section = getOdbornaSection(slug);
  if (!section) return { title: "Odborná sekce" };
  return {
    title: `${section.title} — Odborná sekce`,
    description: section.description,
  };
}

export const dynamic = "force-dynamic";

export default async function OdbornaSlugPage({ params }: Props) {
  const { slug } = await params;
  const section = getOdbornaSection(slug);
  if (!section) notFound();

  const access = await getOdbornaAccess();

  if (!access.user) {
    redirect(`/login?next=/odborna/${slug}`);
  }

  if (!access.allowed) {
    await logSecurityEvent({
      userId: access.user.id,
      action: "odborna:content_blocked",
      status: "blocked",
      details: { slug, reason: access.reason },
    });

    return (
      <ModulePageShell
        eyebrow="Odborná sekce"
        title={section.title}
        description={section.description}
        ctaHref="/odborna"
        ctaLabel="Zpět na hub"
      >
        <Link
          href="/odborna"
          className="mb-6 inline-block text-sm text-primary hover:underline"
        >
          ← Odborná sekce
        </Link>
        <OdbornaGate reason={access.reason!} clkStatus={access.clk} />
      </ModulePageShell>
    );
  }

  await logSecurityEvent({
    userId: access.user.id,
    action: "odborna:content_view",
    status: "ok",
    details: { slug },
  });

  return (
    <ModulePageShell
      eyebrow="Odborná sekce"
      title={section.title}
      description={section.description}
      ctaHref="/odborna"
      ctaLabel="Všechny oblasti"
    >
      <Link
        href="/odborna"
        className="mb-6 inline-block text-sm text-primary hover:underline"
      >
        ← Odborná sekce
      </Link>

      <ProfessionalDisclaimer className="mb-8" />

      <article className="prose prose-slate max-w-none">
        <p>
          Tato oblast je určena výhradně ověřeným lékařům. Obsah je průběžně
          doplňován redakcí MedScope a partnery z odborných společností.
        </p>
        <h2>Co zde najdete</h2>
        <p>{section.description}</p>
        <ul>
          {section.highlights.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="text-sm text-muted-foreground">
          Plný katalog článků v této rubrice bude dostupný po napojení na
          redakční workflow. Mezitím využijte{" "}
          <Link href="/sections/clinical-medicine">klinickou sekci</Link> nebo{" "}
          <Link href="/legislativa">legislativu</Link>.
        </p>
      </article>

      <section className="mt-12 border-t pt-8">
        <h2 className="text-sm font-semibold uppercase text-muted-foreground">
          Další oblasti
        </h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {ODBORNA_SECTIONS.filter((s) => s.slug !== slug).map((s) => (
            <li key={s.slug}>
              <Link
                href={`/odborna/${s.slug}`}
                className="rounded-full border px-3 py-1 text-sm hover:bg-muted"
              >
                {s.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </ModulePageShell>
  );
}
