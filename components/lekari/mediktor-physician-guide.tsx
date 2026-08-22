"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  Copy,
  Download,
  Link2,
  Mic,
  Scale,
  Shield,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PHYSICIAN_GUIDE as G } from "@/lib/lekari/dokumentace/physician-guide";
import { MEDIKTOR } from "@/lib/lekari/dokumentace/branding";

export function MediktorPhysicianGuide({
  variant = "full",
}: {
  variant?: "full" | "app";
}) {
  const [copied, setCopied] = useState<"long" | "short" | null>(null);

  async function copyScript(which: "long" | "short") {
    const text = which === "long" ? G.legal.script : G.legal.scriptShort;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      window.setTimeout(() => setCopied(null), 1800);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className={variant === "app" ? "space-y-4" : "space-y-8"}>
      <header>
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#005B96]">
          {MEDIKTOR.shortName} · pro lékaře
        </p>
        <h2 className="mt-1 font-display text-2xl font-bold text-[#021d33] sm:text-3xl">
          {G.title}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{G.subtitle}</p>
      </header>

      <section className="rounded-2xl border border-[#cfe1f3] bg-white p-5 sm:p-6">
        <h3 className="font-display text-lg font-bold text-[#021d33]">{G.workflow.title}</h3>
        <p className="mt-1 text-sm text-slate-500">{G.workflow.intro}</p>
        <ol className="mt-4 space-y-3">
          {G.workflow.steps.map((s) => (
            <li key={s.n} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#005B96] text-xs font-bold text-white">
                {s.n}
              </span>
              <div>
                <p className="text-sm font-semibold text-[#021d33]">{s.title}</p>
                <p className="mt-0.5 text-sm leading-6 text-slate-600">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <GuideCard icon={Download} title={G.download.title} items={G.download.items} />
        <GuideCard icon={Smartphone} title={G.daily.title} items={G.daily.items} />
        <GuideCard icon={Check} title={G.sync.title} items={G.sync.items} />
        <GuideCard icon={Copy} title={G.copy.title} items={G.copy.items} />
      </div>

      <section className="rounded-2xl border border-[#cfe1f3] bg-white p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Link2 className="h-5 w-5 text-[#005B96]" />
          <h3 className="font-display text-lg font-bold text-[#021d33]">{G.integration.title}</h3>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-600">{G.integration.intro}</p>
        <ul className="mt-4 space-y-3">
          {G.integration.paths.map((p) => (
            <li key={p.title} className="rounded-xl bg-[#f4f9fc] px-4 py-3">
              <p className="text-sm font-semibold text-[#021d33]">{p.title}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{p.text}</p>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs leading-5 text-slate-500">{G.integration.where}</p>
      </section>

      <section
        id="pacient"
        className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 sm:p-6"
      >
        <div className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-emerald-800" />
          <h3 className="font-display text-lg font-bold text-[#021d33]">{G.legal.title}</h3>
        </div>
        <p className="mt-2 text-sm font-medium leading-6 text-emerald-950">{G.legal.lead}</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {G.legal.twoModes.map((m) => (
            <article key={m.title} className="rounded-xl border border-emerald-100 bg-white px-4 py-3">
              <p className="text-sm font-semibold text-[#021d33]">{m.title}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{m.text}</p>
            </article>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-[#005B96]/20 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#005B96]">
            {G.legal.scriptTitle}
          </p>
          <blockquote className="mt-2 text-sm font-medium leading-7 text-[#021d33]">
            „{G.legal.script}“
          </blockquote>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              className="h-9 rounded-full bg-[#005B96]"
              onClick={() => void copyScript("long")}
            >
              <Copy className="mr-1.5 h-3.5 w-3.5" />
              {copied === "long" ? "Zkopírováno" : "Kopírovat větu"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-9 rounded-full"
              onClick={() => void copyScript("short")}
            >
              {copied === "short" ? "Zkopírováno" : "Kratší verze"}
            </Button>
          </div>
          <p className="mt-2 text-xs italic text-slate-500">„{G.legal.scriptShort}“</p>
        </div>

        <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm leading-6 text-slate-700">
          {G.legal.rules.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>

        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#005B96]">
          {G.legal.basesTitle}
        </p>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-xs leading-5 text-slate-600">
          {G.legal.bases.map((b) => (
            <li key={b.slice(0, 40)}>{b}</li>
          ))}
        </ul>
        <p className="mt-3 text-xs leading-5 text-slate-600">{G.legal.roles}</p>
        <p className="mt-2 inline-flex items-start gap-2 text-xs leading-5 text-slate-600">
          <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#005B96]" />
          {G.legal.notDevice}
        </p>
        <p className="mt-2 text-[11px] leading-5 text-slate-500">{G.legal.disclaimer}</p>
        <p className="mt-3 text-sm">
          <a href="/mediktor/pacient" className="font-medium text-[#005B96] underline">
            Tisk poučení pro pacienty (čekárna / tablet)
          </a>
        </p>
      </section>

      {variant === "full" ? (
        <div className="flex flex-wrap gap-2">
          <Button asChild className="h-11 rounded-full bg-[#22a05a] hover:bg-[#1b874b]">
            <Link href={`${MEDIKTOR.routes.download}?install=1`}>
              <Download className="mr-2 h-4 w-4" />
              Stáhnout aplikaci
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-11 rounded-full">
            <Link href={`${MEDIKTOR.routes.app}?tab=zapis`}>
              <Mic className="mr-2 h-4 w-4" />
              Otevřít MeDiktor
            </Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function GuideCard({
  icon: Icon,
  title,
  items,
}: {
  icon: typeof Download;
  title: string;
  items: readonly string[];
}) {
  return (
    <section className="rounded-2xl border border-[#cfe1f3] bg-white p-5">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-[#005B96]" />
        <h3 className="font-display text-base font-bold text-[#021d33]">{title}</h3>
      </div>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-6 text-slate-600">
        {items.map((item) => (
          <li key={item.slice(0, 48)}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
