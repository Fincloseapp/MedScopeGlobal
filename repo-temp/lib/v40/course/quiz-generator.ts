import { academyGenerateJson } from "@/lib/academy/ai/workers/shared";
import { createQuizWithQuestions } from "@/lib/academy/db";

export type GeneratedQuiz = { quiz_id: string; question_count: number };

type QuizOutline = {
  title: string;
  questions: Array<{
    question_text: string;
    options: Array<{ label: string; value: string }>;
    correct_index: number;
    explanation: string;
  }>;
};

function buildStubQuiz(lessonTitle: string): QuizOutline {
  return {
    title: `Kvíz: ${lessonTitle}`,
    questions: [
      {
        question_text: `Co je hlavním tématem lekce „${lessonTitle}"?`,
        options: [
          { label: "Diagnostika", value: "a" },
          { label: "Léčba", value: "b" },
          { label: "Prevence", value: "c" },
          { label: "Vše výše", value: "d" },
        ],
        correct_index: 3,
        explanation: "Lekce pokrývá komplexní pohled na téma.",
      },
      {
        question_text: "Který postup je klinicky nejdůležitější?",
        options: [
          { label: "Anamnéza", value: "a" },
          { label: "Laboratorní vyšetření", value: "b" },
          { label: "Zobrazovací metoda", value: "c" },
          { label: "Závisí na kontextu", value: "d" },
        ],
        correct_index: 3,
        explanation: "Klinické rozhodování závisí na kontextu pacienta.",
      },
    ],
  };
}

export async function generateQuizForLesson(input: {
  courseId: string;
  lessonId: string;
  lessonTitle: string;
  lessonContent: string;
}): Promise<GeneratedQuiz | null> {
  const { data, fallback } = await academyGenerateJson<QuizOutline>({
    system: "Jsi expert na medicínské kvízy. Odpovídej pouze validním JSON.",
    user: `Vytvoř kvíz (3-5 otázek) pro lekci "${input.lessonTitle}".

Obsah:
${input.lessonContent.slice(0, 1500)}

JSON:
{
  "title": "...",
  "questions": [{"question_text": "...", "options": [{"label":"A","value":"a"}], "correct_index": 0, "explanation": "..."}]
}`,
    maxTokens: 2000,
  });

  const outline = fallback || !data?.questions?.length ? buildStubQuiz(input.lessonTitle) : data;

  try {
    const quiz = await createQuizWithQuestions({
      course_id: input.courseId,
      lesson_id: input.lessonId,
      title: outline.title,
      passing_score: 70,
      status: "draft",
      questions: outline.questions.map((q, i) => {
        const options = q.options.map((o, j) => ({
          label: o.label,
          value: o.value ?? String.fromCharCode(97 + j),
        }));
        const correct = options[q.correct_index]?.value ?? options[0]?.value ?? "a";
        return {
          question_text: q.question_text,
          question_type: "multiple_choice" as const,
          options,
          correct_answer: { value: correct },
          sort_order: i + 1,
          explanation: q.explanation ?? null,
        };
      }),
    });
    return { quiz_id: quiz.id, question_count: outline.questions.length };
  } catch {
    return null;
  }
}
