import type { Metadata } from "next";
import { PrepValueProposition } from "@/components/academy/prep-value-proposition";
import { buildV271HubMetadata } from "@/lib/v271/routes";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  return buildV271HubMetadata("studenti", {
    slug: "chci-studovat",
    title: "Chci studovat medicínu",
    description:
      "Příprava na přijímačky LF — videokurzy, AI lektor, kvízy a ≈30 % obsahu zdarma. MedScope Academy pro uchazeče o medicínu.",
    links: [],
  });
}

export default function ChciStudovatPage() {
  return <PrepValueProposition />;
}
