import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicModuleImage } from "@/components/v25/public-module-image";
import { V22QuizRunner } from "@/components/v22/quiz-runner";
import { resolveStudyGameImageUrl } from "@/lib/v22/game-images";
import { getStudyGameBySlug } from "@/lib/v22/games";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const game = getStudyGameBySlug(slug);
  return { title: game?.title ?? "Studijní hra" };
}

export default async function MedicinaHraDetailPage({ params }: Props) {
  const { slug } = await params;
  const game = getStudyGameBySlug(slug);
  if (!game) notFound();

  const imageUrl = await resolveStudyGameImageUrl(slug);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link href="/medicina/hry" className="text-sm font-medium text-primary hover:underline">
        ← Všechny hry
      </Link>
      <div className="relative mt-4 aspect-[16/9] overflow-hidden rounded-2xl bg-slate-100">
        <PublicModuleImage src={imageUrl} alt={game.title} sizes="768px" priority />
      </div>
      <header className="mt-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">{game.topic}</p>
        <h1 className="mt-1 font-display text-3xl font-bold text-[#021d33]">{game.title}</h1>
        <p className="mt-2 text-slate-600">{game.description}</p>
      </header>
      <div className="mt-8">
        <V22QuizRunner game={game} />
      </div>
    </div>
  );
}
