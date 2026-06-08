/** Profesionální medicínské obrázky (Unsplash WebP) */
const BASE = "https://images.unsplash.com";

export const V21_MEDICAL_IMAGES = {
  study: `${BASE}/photo-1576091160399-112ba8d25d1d?w=800&h=450&fit=crop&q=80&auto=format&fm=webp`,
  drug: `${BASE}/photo-1584308664744-24d5c474f2ae?w=800&h=450&fit=crop&q=80&auto=format&fm=webp`,
  legislation: `${BASE}/photo-1589829545855-d10d557cf95f?w=800&h=450&fit=crop&q=80&auto=format&fm=webp`,
  digitalHealth: `${BASE}/photo-1573164713714-d95e436ab8d6?w=800&h=450&fit=crop&q=80&auto=format&fm=webp`,
  university: `${BASE}/photo-1523050854058-8df90110c9f1?w=800&h=450&fit=crop&q=80&auto=format&fm=webp`,
  congress: `${BASE}/photo-1540575467063-178a50c2df87?w=800&h=450&fit=crop&q=80&auto=format&fm=webp`,
  medicina: `${BASE}/photo-1532012197268-da39f06e7038?w=800&h=450&fit=crop&q=80&auto=format&fm=webp`,
  anatomy: `${BASE}/photo-1530026408846-9c0d0b0b0b0b?w=800&h=450&fit=crop&q=80&auto=format&fm=webp`,
  hero: `${BASE}/photo-1559757148-5c350d0d3c56?w=1200&h=600&fit=crop&q=80&auto=format&fm=webp`,
} as const;

export function v21ImageForModule(
  module: keyof typeof V21_MEDICAL_IMAGES,
  seed?: string
): string {
  const img = V21_MEDICAL_IMAGES[module];
  if (!seed) return img;
  return `${img}&sig=${Math.abs(seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 999)}`;
}
