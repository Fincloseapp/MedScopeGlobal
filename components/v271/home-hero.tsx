import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { V271_HERO, V271_HERO_CTAS } from "@/lib/v271/homepage";
import { V23_HERO_IMAGE } from "@/lib/v23/images";
export function V271HomeHero() {
  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-[#021d33] text-white">
      <div className="absolute inset-0">
        <Image
          src={V23_HERO_IMAGE}
          alt="Moderní zdravotnická péče a medicínský výzkum"
          fill
          className="object-cover opacity-35"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#021d33] via-[#021d33]/92 to-[#021d33]/75" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-200 backdrop-blur">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          {V271_HERO.eyebrow}
        </p>
        <h1 className="mt-5 max-w-4xl font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-[3.1rem]">
          {V271_HERO.claim}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-white/85">{V271_HERO.subtitle}</p>

        <div className="mt-8 flex flex-wrap gap-3">
          {V271_HERO_CTAS.map((cta, i) => (
            <Button
              key={cta.href}
              asChild
              size="lg"
              variant={i === 0 ? "default" : "outline"}
              className={
                i === 0
                  ? "rounded-full bg-white px-6 text-[#021d33] hover:bg-sky-50"
                  : "rounded-full border-white/40 bg-transparent text-white hover:bg-white/10"
              }
            >
              <Link href={cta.href} prefetch>
                {cta.label}
                {i === 0 ? <ArrowRight className="ml-2 h-4 w-4" /> : null}
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}
