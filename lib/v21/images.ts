/** Magazine covers — first-party assets only (no Unsplash brain / doctor-phone stock). */
export const V21_MEDICAL_IMAGES = {
  study: "/assets/covers/science.webp",
  drug: "/assets/covers/science.webp",
  legislation: "/assets/covers/research-2.webp",
  digitalHealth: "/assets/medscopeglobal-digital-health-specialist.png",
  university: "/assets/covers/science.webp",
  congress: "/assets/covers/movement.webp",
  medicina: "/assets/covers/clinical-3.webp",
  anatomy: "/assets/covers/clinical-2.webp",
  digitalHealthBrand: "/assets/medscopeglobal-digital-health-specialist.png",
  hero: "/assets/covers/produce.webp",
} as const;

export function v21ImageForModule(
  module: keyof typeof V21_MEDICAL_IMAGES,
  seed?: string
): string {
  const img = V21_MEDICAL_IMAGES[module];
  if (!seed) return img;
  const sep = img.includes("?") ? "&" : "?";
  return `${img}${sep}sig=${Math.abs(seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 999)}`;
}
