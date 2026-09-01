import Image from "next/image";
import Link from "next/link";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { V23_NEWSLETTER_IMAGE } from "@/lib/v23/images";
import { NewsletterCapture } from "@/components/monetization/newsletter-capture";
import { getNewsletterCopy } from "@/lib/i18n/newsletter-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";

export function V23NewsletterCta({ locale = "cs" }: { locale?: string }) {
  const copy = getNewsletterCopy(locale);
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6" aria-labelledby="v23-nl-cta">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="grid lg:grid-cols-2">
          <div className="relative min-h-[220px] bg-slate-100 lg:min-h-full">
            <Image
              src={V23_NEWSLETTER_IMAGE}
              alt={copy.hubTitle}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              loading="lazy"
            />
          </div>
          <div className="flex flex-col justify-center p-8 sm:p-10">
            <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
              <Mail className="h-3.5 w-3.5" aria-hidden />
              {copy.kicker}
            </p>
            <h2 id="v23-nl-cta" className="mt-2 font-display text-2xl font-bold text-[#021d33] sm:text-3xl">
              {copy.hubTitle}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{copy.hubDescription}</p>
            <NewsletterCapture locale={locale} source="v23-cta" className="mt-6" />
            <div className="mt-4">
              <Button asChild variant="outline" className="rounded-full">
                <Link href={localizePublicHref("/newsletter/posledni", locale)} prefetch>
                  {copy.hubLatest}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
