import { MEDICAL_CATEGORIES } from "@/lib/config/categories-seed";
import { CONTENT_TYPE_SPECS } from "@/lib/config/content-types";
import { getDictionary, t } from "@/lib/i18n/get-dictionary";
import { tryCreateServiceRoleClient } from "@/lib/supabase/service";

const LEGACY_SLUGS = new Set(["technologie", "lifestyle", "zpravy", "news", "tech"]);

let seedPromise: Promise<void> | null = null;

/** Ensures medical specialty categories exist (replaces legacy demo categories in nav). */
export async function ensureMedicalCategories(): Promise<void> {
  if (seedPromise) return seedPromise;

  seedPromise = (async () => {
    const admin = tryCreateServiceRoleClient();
    if (!admin) return;
    const { data: existing } = await admin.from("categories").select("slug");

    const slugs = new Set((existing ?? []).map((c) => c.slug));
    const hasMedical = MEDICAL_CATEGORIES.some((m) => slugs.has(m.slug));
    const onlyLegacy =
      slugs.size > 0 &&
      slugs.size <= 6 &&
      [...slugs].every((s) => LEGACY_SLUGS.has(s) || !MEDICAL_CATEGORIES.some((m) => m.slug === s));

    if (hasMedical && !onlyLegacy) return;

    const rows = MEDICAL_CATEGORIES.map((c) => ({
      name: c.nameCs,
      slug: c.slug,
    }));

    const { error } = await admin.from("categories").upsert(rows, {
      onConflict: "slug",
    });

    if (error) {
      console.error("ensureMedicalCategories", error);
    }
  })();

  return seedPromise;
}

export async function ensureContentTypes(): Promise<void> {
  const admin = tryCreateServiceRoleClient();
  if (!admin) return;
  const { error } = await admin.from("rubrics").select("slug").limit(1);
  if (error?.code === "PGRST205") return;

  const dictEn = await getDictionary("en");
  const rows = CONTENT_TYPE_SPECS.map((r) => ({
    slug: r.slug,
    name: t(dictEn, r.nameKey),
  }));

  await admin.from("rubrics").upsert(rows, { onConflict: "slug" });
}

/** @deprecated */
export const ensureRubrics = ensureContentTypes;
