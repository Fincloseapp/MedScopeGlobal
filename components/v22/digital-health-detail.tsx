import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Calendar } from "lucide-react";
import type { V22DigitalHealthArticle } from "@/lib/v22/digital-health/types";
import { TIER_LABELS } from "@/lib/v22/digital-health/sources";
import { V23TakeawaysBox } from "@/components/v23/takeaways-box";

export function V22DigitalHealthDetail({ article }: { article: V22DigitalHealthArticle }) {
  const sections = [
    { title: "Souhrn", body: article.summaryCs },
    { title: "Co to je", body: article.whatIsCs },
    { title: "Trendy", body: article.trendsCs },
    { title: "Rizika", body: article.risksCs },
    { title: "Legislativa", body: article.legislationCs },
    { title: "Klinický dopad", body: article.clinicalImpactCs },
    { title: "Příklady v praxi", body: article.examplesCs },
  ];

  const byTier = article.sources.reduce(
    (acc, s) => {
      if (!acc[s.tier]) acc[s.tier] = [];
      acc[s.tier].push(s);
      return acc;
    },
    {} as Record<string, typeof article.sources>
  );

  return (
    <article className="v22-dh-detail mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link href="/digital-health" prefetch className="text-sm font-medium text-primary hover:underline">
        ← Digitální zdravotnictví
      </Link>

      <header className="mt-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
          Digitální zdravotnictví · {article.topic}
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-[#021d33] sm:text-4xl">
          {article.title}
        </h1>
        <p className="mt-2 inline-flex items-center gap-1 text-sm text-slate-500">
          <Calendar className="h-3.5 w-3.5" />
          <time dateTime={article.publishedDate}>{article.publishedDateLabel}</time>
        </p>
      </header>

      <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-2xl bg-slate-100">
        <Image
          src={article.imageUrl}
          alt={article.title}
          fill
          className="object-cover"
          sizes="(max-width: 896px) 100vw, 896px"
          priority
        />
      </div>

      <V23TakeawaysBox points={article.keyPointsCs} />

      <div className="mt-8 space-y-8">
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="font-display text-xl font-semibold text-[#021d33]">{s.title}</h2>
            <p className="mt-3 leading-relaxed text-slate-700">{s.body}</p>
          </section>
        ))}
      </div>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="font-display text-lg font-semibold text-[#021d33]">Zdroje a reference</h2>
        <p className="mt-1 text-sm text-slate-600">
          Obsah vychází z ověřených odborných portálů — priorita české, evropské, americké a globální.
        </p>
        <div className="mt-4 space-y-4">
          {(["cz", "eu", "us", "global"] as const).map((tier) => {
            const list = byTier[tier];
            if (!list?.length) return null;
            return (
              <div key={tier}>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {TIER_LABELS[tier]}
                </p>
                <ul className="mt-2 space-y-1">
                  {list.map((s) => (
                    <li key={s.url}>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-slate-700 hover:text-primary"
                      >
                        {s.name}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>
    </article>
  );
}
