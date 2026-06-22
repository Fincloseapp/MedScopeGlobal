import Image from "next/image";
import Link from "next/link";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { V23_NEWSLETTER_IMAGE } from "@/lib/v23/images";

export function V23NewsletterCta() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6" aria-labelledby="v23-nl-cta">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="grid lg:grid-cols-2">
          <div className="relative min-h-[220px] bg-slate-100 lg:min-h-full">
            <Image
              src={V23_NEWSLETTER_IMAGE}
              alt="Odborný medicínský newsletter MedScopeGlobal"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              loading="lazy"
            />
          </div>
          <div className="flex flex-col justify-center p-8 sm:p-10">
            <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
              <Mail className="h-3.5 w-3.5" aria-hidden />
              Newsletter
            </p>
            <h2 id="v23-nl-cta" className="mt-2 font-display text-2xl font-bold text-[#021d33] sm:text-3xl">
              Odborný přehled týdně
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Studie, legislativa, léky a digitální zdravotnictví v profesionálním layoutu — česky,
              s klíčovými body a odkazy na zdroje.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="rounded-full">
                <Link href="/subscribe" prefetch>
                  Přihlásit k odběru
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/newsletter/posledni" prefetch>
                  Poslední vydání
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
