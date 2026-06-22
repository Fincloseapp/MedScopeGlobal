import { CreditCard, Lock, ShieldCheck, Stethoscope } from "lucide-react";

const BADGES = [
  {
    icon: ShieldCheck,
    title: "GDPR a ochrana dat",
    description: "Zpracování údajů dle nařízení EU. Podrobnosti v zásadách ochrany soukromí.",
  },
  {
    icon: CreditCard,
    title: "Bezpečné platby Stripe",
    description: "Platební údaje zpracovává Stripe — neukládáme čísla karet.",
  },
  {
    icon: Lock,
    title: "Anti-spam a audit log",
    description: "Kontaktní formuláře mají validaci, ochranu proti spamu a evidenci dotazů.",
  },
  {
    icon: Stethoscope,
    title: "Vzdělávací obsah",
    description: "Informace nenahrazují lékařskou péči. Odborný obsah je kurátorsky připravován.",
  },
] as const;

export function PublicTrustBadges() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {BADGES.map((badge) => (
        <div
          key={badge.title}
          className="flex items-start gap-3 rounded-2xl border border-[#dbeaf7] bg-white p-4"
        >
          <badge.icon className="mt-0.5 h-5 w-5 shrink-0 text-[#005B96]" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-[#021d33]">{badge.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{badge.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
