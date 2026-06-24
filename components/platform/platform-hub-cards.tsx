import Link from "next/link";
import { BookOpen, Layers, ShieldCheck } from "lucide-react";
import { getDictionary, t } from "@/lib/i18n/get-dictionary";
import type { LocaleCode } from "@/lib/i18n/config";

const CARDS = [
  {
    href: "/sections",
    icon: BookOpen,
    titleKey: "nav.sections",
    descriptionKey: "sections.title",
  },
  {
    href: "/access-levels",
    icon: Layers,
    titleKey: "nav.access",
    descriptionKey: "access.publicDesc",
  },
  {
    href: "/access-levels#overeni",
    icon: ShieldCheck,
    titleKey: "verification.step1Title",
    descriptionKey: "verification.step2Body",
  },
] as const;

export async function PlatformHubCards({ locale }: { locale: LocaleCode }) {
  const dict = await getDictionary(locale);

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {CARDS.map((c) => {
        const Icon = c.icon;
        return (
          <Link
            key={c.href}
            href={c.href}
            className="group rounded-2xl border bg-white p-5 shadow-sm transition hover:border-[#005B96]/40 hover:shadow-md"
          >
            <Icon
              className="h-8 w-8 text-[#005B96] transition group-hover:scale-105"
              aria-hidden
            />
            <h3 className="mt-3 font-display text-lg font-semibold text-medical-navy">
              {t(dict, c.titleKey)}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
              {t(dict, c.descriptionKey)}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
