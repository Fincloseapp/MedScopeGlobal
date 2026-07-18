import { createServiceRoleClient } from "@/lib/supabase/service";
import type {
  QuizAttemptSession,
  QuizAttemptSubmitResult,
  QuizBankQuestion,
  QuizQuestionOption,
  QuizQuestionPublic,
} from "@/types/academy-b2b";
import { issueCmeCertificate } from "@/lib/academy/b2b/certificates";
import { getPhysicianProfile, resolvePhysicianDisplayName } from "@/lib/academy/b2b/verification";

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function normalizeOptions(raw: unknown): QuizQuestionOption[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((opt, index) => {
    if (typeof opt === "string") {
      return { label: opt, value: String(index) };
    }
    const o = opt as { label?: string; value?: unknown };
    return {
      label: o.label ?? String(o.value ?? index),
      value: String(o.value ?? o.label ?? index),
    };
  });
}

function expectedAnswerValue(correct: QuizBankQuestion["correct_answer"]): string {
  if (correct && typeof correct === "object" && "value" in correct) {
    return String((correct as { value: unknown }).value);
  }
  return String(correct ?? "");
}

function toPublicQuestion(
  q: QuizBankQuestion,
  shuffleAnswers: boolean
): QuizQuestionPublic {
  const options = normalizeOptions(q.options);
  return {
    id: q.id,
    question_text: q.question_text,
    question_type: q.question_type,
    options: shuffleAnswers ? shuffleInPlace([...options]) : options,
    sort_order: q.sort_order,
  };
}

async function countAttempts(quizId: string, userId: string): Promise<number> {
  const admin = createServiceRoleClient();
  const { count } = await admin
    .from("quiz_attempts")
    .select("id", { count: "exact", head: true })
    .eq("quiz_id", quizId)
    .eq("user_id", userId);
  return count ?? 0;
}

async function isVideoUnlocked(lessonId: string | null, userId: string): Promise<boolean> {
  if (!lessonId) return true;
  const admin = createServiceRoleClient();
  const { data } = await admin
    .from("lesson_watch_progress")
    .select("completed")
    .eq("lesson_id", lessonId)
    .eq("user_id", userId)
    .maybeSingle();
  return data?.completed === true;
}

export async function startQuizAttempt(
  quizId: string,
  userId: string
): Promise<QuizAttemptSession> {
  const admin = createServiceRoleClient();

  const { data: quiz, error: quizErr } = await admin
    .from("quizzes")
    .select("*")
    .eq("id", quizId)
    .maybeSingle();

  if (quizErr || !quiz) throw new Error("Kvíz nenalezen");

  const unlockRequiresVideo = (quiz as { unlock_requires_video?: boolean })
    .unlock_requires_video !== false;
  const lessonId = (quiz as { lesson_id: string | null }).lesson_id;
  const videoUnlocked = unlockRequiresVideo
    ? await isVideoUnlocked(lessonId, userId)
    : true;

  if (!videoUnlocked) {
    throw new Error("Nejprve dokončete povinné video lekce — kvíz je zamčený.");
  }

  const attemptsCount = await countAttempts(quizId, userId);
  const maxAttempts = (quiz as { max_attempts?: number | null }).max_attempts ?? null;
  if (maxAttempts != null && attemptsCount >= maxAttempts) {
    throw new Error(`Vyčerpán počet pokusů (${maxAttempts}).`);
  }

  const { data: bank, error: bankErr } = await admin
    .from("quiz_questions")
    .select("*")
    .eq("quiz_id", quizId)
    .order("sort_order", { ascending: true });

  if (bankErr) throw new Error(bankErr.message);
  const questions = (bank ?? []) as QuizBankQuestion[];
  if (questions.length === 0) throw new Error("Kvíz nemá otázky");

  const sampleSize =
    (quiz as { question_sample_size?: number | null }).question_sample_size ??
    questions.length;
  const shuffledBank = shuffleInPlace([...questions]);
  const selected = shuffledBank.slice(0, Math.min(sampleSize, questions.length));
  const shuffleAnswers = (quiz as { shuffle_answers?: boolean }).shuffle_answers !== false;

  const publicQuestions = selected.map((q) => toPublicQuestion(q, shuffleAnswers));
  const attemptNumber = attemptsCount + 1;

  // Resolve passing threshold: course override → quiz.passing_score → 80
  let passingThreshold =
    (quiz as { passing_score?: number }).passing_score ?? 80;
  const courseId = (quiz as { course_id: string | null }).course_id;
  if (courseId) {
    const { data: course } = await admin
      .from("courses")
      .select("passing_threshold")
      .eq("id", courseId)
      .maybeSingle();
    if (course?.passing_threshold) {
      passingThreshold = course.passing_threshold as number;
    }
  }
  if (!passingThreshold || passingThreshold < 1) passingThreshold = 80;

  const { data: attempt, error: attemptErr } = await admin
    .from("quiz_attempts")
    .insert({
      quiz_id: quizId,
      user_id: userId,
      attempt_number: attemptNumber,
      question_ids: selected.map((q) => q.id),
      passing_threshold: passingThreshold,
    })
    .select("id")
    .single();

  if (attemptErr || !attempt) throw new Error(attemptErr?.message ?? "Nelze vytvořit pokus");

  return {
    attempt_id: attempt.id,
    quiz_id: quizId,
    attempt_number: attemptNumber,
    attempts_count: attemptNumber,
    max_attempts: maxAttempts,
    passing_threshold: passingThreshold,
    questions: publicQuestions,
    video_unlocked: true,
  };
}

export async function submitQuizAttempt(
  attemptId: string,
  userId: string,
  answers: Array<{ question_id: string; value: string }>
): Promise<QuizAttemptSubmitResult> {
  const admin = createServiceRoleClient();

  const { data: attempt, error } = await admin
    .from("quiz_attempts")
    .select("*")
    .eq("id", attemptId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !attempt) throw new Error("Pokus nenalezen");
  if (attempt.submitted_at) throw new Error("Pokus již byl odeslán");

  const questionIds = (attempt.question_ids ?? []) as string[];
  if (questionIds.length === 0) throw new Error("Pokus nemá otázky");

  const { data: questions } = await admin
    .from("quiz_questions")
    .select("*")
    .in("id", questionIds);

  const byId = new Map((questions ?? []).map((q) => [q.id, q as QuizBankQuestion]));
  let correct = 0;

  for (const qid of questionIds) {
    const q = byId.get(qid);
    if (!q) continue;
    const submitted = answers.find((a) => a.question_id === qid);
    if (!submitted) continue;
    if (submitted.value === expectedAnswerValue(q.correct_answer)) {
      correct += 1;
    }
  }

  const total = questionIds.length;
  const score = Math.round((correct / total) * 100);
  const passingThreshold = (attempt.passing_threshold as number) ?? 80;
  const passed = score >= passingThreshold;

  const answerMap = Object.fromEntries(answers.map((a) => [a.question_id, a.value]));

  await admin
    .from("quiz_attempts")
    .update({
      answers: answerMap,
      score,
      passed,
      submitted_at: new Date().toISOString(),
    })
    .eq("id", attemptId);

  const attemptsCount = await countAttempts(attempt.quiz_id as string, userId);

  let certificate_id: string | undefined;
  let certificate_code: string | undefined;

  if (passed) {
    const { data: quiz } = await admin
      .from("quizzes")
      .select("course_id")
      .eq("id", attempt.quiz_id)
      .maybeSingle();

    const courseId = quiz?.course_id as string | null;
    if (courseId) {
      const profile = await getPhysicianProfile(userId);
      const cert = await issueCmeCertificate({
        userId,
        courseId,
        quizId: attempt.quiz_id as string,
        score,
        physicianName: profile ? resolvePhysicianDisplayName(profile) : "Lékař",
        clkId: profile?.clk_id ?? "",
      });
      if (cert) {
        certificate_id = cert.id;
        certificate_code = cert.certificate_code;
      }
    }
  }

  return {
    attempt_id: attemptId,
    quiz_id: attempt.quiz_id as string,
    score,
    passed,
    passing_threshold: passingThreshold,
    correct_count: correct,
    total_count: total,
    attempts_count: attemptsCount,
    certificate_id,
    certificate_code,
  };
}

export async function recordLessonWatchProgress(input: {
  userId: string;
  lessonId: string;
  currentTime: number;
  duration: number;
  completed?: boolean;
}): Promise<{ completed: boolean; max_watched_seconds: number }> {
  const admin = createServiceRoleClient();
  const { data: existing } = await admin
    .from("lesson_watch_progress")
    .select("*")
    .eq("user_id", input.userId)
    .eq("lesson_id", input.lessonId)
    .maybeSingle();

  const prevMax = Number(existing?.max_watched_seconds ?? 0);
  // Only advance max_watched — never allow client to claim seek-ahead
  const maxWatched = Math.max(prevMax, Math.min(input.currentTime, input.duration || input.currentTime));
  const completed =
    input.completed === true ||
    (input.duration > 0 && maxWatched >= input.duration * 0.95);

  const row = {
    user_id: input.userId,
    lesson_id: input.lessonId,
    max_watched_seconds: maxWatched,
    duration_seconds: input.duration || null,
    completed,
    updated_at: new Date().toISOString(),
  };

  const { error } = await admin.from("lesson_watch_progress").upsert(row, {
    onConflict: "user_id,lesson_id",
  });

  if (error) throw new Error(error.message);
  return { completed, max_watched_seconds: maxWatched };
}
