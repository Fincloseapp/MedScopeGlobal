import Link from "next/link";
import { BookOpen, FlaskConical, GraduationCap } from "lucide-react";

type Props = {
  articleSlug: string;
  articleTitle: string;
};

const blocks = [
  {
    label: "AI simulace",
    href: "/academy/ai-simulations",
    icon: FlaskConical,
  },
  {
    label: "Otestovat téma",
    href: (slug: string) => `/academy/tests?topic=${encodeURIComponent(slug)}`,
    icon: BookOpen,
  },
  {
    label: "Academy",
    href: "/academy",
    icon: GraduationCap,
  },
] as const;

export function ArticleCtaBlocks({ articleSlug }: Props) {
  return (
    <section className="not-prose my-10 border-t border-slate-200 pt-8" aria-label="Academy">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#005B96]">
        MedScope Academy
      </p>
      <p className="mt-1 text-sm text-slate-600">
        Pokračovat ve studiu k tomuto tématu
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {blocks.map((block) => {
          const Icon = block.icon;
          const href =
            typeof block.href === "function" ? block.href(articleSlug) : block.href;
          return (
            <Link
              key={block.label}
              href={href}
              className="inline-flex items-center gap-2 border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-[#021d33] transition hover:border-[#005B96] hover:text-[#005B96]"
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {block.label}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
