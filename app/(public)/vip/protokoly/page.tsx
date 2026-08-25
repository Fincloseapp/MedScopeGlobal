import type { Metadata } from "next";
import Link from "next/link";
import { Crown, ArrowRight, Shield } from "lucide-react";
import { LONGEVITY_PROTOCOLS, localizedText } from "@/lib/ecosystem/longevity-protocols";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { MEDICAL_DISCLAIMER } from "@/lib/ecosystem/locales";
import { VIP_PRICING } from "@/lib/ecosystem/monetization";

export const metadata: Metadata = buildPageMetadata({
  title: "VIP Longevity Protokoly | MedScopeGlobal",
  description:
    "10 vědecky podložených protokolů pro dlouhověkost: spánek, metabolismus, suplementy, biohacking a více. VIP předplatné.",
  path: "/vip/protokoly",
});

export default function VipProtocolsPage() {
  const pricing = VIP_PRICING.cs;
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-semibold text-amber-800">
          <Crown className="h-4 w-4" /> VIP obsah
        </div>
        <h1 className="mt-4 font-display text-3xl font-bold text-[#021d33] sm:text-4xl">
          Longevity Protokoly
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-slate-600">
          10 vědecky podložených protokolů pro optimalizaci spánku, metabolismu, imunity a celkové longevity.
          Každý protokol obsahuje denní plán, suplementy, lab testy a integraci s MediFlow.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {LONGEVITY_PROTOCOLS.map((protocol) => (
          <Link
            key={protocol.slug}
            href={`/vip/protokoly/${protocol.slug}`}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-amber-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                #{protocol.number.toString().padStart(2, "0")}
              </span>
              {protocol.vipOnly ? (
                <Crown className="h-4 w-4 text-amber-500" aria-label="VIP" />
              ) : (
                <span className="text-xs font-medium text-emerald-600">Zdarma</span>
              )}
            </div>
            <h2 className="mt-3 font-display text-lg font-semibold text-[#021d33] group-hover:text-[#005B96]">
              {localizedText(protocol.title, "cs")}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {localizedText(protocol.subtitle, "cs")}
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#005B96] group-hover:underline">
              Protokol <ArrowRight className="h-3 w-3" />
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-10 rounded-xl border border-amber-200 bg-amber-50 p-5 text-center">
        <p className="font-semibold text-amber-900">VIP předplatné od {pricing.label}</p>
        <p className="mt-1 text-sm text-amber-800">
          Přístup ke všem protokolům, export PDF, MediFlow sync, bez reklam.
        </p>
        <Link
          href="/predplatne"
          className="mt-4 inline-block rounded-full bg-amber-500 px-6 py-2.5 text-sm font-semibold text-black hover:bg-amber-400"
        >
          Aktivovat VIP
        </Link>
      </div>

      <p className="mt-8 flex items-start gap-2 text-xs text-slate-500">
        <Shield className="mt-0.5 h-4 w-4 shrink-0" />
        {MEDICAL_DISCLAIMER.cs}
      </p>
    </div>
  );
}
