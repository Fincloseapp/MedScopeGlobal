import Image from "next/image";
import Link from "next/link";
import type { NewsletterRow } from "@/lib/queries/v4c/newsletters";
import { V22_NEWSLETTER_HERO } from "@/lib/v22/newsletter";
import { Button } from "@/components/ui/button";

export function V22NewsletterHub() {
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <div className="relative aspect-[21/9] min-h-[180px] bg-slate-100 sm:aspect-[3/1]">
          <Image
            src={V22_NEWSLETTER_HERO}
            alt="Odborný medicínský newsletter MedScopeGlobal"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#021d33]/90 via-[#021d33]/70 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-6 py-8 sm:px-10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-200">
              Odborný newsletter
            </p>
            <h2 className="mt-2 max-w-xl font-display text-2xl font-bold text-white sm:text-3xl">
              Medicínský přehled 2× měsíčně
            </h2>
            <p className="mt-2 max-w-lg text-sm text-white/85">
              Studie, legislativa, léky, digitální zdravotnictví a univerzitní novinky — v češtině,
              s odborným layoutem.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild className="rounded-full bg-white text-[#021d33] hover:bg-sky-50">
                <Link href="/subscribe">Přihlásit k odběru</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full border-white/40 text-white hover:bg-white/10">
                <Link href="/newsletter/posledni">Poslední vydání</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { title: "Studie a evidence", desc: "RCT, meta-analýzy, klinický dopad" },
          { title: "Legislativa a úhrady", desc: "MZČR, SÚKL, DRG, metodiky" },
          { title: "Léky a digital health", desc: "Registrace, eHealth, AI ve zdravotnictví" },
        ].map((b) => (
          <div key={b.title} className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="font-semibold text-[#021d33]">{b.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{b.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function V22NewsletterIssue({ issue }: { issue: NewsletterRow }) {
  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="relative aspect-[3/1] bg-slate-100">
        <Image
          src={V22_NEWSLETTER_HERO}
          alt={issue.title}
          fill
          className="object-cover opacity-90"
          sizes="896px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#021d33]/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <p className="text-xs uppercase tracking-wider text-sky-200">Vydání</p>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">{issue.title}</h1>
          <p className="mt-1 text-sm text-white/80">
            {new Date(issue.issue_date).toLocaleDateString("cs-CZ", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>
      <div className="p-6 sm:p-8">
        {issue.html_content ? (
          <div className="prose prose-slate max-w-none prose-headings:font-display prose-headings:text-[#021d33]" dangerouslySetInnerHTML={{ __html: issue.html_content }} />
        ) : (
          <p className="text-slate-600">Obsah vydání bude brzy doplněn.</p>
        )}
        <div className="mt-8 flex flex-wrap gap-3 border-t border-slate-100 pt-6">
          <Button asChild className="rounded-full">
            <Link href="/subscribe">Odebírat newsletter</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/newsletter">← Přehled</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
