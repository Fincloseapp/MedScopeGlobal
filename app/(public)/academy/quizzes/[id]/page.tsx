import { notFound } from "next/navigation";

import { AcademyPageHeader } from "@/components/academy/page-header";

import { QuizPlayer } from "@/components/academy/quiz-player";

import { getQuizById } from "@/lib/academy/db";



export const dynamic = "force-dynamic";



type Props = { params: Promise<{ id: string }> };



export default async function AcademyQuizDetailPage({ params }: Props) {

  const { id } = await params;

  const quiz = await getQuizById(id, false);

  if (!quiz) notFound();



  return (

    <>

      <AcademyPageHeader eyebrow="Kvíz" title={quiz.title} description={`Minimální skóre: ${quiz.passing_score}%`} />

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">

        <QuizPlayer quizId={quiz.id} questions={quiz.questions} passingScore={quiz.passing_score} />

      </div>

    </>

  );

}

