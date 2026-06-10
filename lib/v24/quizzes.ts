import { quizPath, writeV24Json } from "@/lib/v24/data-store";
import { getV24SampleQuizzes, type V24Quiz } from "@/lib/v24/quizzes-data";
import { createServiceRoleClient } from "@/lib/supabase/service";

export type { V24Quiz, V24QuizQuestion } from "@/lib/v24/quizzes-data";
export { listV24Quizzes, getV24Quiz } from "@/lib/v24/quizzes-data";

export async function persistV24Quiz(quiz: V24Quiz) {
  writeV24Json(quizPath(quiz.slug), quiz);
  try {
    const admin = createServiceRoleClient();
    await admin.from("v24_quizzes").upsert(
      {
        slug: quiz.slug,
        title: quiz.title,
        type: quiz.type,
        locale: quiz.locale,
        payload: quiz,
      },
      { onConflict: "slug" }
    );
  } catch {
    /* optional db */
  }
  return quiz;
}

export async function seedV24Quizzes() {
  for (const q of getV24SampleQuizzes()) await persistV24Quiz(q);
  return getV24SampleQuizzes().length;
}
