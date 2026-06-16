import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AcademyPageHeader({
  eyebrow,
  title,
  description,
  ctaHref,
  ctaLabel,
}: {
  eyebrow: string;
  title: string;
  description: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <section className="border-b border-[#d9e8f4] bg-[radial-gradient(circle_at_top,_rgba(0,91,150,0.1),transparent_30%),linear-gradient(180deg,#fff_0%,#f8fbff_100%)]">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#005B96]">{eyebrow}</p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-[#021d33]">{title}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">{description}</p>
        {ctaHref && ctaLabel ? (
          <Button asChild className="mt-6 rounded-full bg-[#005B96]">
            <Link href={ctaHref}>
              {ctaLabel}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        ) : null}
      </div>
    </section>
  );
}
