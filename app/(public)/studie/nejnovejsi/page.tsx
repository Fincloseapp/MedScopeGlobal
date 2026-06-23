import type { Metadata } from "next";
import { V20StudyCard } from "@/components/v20/study-card";
import { getV20StudiesList } from "@/lib/v20/studies/query";
import { buildV20PageMetadata } from "@/lib/v20/seo";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  return buildV20PageMetadata({
    title: "Nejnovější studie",
    description: "Chronologický přehled nejnovějších medicínských studií v češtině.",
    path: "/studie/nejnovejsi",
  });
}

export default async function StudieNejnovejsiPage() {
  const studies = await getV20StudiesList(24);
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-[#021d33]">Nejnovější studie</h1>
      <p className="mt-2 text-slate-600">Seřazeno od nejnovějších — pouze český profesionální obsah.</p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {studies.map((s) => (
          <V20StudyCard key={s.id} study={s} />
        ))}
      </div>
    </div>
  );
}
