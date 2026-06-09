import { v23ImageForModule } from "@/lib/v23/images";
import type { V23NewsletterSection } from "@/lib/v23/newsletter/types";

const SECTION_IMAGE_KEY: Record<string, keyof typeof import("@/lib/v21/images").V21_MEDICAL_IMAGES> = {
  studie: "study",
  clanky: "hero",
  legislativa: "legislation",
  "digital-health": "digitalHealth",
  leky: "drug",
  univerzity: "university",
  doporucujeme: "medicina",
};

export function sectionImageUrl(sectionId: string, seed: string): string {
  const key = SECTION_IMAGE_KEY[sectionId] ?? "hero";
  return v23ImageForModule(key, seed);
}

export function heroNewsletterImage(seed: string): string {
  return v23ImageForModule("hero", `nl-hero-${seed}`);
}

export function attachSectionImages(sections: Omit<V23NewsletterSection, "imageUrl" | "imageAlt">[]): V23NewsletterSection[] {
  return sections.map((s) => ({
    ...s,
    imageUrl: sectionImageUrl(s.id, s.id),
    imageAlt: `${s.title} — MedScopeGlobal newsletter`,
  }));
}
