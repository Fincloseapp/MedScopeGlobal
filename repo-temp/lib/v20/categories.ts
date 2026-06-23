/**
 * v20 — NZIP-aligned category hub (Czech descriptions + icons).
 */
import {
  Activity,
  Brain,
  Eye,
  Heart,
  Microscope,
  Pill,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";

export type V20CategoryDef = {
  slug: string;
  nameCs: string;
  descriptionCs: string;
  nzipTopic?: string;
  icon: LucideIcon;
  order: number;
};

export const V20_NZIP_CATEGORIES: V20CategoryDef[] = [
  {
    slug: "revmatologie",
    nameCs: "Revmatologie",
    descriptionCs: "Zánětlivá a autoimunitní onemocnění kloubů a pojivové tkáně.",
    nzipTopic: "revmatologie",
    icon: Activity,
    order: 1,
  },
  {
    slug: "kardiologie",
    nameCs: "Kardiologie",
    descriptionCs: "Prevence, diagnostika a léčba kardiovaskulárních onemocnění.",
    nzipTopic: "kardiologie",
    icon: Heart,
    order: 2,
  },
  {
    slug: "neurologie",
    nameCs: "Neurologie",
    descriptionCs: "Onemocnění nervového systému — od migrény po neurodegenerace.",
    nzipTopic: "neurologie",
    icon: Brain,
    order: 3,
  },
  {
    slug: "oftalmologie",
    nameCs: "Oftalmologie",
    descriptionCs: "Zrak, oční onemocnění a moderní diagnostika zrakového aparátu.",
    nzipTopic: "oci",
    icon: Eye,
    order: 4,
  },
  {
    slug: "farmakologie",
    nameCs: "Farmakologie",
    descriptionCs: "Léčiva, interakce, bezpečnost a evidence-based preskripce.",
    nzipTopic: "leky",
    icon: Pill,
    order: 5,
  },
  {
    slug: "interni-medicina",
    nameCs: "Interní medicína",
    descriptionCs: "Komplexní péče o dospělé — diagnostika, terapie, prevence.",
    nzipTopic: "interni-medicina",
    icon: Stethoscope,
    order: 6,
  },
  {
    slug: "vyzkum",
    nameCs: "Výzkum a studie",
    descriptionCs: "Klinické studie, publikace a přenos poznatků do praxe.",
    nzipTopic: "vyzkum",
    icon: Microscope,
    order: 7,
  },
];

export function getV20CategoryBySlug(slug: string): V20CategoryDef | undefined {
  return V20_NZIP_CATEGORIES.find((c) => c.slug === slug);
}

export type V20CategoryWithCount = {
  slug: string;
  name: string;
  description: string;
  count: number;
  icon: LucideIcon;
};

export function buildV20CategoryList(
  counts: Record<string, number>,
  dbNames: Record<string, string>
): V20CategoryWithCount[] {
  return V20_NZIP_CATEGORIES.filter((def) => (counts[def.slug] ?? 0) > 0)
    .sort((a, b) => a.order - b.order)
    .map((def) => ({
      slug: def.slug,
      name: dbNames[def.slug] ?? def.nameCs,
      description: def.descriptionCs,
      count: counts[def.slug] ?? 0,
      icon: def.icon,
    }));
}
