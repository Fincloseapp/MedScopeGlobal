import Image from "next/image";
import Link from "next/link";
import type { NewsletterRow } from "@/lib/queries/v4c/newsletters";
import type { V23NewsletterLayout } from "@/lib/v23/newsletter/types";
import { V23_NEWSLETTER_IMAGE } from "@/lib/v23/images";
import { Button } from "@/components/ui/button";

function parseLayout(issue: NewsletterRow): V23NewsletterLayout | null {
  if (issue.layout_json && typeof issue.layout_json === "object" && "version" in issue.layout_json) {
    return issue.layout_json as V23NewsletterLayout;
  }
  return null;
}

export function V23NewsletterIssueView({ issue }: { issue: NewsletterRow }) {
  const layout = parseLayout(issue);
  const heroUrl = layout?.heroImageUrl ?? V23_NEWSLETTER_IMAGE;
  const heroAlt = layout?.heroImageAlt ?? issue.title;
  const intro = layout?.intro;

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="relative aspect-[21/9] min-h-[200px] bg-slate-100 sm:aspect-[3/1]">
        <Image
          src={heroUrl}
          alt={heroAlt}
          fill
          className="object-cover"
          sizes="(max-width: 896px) 100vw, 896px"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#021d33]/90 via-[#021d33]/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-200">Odborný newsletter</p>
          <h1 className="mt-2 font-display text-2xl font-bold sm:text-3xl">{layout?.headline ?? issue.title}</h1>
          <p className="mt-2 text-sm text-white/85">
            {new Date(issue.issue_date).toLocaleDateString("cs-CZ", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        {intro ? (
          <p className="text-base leading-relaxed text-slate-700">{intro}</p>
        ) : null}

        {layout?.sections?.length ? (
          <div className="mt-8 space-y-10">
            {layout.sections.map((sec) => (
              <section key={sec.id} className="scroll-mt-24" id={`nl-${sec.id}`}>
                <div className="relative mb-4 aspect-[16/9] overflow-hidden rounded-2xl bg-slate-100">
                  <Image
                    src={sec.imageUrl}
                    alt={sec.imageAlt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 896px) 100vw, 800px"
                    loading="lazy"
                  />
                </div>
                <h2 className="font-display text-xl font-bold text-[#021d33] sm:text-2xl">{sec.title}</h2>
                <p className="mt-2 text-sm text-slate-600">{sec.intro}</p>
                <ul className="mt-4 space-y-4">
                  {sec.items.map((item, i) => (
                    <li key={`${sec.id}-${i}`} className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                      {item.href ? (
                        <Link href={item.href} className="font-semibold text-[#005B96] hover:underline">
                          {item.title}
                        </Link>
                      ) : (
                        <p className="font-semibold text-[#021d33]">{item.title}</p>
                      )}
                      <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.summary}</p>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        ) : issue.html_content ? (
          <div
            className="prose prose-slate mt-6 max-w-none prose-headings:font-display prose-headings:text-[#021d33]"
            dangerouslySetInnerHTML={{ __html: issue.html_content }}
          />
        ) : (
          <p className="mt-6 text-slate-600">Obsah vydání bude brzy doplněn.</p>
        )}

        <div className="mt-10 rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-6 text-center">
          <h2 className="font-display text-lg font-bold text-[#021d33]">Přihlásit se k odběru</h2>
          <p className="mt-2 text-sm text-slate-600">
            Týdenní odborný přehled studií, legislativy a novinek přímo do e-mailu.
          </p>
          <Button asChild className="mt-4 rounded-full">
            <Link href="/subscribe">Přihlásit k odběru</Link>
          </Button>
        </div>

        <div className="mt-8 flex flex-wrap gap-3 border-t border-slate-100 pt-6">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/newsletter/archiv">Archiv vydání</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/newsletter">← Přehled</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
