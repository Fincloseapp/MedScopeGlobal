import { getDictionary, t } from "@/lib/i18n/get-dictionary";
import type { LocaleCode } from "@/lib/i18n/config";
import type { ContentTypeSpec } from "@/lib/config/content-types";
import type { MedicalSectionSpec } from "@/lib/config/medical-sections";

export async function sectionTitle(
  locale: LocaleCode,
  section: MedicalSectionSpec
) {
  const dict = await getDictionary(locale);
  return t(dict, section.nameKey);
}

export async function sectionDescription(
  locale: LocaleCode,
  section: MedicalSectionSpec
) {
  const dict = await getDictionary(locale);
  return t(dict, section.descriptionKey);
}

export async function contentTypeTitle(
  locale: LocaleCode,
  type: ContentTypeSpec
) {
  const dict = await getDictionary(locale);
  return t(dict, type.nameKey);
}
