import Link from "next/link";
import { Shield, GraduationCap, Stethoscope } from "lucide-react";
import { ACCESS_LEVEL_SPECS } from "@/lib/config/platform-spec";
import { Button } from "@/components/ui/button";
import { getDictionary, t } from "@/lib/i18n/get-dictionary";
import type { LocaleCode } from "@/lib/i18n/config";

const ICONS = {
  public: Shield,
  student: GraduationCap,
  physician: Stethoscope,
} as const;

export async function AccessLevelsOverview({
  locale,
  compact = false,
}: {
  locale: LocaleCode;
  compact?: boolean;
}) {
  const dict = await getDictionary(locale);

  return (
    <div className={compact ? "grid gap-4 md:grid-cols-3" : "grid gap-6 md:grid-cols-3"}>
      {ACCESS_LEVEL_SPECS.map((level) => {
        const Icon = ICONS[level.id];
        return (
          <article
            key={level.id}
            className="flex flex-col rounded-2xl border bg-card p-6 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#C7E3FF] text-[#005B96]">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="font-display text-lg font-semibold text-[#005B96]">
                {t(dict, level.titleKey)}
              </h3>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {t(dict, level.descriptionKey)}
            </p>
            {!compact && (
              <>
                <ul className="mt-4 flex-1 space-y-1.5 text-sm">
                  {level.includesKeys.map((key) => (
                    <li key={key} className="flex gap-2">
                      <span className="text-[#005B96]">✓</span>
                      <span>{t(dict, key)}</span>
                    </li>
                  ))}
                </ul>
                {level.excludesKeys && level.excludesKeys.length > 0 && (
                  <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                    {level.excludesKeys.map((key) => (
                      <li key={key} className="flex gap-2">
                        <span>✗</span>
                        <span>{t(dict, key)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
            <Button asChild variant="outline" size="sm" className="mt-4 w-full">
              <Link href={`/sections?level=${level.id}`}>
                {t(dict, "nav.sections", "Sekce")} — {t(dict, level.labelKey)}
              </Link>
            </Button>
          </article>
        );
      })}
    </div>
  );
}
