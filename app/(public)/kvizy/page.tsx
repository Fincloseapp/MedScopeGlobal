import Link from "next/link";
import type { Metadata } from "next";
import { PublicModuleImage } from "@/components/v25/public-module-image";
import { resolveStudyGameImageUrl } from "@/lib/v22/game-images";
import { listV24Quizzes } from "@/lib/v24/quizzes";
import { buildV20PageMetadata } from "@/lib/v20/seo";

export const revalidate = 120;

export const metadata: Metadata = buildV20PageMetadata({
  title: "Kvízy a studijní hry",
  description: "Medicínské kvízy — farmakologie, anatomie, klinické scénáře v češtině.",
  path: "/kvizy",
});

export default async function KvizyPage() {
  const quizzes = await Promise.all(
    listV24Quizzes().map(async (q) => ({
      ...q,
      imageUrl: await resolveStudyGameImageUrl(q.slug),
    }))
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-3xl font-semibold text-[#021d33]">Kvízy a studijní hry</h1>
      <p className="mt-2 text-slate-600">Příprava na LF a klinickou praxi.</p>
      <ul className="mt-8 space-y-4">
        {quizzes.map((q) => (
          <li key={q.slug}>
            <Link
              href={`/kvizy/${q.slug}`}
              className="group block overflow-hidden rounded-xl border border-slate-200 bg-white hover:border-sky-200"
            >
              <div className="relative aspect-[16/9] bg-slate-100">
                <PublicModuleImage src={q.imageUrl} alt={q.title} sizes="768px" />
              </div>
              <div className="p-5">
                <span className="font-semibold text-[#005B96]">{q.title}</span>
                <span className="mt-1 block text-xs text-slate-500">{q.type}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
