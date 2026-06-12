import { notFound } from "next/navigation";

export const revalidate = 120;
import { PublicModuleImage } from "@/components/v25/public-module-image";
import { V22QuizRunner } from "@/components/v22/quiz-runner";
import { resolveStudyGameImageUrl } from "@/lib/v22/game-images";
import { getV24Quiz } from "@/lib/v24/quizzes";

export default function KvizDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  return <KvizDetail params={params} />;
}

async function KvizDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const quiz = getV24Quiz(slug);
  if (!quiz) notFound();

  const imageUrl = await resolveStudyGameImageUrl(slug);

  const game = {
    slug: quiz.slug,
    title: quiz.title,
    topic: quiz.type,
    description: quiz.title,
    updatedAt: new Date().toISOString().slice(0, 10),
    questions: quiz.questions.map((q, i) => ({
      id: `${quiz.slug}-${i}`,
      prompt: q.prompt,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
    })),
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-slate-100">
        <PublicModuleImage src={imageUrl} alt={quiz.title} sizes="768px" priority />
      </div>
      <h1 className="mt-6 font-display text-2xl font-semibold text-[#021d33]">{quiz.title}</h1>
      <div className="mt-6">
        <V22QuizRunner game={game} />
      </div>
    </div>
  );
}
