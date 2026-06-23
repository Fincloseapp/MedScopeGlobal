import type { LocaleCode } from "@/lib/i18n/config";
import { getDictionary, t } from "@/lib/i18n/get-dictionary";

export async function professionLabel(
  locale: LocaleCode,
  profession: string
) {
  const dict = await getDictionary(locale);
  return t(dict, `verification.profession.${profession}`, profession);
}

export async function verificationStatusLabel(
  locale: LocaleCode,
  status: string
) {
  const dict = await getDictionary(locale);
  const key = `verification.status.${
    status === "ai_review" ? "aiReview" : status
  }`;
  return t(dict, key, status);
}
