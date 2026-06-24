"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ChevronDown, HeartPulse, Stethoscope } from "lucide-react";
import type { LocaleCode } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

type GatewayCard = {
  id: string;
  icon: typeof HeartPulse;
  title: string;
  subtitle: string;
  description: string;
  href: string;
  cta: string;
  highlights: string[];
  quickLinks: { href: string; label: string; desc: string }[];
};

const cardsCs: [GatewayCard, GatewayCard] = [
  {
    id: "verejnost",
    icon: HeartPulse,
    title: "Pro veřejnost",
    subtitle: "Zdraví srozumitelně",
    description:
      "Prevence, symptomy, výživa a životní styl — články v češtině, denní tipy a AI asistent pro orientaci ve zdraví.",
    href: "/verejnost",
    cta: "Vstoupit do sekce veřejnosti",
    highlights: ["Prevence a symptomy", "Denní zdravotní tip", "Zeptej se AI"],
    quickLinks: [
      { href: "/verejnost/temata", label: "Najdi svůj problém", desc: "Témata podle oblasti zdraví" },
      { href: "/verejnost/clanky", label: "Články pro veřejnost", desc: "Srozumitelné texty bez žargonu" },
      { href: "/verejnost/osveta", label: "Denní zdravotní tip", desc: "Video s kvízem a body XP" },
      { href: "/ai-asistent/verejnost", label: "Zeptej se AI", desc: "Prevence — nenahrazuje lékaře" },
    ],
  },
  {
    id: "lekar",
    icon: Stethoscope,
    title: "Pro lékaře",
    subtitle: "Klinická praxe",
    description:
      "Guidelines, kazuistiky, klinické postřehy a AI asistent pro každodenní rozhodování v ambulanci i lůžkové péči.",
    href: "/pro-koho/lekar",
    cta: "Obsah pro lékaře",
    highlights: ["Klinické postupy", "Guidelines", "Kazuistiky"],
    quickLinks: [
      { href: "/professional/clinical-insights", label: "Klinické postřehy", desc: "Praxe a rozhodování" },
      { href: "/professional/case-reports", label: "Kazuistiky", desc: "Případy z praxe" },
      { href: "/professional/guidelines", label: "Guidelines", desc: "Doporučené postupy" },
      { href: "/ai-asistent/lekar", label: "Klinický AI asistent", desc: "Evidence-based podpora" },
    ],
  },
];

const cardsEn: [GatewayCard, GatewayCard] = [
  {
    id: "verejnost",
    icon: HeartPulse,
    title: "For the public",
    subtitle: "Health made clear",
    description:
      "Prevention, symptoms, nutrition and lifestyle — accessible articles, daily tips and a public health AI assistant.",
    href: "/verejnost",
    cta: "Enter public health hub",
    highlights: ["Prevention", "Daily health tip", "Ask AI"],
    quickLinks: [
      { href: "/verejnost/temata", label: "Find your topic", desc: "Browse by health area" },
      { href: "/verejnost/clanky", label: "Public articles", desc: "Plain-language guides" },
      { href: "/verejnost/osveta", label: "Daily health tip", desc: "Video with quiz" },
      { href: "/ai-asistent/verejnost", label: "Ask AI", desc: "Not a substitute for a doctor" },
    ],
  },
  {
    id: "lekar",
    icon: Stethoscope,
    title: "For clinicians",
    subtitle: "Clinical practice",
    description:
      "Guidelines, case reports, clinical insights and an AI assistant for daily decision-making in practice.",
    href: "/pro-koho/lekar",
    cta: "Clinical content",
    highlights: ["Clinical workflows", "Guidelines", "Case reports"],
    quickLinks: [
      { href: "/professional/clinical-insights", label: "Clinical insights", desc: "Practice intelligence" },
      { href: "/professional/case-reports", label: "Case reports", desc: "Real-world cases" },
      { href: "/professional/guidelines", label: "Guidelines", desc: "Recommended protocols" },
      { href: "/ai-asistent/lekar", label: "Clinical AI", desc: "Evidence-based support" },
    ],
  },
];

function GatewayCardPanel({
  card,
  expanded,
  onToggleQuickLinks,
  quickLinksLabel,
}: {
  card: GatewayCard;
  expanded: boolean;
  onToggleQuickLinks: () => void;
  quickLinksLabel: string;
}) {
  const Icon = card.icon;

  return (
    <article
      className={cn(
        "group flex flex-col rounded-[28px] border bg-white p-6 shadow-[0_18px_46px_-28px_rgba(0,91,150,0.7)] transition duration-300",
        expanded
          ? "border-[#005B96]/40 shadow-[0_24px_56px_-24px_rgba(0,91,150,0.55)] ring-1 ring-[#005B96]/15"
          : "border-[#dfeaf5] hover:-translate-y-0.5 hover:border-[#8dc4ea] hover:shadow-[0_24px_56px_-24px_rgba(0,91,150,0.5)]"
      )}
    >
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e6f4ff] text-[#005B96] transition group-hover:bg-[#005B96] group-hover:text-white">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#005B96]">{card.subtitle}</p>
      <h3 className="mt-2 font-display text-xl font-semibold text-[#021d33]">{card.title}</h3>
      <p className="mt-3 flex-1 text-sm text-slate-600">{card.description}</p>
      <ul className="mt-4 space-y-1.5 text-xs text-slate-500">
        {card.highlights.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onToggleQuickLinks}
        className="mt-4 flex w-full items-center justify-between rounded-xl border border-[#dfeaf5] bg-[#f8fbff] px-3 py-2 text-left text-xs font-semibold text-[#005B96] transition hover:border-[#8dc4ea] hover:bg-[#eef6fc]"
        aria-expanded={expanded}
      >
        {quickLinksLabel}
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 transition-transform", expanded && "rotate-180")}
          aria-hidden
        />
      </button>

      {expanded ? (
        <ul className="mt-3 space-y-2">
          {card.quickLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="block rounded-xl border border-[#dfeaf5] px-3 py-2.5 transition hover:border-[#8dc4ea] hover:bg-[#f0f7ff]"
              >
                <span className="text-sm font-medium text-[#021d33]">{link.label}</span>
                <span className="mt-0.5 block text-xs text-slate-500">{link.desc}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      <Link
        href={card.href}
        className="mt-5 inline-flex items-center justify-center rounded-full bg-[#005B96] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#004874]"
      >
        {card.cta}
        <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
      </Link>
    </article>
  );
}

export function AudienceGateway({ locale }: { locale: LocaleCode }) {
  const isCs = locale === "cs";
  const cards = isCs ? cardsCs : cardsEn;
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = (id: string) => setExpandedId((current) => (current === id ? null : id));

  return (
    <section className="border-b border-[#dfeaf5] bg-white" aria-labelledby="audience-gateway-heading">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#005B96]">
            {isCs ? "Rychlý vstup" : "Quick entry"}
          </p>
          <h2 id="audience-gateway-heading" className="mt-2 font-display text-3xl font-semibold text-[#021d33]">
            {isCs ? "Pro veřejnost i pro lékaře" : "For the public and clinicians"}
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            {isCs
              ? "Dvě hlavní cesty do portálu — rozbalte rychlé odkazy nebo vstupte přímo do celé sekce."
              : "Two main paths into the platform — expand quick links or enter the full section."}
          </p>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {cards.map((card) => (
            <GatewayCardPanel
              key={card.id}
              card={card}
              expanded={expandedId === card.id}
              onToggleQuickLinks={() => toggle(card.id)}
              quickLinksLabel={isCs ? "Rychlé odkazy" : "Quick links"}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
