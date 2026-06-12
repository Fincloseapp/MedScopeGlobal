import { V21_MEDICAL_IMAGES } from "@/lib/v21/images";

/** Obrázky pro veřejnostní témata — fallback bez broken SVG. */
const TOPIC_IMAGES: Record<string, string> = {
  "pruvodce-nemocemi": V21_MEDICAL_IMAGES.study,
  symptomy: V21_MEDICAL_IMAGES.study,
  prevence: V21_MEDICAL_IMAGES.hero,
  "zivotni-styl": V21_MEDICAL_IMAGES.medicina,
  vyziva: V21_MEDICAL_IMAGES.study,
  spanek: V21_MEDICAL_IMAGES.digitalHealth,
  stres: V21_MEDICAL_IMAGES.digitalHealth,
  ergonomie: V21_MEDICAL_IMAGES.medicina,
  rozhovory: V21_MEDICAL_IMAGES.university,
  "zivotni-styl-backend": V21_MEDICAL_IMAGES.medicina,
  nemoci: V21_MEDICAL_IMAGES.study,
  prevence-backend: V21_MEDICAL_IMAGES.hero,
  rozhovory-backend: V21_MEDICAL_IMAGES.university,
};

export function getPublicTopicImage(slug: string): string | null {
  return TOPIC_IMAGES[slug] ?? null;
}

export const VEREJNOST_FALLBACK_COVER =
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80&auto=format&fit=crop";
