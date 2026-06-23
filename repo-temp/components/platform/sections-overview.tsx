import Link from "next/link";
import { MEDICAL_SECTIONS } from "@/lib/config/medical-sections";
import { getDictionary, t } from "@/lib/i18n/get-dictionary";
import type { LocaleCode } from "@/lib/i18n/config";

export async function SectionsOverview({ locale }: { locale: LocaleCode }) {
  const dict = await getDictionary(locale);

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {MEDICAL_SECTIONS.map((s) => (
        <li key={s.slug}>
          <Link
            href={`/sections/${s.slug}`}
            className="flex h-full flex-col rounded-xl border bg-card p-5 shadow-sm transition hover:border-[#005B96]/40 hover:shadow-md"
          >
            <h3 className="font-display text-base font-semibold text-[#005B96]">
              {t(dict, s.nameKey)}
            </h3>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">
              {t(dict, s.descriptionKey)}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
