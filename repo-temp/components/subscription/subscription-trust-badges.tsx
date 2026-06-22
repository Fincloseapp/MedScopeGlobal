import Link from "next/link";
import { CreditCard, Lock, ShieldCheck } from "lucide-react";

const badges = [
  {
    icon: CreditCard,
    title: "Platby přes Stripe",
    description: "Karta, Apple Pay a Google Pay. Bezpečná PCI-kompatibilní platba.",
  },
  {
    icon: ShieldCheck,
    title: "GDPR a ochrana dat",
    description: "Zpracování v souladu s EU nařízením. Vaše data neprodáváme.",
    href: "/privacy",
  },
  {
    icon: Lock,
    title: "Zrušení kdykoli",
    description: "Předplatné spravujete v účtu. Po zkušební době bez skrytých poplatků.",
  },
] as const;

export function SubscriptionTrustBadges() {
  return (
    <section aria-label="Důvěryhodnost plateb" className="mt-16">
      <h2 className="text-center font-display text-2xl font-semibold text-[#021d33]">
        Bezpečná platba a ochrana soukromí
      </h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {badges.map((badge) => {
          const Icon = badge.icon;
          const inner = (
            <>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#005B96]/10 text-[#005B96]">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="font-semibold text-[#021d33]">{badge.title}</p>
                <p className="mt-1 text-sm text-slate-600">{badge.description}</p>
              </div>
            </>
          );

          if ("href" in badge && badge.href) {
            return (
              <Link
                key={badge.title}
                href={badge.href}
                className="flex gap-4 rounded-2xl border border-[#005B96]/15 bg-white p-5 shadow-sm transition hover:border-[#005B96]/30 hover:shadow-md"
              >
                {inner}
              </Link>
            );
          }

          return (
            <div
              key={badge.title}
              className="flex gap-4 rounded-2xl border border-[#005B96]/15 bg-white p-5 shadow-sm"
            >
              {inner}
            </div>
          );
        })}
      </div>
      <p className="mt-6 text-center text-xs text-slate-500">
        Powered by{" "}
        <span className="font-semibold text-[#635bff]">Stripe</span>
        {" · "}
        <Link href="/privacy" className="text-[#005B96] underline">
          Zásady ochrany osobních údajů
        </Link>
        {" · "}
        <Link href="/terms" className="text-[#005B96] underline">
          Obchodní podmínky
        </Link>
      </p>
    </section>
  );
}
