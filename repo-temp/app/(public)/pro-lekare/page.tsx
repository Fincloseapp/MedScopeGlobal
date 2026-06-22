import type { Metadata } from "next";
import Link from "next/link";
import { V27AudienceHub } from "@/components/v27/audience-hub-section";
import { buildV20PageMetadata } from "@/lib/v20/seo";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  return buildV20PageMetadata({
    title: "Pro lékaře | MedScopeGlobal",
    description:
      "Guidelines, souhrny studií, diagnostické algoritmy, CME body a Research Hub pro lékaře v praxi.",
    path: "/pro-lekare",
  });
}

const SECTIONS = [
  { href: "/odborna", label: "Odborná sekce (ČLK)", desc: "Ověřený obsah pro registrované lékaře" },
  { href: "/studie", label: "Studie a evidence", desc: "RCT, meta-analýzy s českým shrnutím" },
  { href: "/odborne/briefy", label: "Odborné briefy", desc: "Strukturované medicínské briefy" },
  { href: "/leky", label: "Léky a SÚKL", desc: "Schválené přípravky, EMA, interakce" },
  { href: "/legislativa", label: "Legislativa", desc: "Zdravotnická legislativa v ČR a EU" },
  { href: "/ai-medical/doctor", label: "Klinický AI", desc: "AI asistent pro lékaře v praxi" },
  { href: "/studie/ai", label: "Research Hub", desc: "AI analýza studií a PubMed" },
  { href: "/predplatne", label: "Předplatné lékaře", desc: "490 Kč/měs — plný přístup" },
];

export default function ProLekarePage() {
  return (
    <div className="min-h-screen bg-[#f4f8fc]">
      <V27AudienceHub audience="physician" variant="hero" />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            Odborný obsah
          </p>
          <h2 className="font-display text-2xl font-bold text-[#021d33]">Sekce pro praxi</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SECTIONS.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              prefetch
              className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-[#005B96]/40 hover:shadow-sm"
            >
              <p className="font-semibold text-[#021d33]">{s.label}</p>
              <p className="mt-1 text-xs text-slate-500">{s.desc}</p>
            </Link>
          ))}
        </div>

        <section className="mt-12 rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <h3 className="font-semibold text-amber-950">Ověření ČLK</h3>
          <p className="mt-2 text-sm text-amber-900">
            Přístup k odborné sekci vyžaduje ověření registrace u České lékařské komory. Ověření
            spravuje administrátor v{" "}
            <Link href="/admin/clk-verifications" className="underline">
              admin panelu
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
