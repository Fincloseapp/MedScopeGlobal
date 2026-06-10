import { notFound } from "next/navigation";
import { getV24Quiz } from "@/lib/v24/quizzes";
import { V22QuizRunner } from "@/components/v22/quiz-runner";

export default function KvizDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  return <KvizDetail params={params} />;
}

async function KvizDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const quiz = getV24Quiz(slug);
  if (!quiz) notFound();

  const game = {
    slug: quiz.slug,
    title: quiz.title,
    topic: quiz.type,
    description: quiz.title,
    imageUrl: "/assets/logo/Logo_Transparent.png",
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
      <h1 className="font-display text-2xl font-semibold text-[#021d33]">{quiz.title}</h1>
      <div className="mt-6">
        <V22QuizRunner game={game} />
      </div>
    </div>
  );
}
