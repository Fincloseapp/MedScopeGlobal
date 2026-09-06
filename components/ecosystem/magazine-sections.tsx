import Link from "next/link";
import { Crown, TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import { LONGEVITY_PROTOCOLS, localizedText } from "@/lib/ecosystem/longevity-protocols";
import { TopLongevityProducts } from "@/components/monetization/affiliate-box";
import type { GlobalLocaleCode } from "@/lib/ecosystem/locales";

/** Trendy 2026–2027 section */
export function TrendySection() {
  const trends = [
    { title: "GLP-1 a metabolismus", href: "/articles?q=glp-1", tag: "Trend 2026" },
    { title: "Biohacking pro začátečníky", href: "/vip/protokoly/biohacking-zacatecnici", tag: "Novinka" },
    { title: "Optimalizace spánku", href: "/vip/protokoly/optimalizace-spanku", tag: "Longevity" },
    { title: "Mentální wellness", href: "/vip/protokoly/mentalni-wellness", tag: "Wellness" },
  ];

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-[#f7fafc] to-[#e8f3fb] px-3 py-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[#005B96]" />
          <h2 className="text-sm font-bold text-[#021d33]">Trendy 2026–2027</h2>
        </div>
        <Link href="/articles" className="text-xs font-medium text-[#005B96] hover:underline">
          více →
        </Link>
      </header>
      <div className="grid gap-2 p-3 sm:grid-cols-2">
        {trends.map((t) => (
          <Link
            key={t.title}
            href={t.href}
            className="group rounded-lg border border-slate-100 bg-slate-50 p-3 hover:border-[#005B96]/30 hover:bg-[#e8f3fb]/50"
          >
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#005B96]">
              {t.tag}
            </span>
            <p className="mt-1 text-sm font-semibold text-[#021d33] group-hover:text-[#005B96]">
              {t.title}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

/** Longevity protocols preview on homepage */
export function LongevityProtocolsSection() {
  const preview = LONGEVITY_PROTOCOLS.slice(0, 4);

  return (
    <section className="rounded-lg border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-sm">
      <header className="flex items-center justify-between border-b border-amber-100 px-3 py-2">
        <div className="flex items-center gap-2">
          <Crown className="h-4 w-4 text-amber-600" />
          <h2 className="text-sm font-bold text-[#021d33]">Longevity protokoly</h2>
        </div>
        <Link href="/vip/protokoly" className="text-xs font-medium text-amber-700 hover:underline">
          všech 10 →
        </Link>
      </header>
      <div className="space-y-2 p-3">
        {preview.map((p) => (
          <Link
            key={p.slug}
            href={`/vip/protokoly/${p.slug}`}
            className="flex items-center justify-between rounded-md bg-white/80 px-3 py-2 hover:bg-white"
          >
            <div>
              <span className="text-[10px] font-semibold text-amber-600">
                #{p.number.toString().padStart(2, "0")}
              </span>
              <p className="text-sm font-medium text-[#021d33]">
                {localizedText(p.title, "cs")}
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-amber-500" />
          </Link>
        ))}
      </div>
    </section>
  );
}

/** Recommended tools section */
export function RecommendedToolsSection() {
  const tools = [
    { name: "MediFlow", desc: "Wellness deník", href: "/app/mediflow", color: "emerald" },
    { name: "VIP", desc: "Longevity protokoly", href: "/vip/protokoly", color: "amber" },
    { name: "MeDipacient", desc: "Lékařské zprávy", href: "/app/pacient", color: "blue" },
    { name: "OrdiZapis", desc: "Pro lékaře", href: "/app/dokumentace", color: "navy" },
  ];

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center justify-between border-b border-slate-100 bg-[#f7fafc] px-3 py-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#005B96]" />
          <h2 className="text-sm font-bold text-[#021d33]">Doporučené nástroje</h2>
        </div>
        <Link href="/aplikace" className="text-xs font-medium text-[#005B96] hover:underline">
          všechny →
        </Link>
      </header>
      <div className="grid grid-cols-2 gap-2 p-3">
        {tools.map((t) => (
          <Link
            key={t.name}
            href={t.href}
            className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-center hover:border-[#005B96]/30 hover:bg-[#e8f3fb]/50"
          >
            <p className="text-sm font-semibold text-[#021d33]">{t.name}</p>
            <p className="text-[11px] text-slate-500">{t.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

/** Affiliate longevity products for homepage sidebar */
export function HomepageAffiliateSection({ locale = "cs" }: { locale?: string }) {
  return <TopLongevityProducts locale={locale as GlobalLocaleCode} />;
}
