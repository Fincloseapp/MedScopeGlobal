import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDocumentation } from "@/lib/queries/v4c/documentation";

const FALLBACK: Record<string, string> = {
  v4a: "V4a: Security, legal, SEO, UX, Stripe.",
  v4b: "V4b: B2B, inzerce, kariéra, kongresy, AI reklamy.",
  v4c: "V4c: Studie, léky, legislativa, digital health, novinky, newsletter, homepage automation.",
  v4d: "V4d: Odborné AI texty (/odborne), univerzity, filtrace jazyků a oborů, kvalita, kategorizace, cron medical-ai-fetch.",
  "ai-medical":
    "AI Medical Intelligence: /ai-medical — 7 asistentů, Supabase search, shrnutí, doporučení, ai_medical_logs.",
};

type Props = { params: Promise<{ version: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { version } = await params;
  return { title: `Dokumentace ${version}` };
}

export default async function DokumentaceVersionPage({ params }: Props) {
  const { version } = await params;
  if (!["v4a", "v4b", "v4c", "v4d", "ai-medical"].includes(version)) notFound();

  const doc = await getDocumentation(version);
  const content = doc?.content ?? FALLBACK[version] ?? "";

  return (
    <div className="bg-[#fafcff] mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <Link href="/dokumentace" className="text-sm text-[#005B96]">
        ← Dokumentace
      </Link>
      <h1 className="mt-4 font-display text-3xl font-bold text-[#021d33] uppercase">{version}</h1>
      <div className="mt-6 prose prose-slate max-w-none whitespace-pre-wrap text-sm">{content}</div>
    </div>
  );
}
