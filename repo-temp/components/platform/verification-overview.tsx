import Link from "next/link";
import { Bot, FileCheck, Upload, UserPlus } from "lucide-react";
import { VERIFICATION_STEPS } from "@/lib/config/platform-spec";
import { Button } from "@/components/ui/button";
import { getDictionary, t } from "@/lib/i18n/get-dictionary";
import type { LocaleCode } from "@/lib/i18n/config";

const STEP_ICONS = [UserPlus, Upload, Bot, FileCheck];

export async function VerificationOverview({ locale }: { locale: LocaleCode }) {
  const dict = await getDictionary(locale);

  return (
    <div className="space-y-8">
      <ol className="grid gap-4 md:grid-cols-2">
        {VERIFICATION_STEPS.map((step, i) => {
          const Icon = STEP_ICONS[i] ?? FileCheck;
          return (
            <li
              key={step.titleKey}
              className="flex gap-4 rounded-xl border bg-card p-5 shadow-sm"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#005B96] text-sm font-bold text-white">
                {i + 1}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-[#005B96]" aria-hidden />
                  <h3 className="font-semibold text-medical-navy">
                    {t(dict, step.titleKey)}
                  </h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t(dict, step.bodyKey)}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
      <div className="flex flex-wrap gap-3">
        <Button asChild className="bg-[#005B96] hover:bg-[#004a7a]">
          <Link href="/signup">{t(dict, "nav.signup", "Registrace")}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/account">{t(dict, "verification.step2Title")}</Link>
        </Button>
      </div>
    </div>
  );
}
