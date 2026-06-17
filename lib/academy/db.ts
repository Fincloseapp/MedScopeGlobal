import { createServiceRoleClient } from "@/lib/supabase/service";
import { createClient } from "@/lib/supabase/server";
import type {
  AcademyCourse,
  AcademyCourseWithLessons,
  AcademyLesson,
  AcademyLessonWithVideo,
  VideoAsset,
  AcademyQuiz,
  AcademyQuizWithQuestions,
  CreateCourseInput,
  CreateLessonInput,
  CreateQuizInput,
  LeaderboardEntry,
  LeaderboardPeriod,
  QuizSubmitAnswer,
  QuizSubmitResult,
  UpdateCourseInput,
  UpdateLessonInput,
  UpdateProgressInput,
  UpdateQuizInput,
  UserProgress,
  AcademyCertificate,
} from "@/types/academy";

const ACADEMY_VERSION = "v35.0";

export { ACADEMY_VERSION };

function adminClient() {
  return createServiceRoleClient();
}

export async function listPublishedCourses(limit = 50): Promise<AcademyCourse[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("status", "published")
    .eq("is_public", true)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[academy] listPublishedCourses", error.message);
    return [];
  }
  return (data ?? []) as AcademyCourse[];
}

export async function countPublishedCourses(): Promise<number> {
  const admin = adminClient();
  const { count, error } = await admin
    .from("courses")
    .select("*", { count: "exact", head: true })
    .eq("status", "published")
    .eq("is_public", true);

  if (error) {
    console.error("[academy] countPublishedCourses", error.message);
    return 0;
  }
  return count ?? 0;
}

export async function getCourseVideoFlags(
  courseIds: string[]
): Promise<Record<string, { hasVideo: boolean; videoLessonCount: number }>> {
  if (!courseIds.length) return {};

  const admin = adminClient();
  const { data: lessons } = await admin
    .from("lessons")
    .select("course_id, video_asset_id")
    .in("course_id", courseIds)
    .eq("status", "published");

  const flags: Record<string, { hasVideo: boolean; videoLessonCount: number }> = {};
  for (const id of courseIds) {
    flags[id] = { hasVideo: false, videoLessonCount: 0 };
  }
  for (const row of lessons ?? []) {
    if (!row.video_asset_id) continue;
    const entry = flags[row.course_id];
    if (entry) {
      entry.hasVideo = true;
      entry.videoLessonCount += 1;
    }
  }
  return flags;
}

export async function listAllCoursesAdmin(limit = 100): Promise<AcademyCourse[]> {
  const admin = adminClient();
  const { data, error } = await admin
    .from("courses")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as AcademyCourse[];
}

export async function getCourseById(id: string): Promise<AcademyCourse | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("courses").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return data as AcademyCourse;
}

async function attachVideosToLessons(lessons: AcademyLesson[]): Promise<AcademyLessonWithVideo[]> {
  if (!lessons.length) return [];

  const videoIds = [...new Set(lessons.map((l) => l.video_asset_id).filter(Boolean))] as string[];
  const videoMap = new Map<string, VideoAsset>();

  if (videoIds.length) {
    const supabase = await createClient();
    const { data: videos } = await supabase.from("video_assets").select("*").in("id", videoIds);
    for (const v of videos ?? []) {
      videoMap.set(v.id, v as VideoAsset);
    }
  }

  return lessons.map((lesson) => ({
    ...lesson,
    video: lesson.video_asset_id ? (videoMap.get(lesson.video_asset_id) ?? null) : null,
  }));
}

export async function getVideoAssetById(id: string): Promise<VideoAsset | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("video_assets").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return data as VideoAsset;
}

export async function getCourseBySlug(slug: string): Promise<AcademyCourseWithLessons | null> {
  const supabase = await createClient();
  const { data: course, error } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !course) return null;

  const { data: lessons } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", course.id)
    .eq("status", "published")
    .order("sort_order", { ascending: true });

  const lessonsWithVideo = await attachVideosToLessons((lessons ?? []) as AcademyLesson[]);

  return {
    ...(course as AcademyCourse),
    lessons: lessonsWithVideo,
    video_lesson_count: lessonsWithVideo.filter((l) => l.video_asset_id).length,
  };
}

export async function getLessonBySlug(
  courseSlug: string,
  lessonSlug: string
): Promise<(AcademyLessonWithVideo & { course: AcademyCourse }) | null> {
  const course = await getCourseBySlug(courseSlug);
  if (!course) return null;

  const lesson = course.lessons.find((l) => l.slug === lessonSlug);
  if (!lesson) return null;

  return { ...lesson, course };
}

export async function getLessonByIdOrSlug(
  courseSlug: string,
  lessonIdOrSlug: string
): Promise<(AcademyLessonWithVideo & { course: AcademyCourse }) | null> {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(lessonIdOrSlug);
  const course = await getCourseBySlug(courseSlug);
  if (!course) return null;

  const lesson = course.lessons.find((l) =>
    isUuid ? l.id === lessonIdOrSlug : l.slug === lessonIdOrSlug
  );
  if (!lesson) return null;

  return { ...lesson, course };
}

export async function countVideoLessons(): Promise<number> {
  const admin = adminClient();
  const { count, error } = await admin
    .from("lessons")
    .select("*", { count: "exact", head: true })
    .eq("status", "published")
    .not("video_asset_id", "is", null);

  if (error) {
    console.error("[academy] countVideoLessons", error.message);
    return 0;
  }
  return count ?? 0;
}

export async function getCourseByIdOrSlug(idOrSlug: string): Promise<AcademyCourseWithLessons | null> {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
  if (isUuid) {
    const course = await getCourseById(idOrSlug);
    if (!course) return null;
    return getCourseBySlug(course.slug);
  }
  return getCourseBySlug(idOrSlug);
}

export async function createCourse(
  input: CreateCourseInput,
  createdBy?: string | null
): Promise<AcademyCourse> {
  const admin = adminClient();
  const row = {
    slug: input.slug,
    title: input.title,
    description: input.description ?? "",
    summary: input.summary ?? null,
    level: input.level ?? "beginner",
    category: input.category ?? null,
    cover_image_url: input.cover_image_url ?? null,
    duration_minutes: input.duration_minutes ?? 0,
    xp_reward: input.xp_reward ?? 0,
    is_public: input.is_public ?? true,
    status: input.status ?? "draft",
    metadata: input.metadata ?? {},
    created_by: createdBy ?? null,
  };

  const { data, error } = await admin.from("courses").insert(row).select("*").single();
  if (error) throw new Error(error.message);
  return data as AcademyCourse;
}

export async function updateCourse(id: string, input: UpdateCourseInput): Promise<AcademyCourse> {
  const admin = adminClient();
  const { data, error } = await admin.from("courses").update(input).eq("id", id).select("*").single();
  if (error) throw new Error(error.message);
  return data as AcademyCourse;
}

export async function createLesson(input: CreateLessonInput): Promise<AcademyLesson> {
  const admin = adminClient();
  const row = {
    course_id: input.course_id,
    slug: input.slug,
    title: input.title,
    content: input.content ?? "",
    content_json: {},
    sort_order: input.sort_order ?? 0,
    duration_minutes: input.duration_minutes ?? 0,
    status: input.status ?? "draft",
  };

  const { data, error } = await admin.from("lessons").insert(row).select("*").single();
  if (error) throw new Error(error.message);
  return data as AcademyLesson;
}

export async function createQuizWithQuestions(input: CreateQuizInput): Promise<AcademyQuiz> {
  const admin = adminClient();
  const { data: quiz, error } = await admin
    .from("quizzes")
    .insert({
      course_id: input.course_id,
      lesson_id: input.lesson_id ?? null,
      title: input.title,
      passing_score: input.passing_score ?? 70,
      status: input.status ?? "draft",
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  if (input.questions?.length) {
    const rows = input.questions.map((q, i) => ({
      quiz_id: quiz.id,
      question_text: q.question_text,
      question_type: q.question_type ?? "multiple_choice",
      options: q.options ?? [],
      correct_answer: q.correct_answer,
      sort_order: q.sort_order ?? i + 1,
      explanation: q.explanation ?? null,
    }));

    const { error: qErr } = await admin.from("quiz_questions").insert(rows);
    if (qErr) throw new Error(qErr.message);
  }

  return quiz as AcademyQuiz;
}

export async function updateLesson(id: string, input: UpdateLessonInput): Promise<AcademyLesson> {
  const admin = adminClient();
  const { data, error } = await admin.from("lessons").update(input).eq("id", id).select("*").single();
  if (error) throw new Error(error.message);
  return data as AcademyLesson;
}

export async function updateQuiz(id: string, input: UpdateQuizInput): Promise<AcademyQuiz> {
  const admin = adminClient();
  const { data, error } = await admin.from("quizzes").update(input).eq("id", id).select("*").single();
  if (error) throw new Error(error.message);
  return data as AcademyQuiz;
}

export async function getLessonById(id: string): Promise<AcademyLesson | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("lessons").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return data as AcademyLesson;
}

export async function getQuizById(id: string, includeAnswers = false): Promise<AcademyQuizWithQuestions | null> {
  const supabase = await createClient();
  const { data: quiz, error } = await supabase.from("quizzes").select("*").eq("id", id).maybeSingle();
  if (error || !quiz) return null;

  const { data: questions } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq("quiz_id", id)
    .order("sort_order", { ascending: true });

  const mapped = (questions ?? []).map((q) => {
    const row = q as AcademyQuizWithQuestions["questions"][0];
    if (!includeAnswers) {
      return { ...row, correct_answer: {} };
    }
    return row;
  });

  return {
    ...(quiz as AcademyQuizWithQuestions),
    questions: mapped,
  };
}

export async function submitQuizAnswers(
  quizId: string,
  answers: QuizSubmitAnswer[],
  userId?: string | null
): Promise<QuizSubmitResult> {
  const admin = adminClient();
  const { data: quiz } = await admin.from("quizzes").select("*").eq("id", quizId).maybeSingle();
  if (!quiz) throw new Error("Kvíz nenalezen");

  const { data: questions } = await admin
    .from("quiz_questions")
    .select("*")
    .eq("quiz_id", quizId);

  const qList = questions ?? [];
  let correct = 0;

  for (const q of qList) {
    const submitted = answers.find((a) => a.question_id === q.id);
    if (!submitted) continue;
    const expected = q.correct_answer;
    const match =
      JSON.stringify(submitted.answer) === JSON.stringify(expected?.value ?? expected);
    if (match) correct += 1;
  }

  const total = qList.length || 1;
  const score = Math.round((correct / total) * 100);
  const passing = (quiz as { passing_score: number }).passing_score ?? 70;
  const passed = score >= passing;

  let xp_awarded = 0;
  let certificate_id: string | undefined;
  let certificate_code: string | undefined;

  if (passed && userId) {
    const { data: existing } = await admin
      .from("xp_events")
      .select("id")
      .eq("user_id", userId)
      .eq("event_type", "quiz_pass")
      .eq("source_id", quizId)
      .maybeSingle();

    if (!existing?.id) {
      xp_awarded = Math.max(25, Math.round(score * 0.5));
      await awardXp(userId, {
        eventType: "quiz_pass",
        points: xp_awarded,
        sourceType: "quiz",
        sourceId: quizId,
      });

      const courseId = (quiz as { course_id: string | null }).course_id;
      if (courseId) {
        await updateUserProgress(userId, {
          course_id: courseId,
          status: "completed",
          progress_pct: 100,
          quiz_score: score,
        });

        const cert = await issueCourseCertificate(userId, courseId, { score, quizId });
        if (cert) {
          certificate_id = cert.id;
          certificate_code = cert.certificate_code;
        }
      }
    }
  }

  return {
    quiz_id: quizId,
    score,
    passed,
    passing_score: passing,
    correct_count: correct,
    total_count: total,
    xp_awarded,
    certificate_id,
    certificate_code,
  };
}

export async function getLeaderboard(period: LeaderboardPeriod = "all_time", limit = 20): Promise<LeaderboardEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leaderboard")
    .select("*")
    .eq("period", period)
    .order("total_xp", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[academy] getLeaderboard", error.message);
    return [];
  }
  return (data ?? []) as LeaderboardEntry[];
}

export async function updateUserProgress(
  userId: string,
  input: UpdateProgressInput
): Promise<UserProgress> {
  const admin = adminClient();
  const patch = {
    user_id: userId,
    course_id: input.course_id,
    lesson_id: input.lesson_id ?? null,
    status: input.status ?? "in_progress",
    progress_pct: input.progress_pct ?? 0,
    quiz_score: input.quiz_score ?? null,
    completed_at: input.status === "completed" ? new Date().toISOString() : null,
  };

  const { data: existing } = await admin
    .from("user_progress")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", input.course_id)
    .is("lesson_id", input.lesson_id ?? null)
    .maybeSingle();

  const query = existing?.id
    ? admin.from("user_progress").update(patch).eq("id", existing.id)
    : admin.from("user_progress").insert(patch);

  const { data, error } = await query.select("*").single();

  if (error) throw new Error(error.message);
  return data as UserProgress;
}

export async function getAcademyCounts(): Promise<Record<string, number>> {
  const admin = adminClient();
  const tables = ["courses", "lessons", "quizzes", "ai_tasks", "user_progress", "certificates"] as const;
  const counts: Record<string, number> = {};

  await Promise.all(
    tables.map(async (table) => {
      const { count } = await admin.from(table).select("*", { count: "exact", head: true });
      counts[table] = count ?? 0;
    })
  );

  return counts;
}

export async function checkAcademyTables(): Promise<Record<string, boolean>> {
  const admin = adminClient();
  const tables = [
    "courses",
    "lessons",
    "quizzes",
    "ai_tasks",
    "leaderboard",
    "user_progress",
    "marketplace_courses",
    "mentoring_sessions",
    "video_assets",
    "clinical_simulations",
    "textbooks",
    "study_games",
    "ai_scenarios",
    "marketing_events",
  ];
  const result: Record<string, boolean> = {};

  for (const table of tables) {
    const { error } = await admin.from(table).select("id", { count: "exact", head: true });
    result[table] = !error;
  }

  return result;
}

export async function listPublishedLessons(courseId?: string, limit = 100): Promise<AcademyLesson[]> {
  const supabase = await createClient();
  let query = supabase
    .from("lessons")
    .select("*")
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .limit(limit);
  if (courseId) query = query.eq("course_id", courseId);
  const { data, error } = await query;
  if (error) {
    console.error("[academy] listPublishedLessons", error.message);
    return [];
  }
  return (data ?? []) as AcademyLesson[];
}

export async function listPublishedQuizzes(limit = 50) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quizzes")
    .select("*")
    .eq("status", "published")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[academy] listPublishedQuizzes", error.message);
    return [];
  }
  return data ?? [];
}

export async function listMarketplaceListings(limit = 20) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("marketplace_courses")
    .select("*")
    .eq("status", "listed")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[academy] listMarketplaceListings", error.message);
    return [];
  }
  return data ?? [];
}

export async function getMarketplaceListingById(listingId: string) {
  const admin = adminClient();
  const { data, error } = await admin
    .from("marketplace_courses")
    .select("*, courses(id, title, slug, summary)")
    .eq("id", listingId)
    .maybeSingle();

  if (error) {
    console.error("[academy] getMarketplaceListingById", error.message);
    return null;
  }
  return data;
}

export async function listMentoringSessions(userId?: string, limit = 20) {
  const supabase = await createClient();
  let query = supabase.from("mentoring_sessions").select("*").order("scheduled_at", { ascending: true }).limit(limit);

  if (userId) {
    query = query.or(`mentor_id.eq.${userId},mentee_id.eq.${userId}`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[academy] listMentoringSessions", error.message);
    return [];
  }
  return data ?? [];
}

export async function listVideoAssets(limit = 20) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("video_assets")
    .select("*")
    .eq("status", "ready")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[academy] listVideoAssets", error.message);
    return [];
  }
  return data ?? [];
}

export async function listClinicalSimulations(limit = 20) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clinical_simulations")
    .select("*")
    .eq("status", "published")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[academy] listClinicalSimulations", error.message);
    return [];
  }
  return data ?? [];
}

export async function getSimulationBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clinical_simulations")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

export async function listTextbooks(limit = 20) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("textbooks")
    .select("*")
    .eq("status", "published")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[academy] listTextbooks", error.message);
    return [];
  }
  return data ?? [];
}

export async function getTextbookBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("textbooks")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

export async function listStudyGames(limit = 20) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("study_games")
    .select("*")
    .eq("status", "published")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[academy] listStudyGames", error.message);
    return [];
  }
  return data ?? [];
}

export async function listAiScenarios(limit = 20) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ai_scenarios")
    .select("*")
    .eq("status", "published")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[academy] listAiScenarios", error.message);
    return [];
  }
  return data ?? [];
}

export async function listAiLogs(limit = 50) {
  const admin = adminClient();
  const { data, error } = await admin
    .from("ai_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function awardXp(
  userId: string,
  opts: { eventType: string; points: number; sourceType?: string; sourceId?: string }
) {
  const admin = adminClient();
  const { data, error } = await admin
    .from("xp_events")
    .insert({
      user_id: userId,
      event_type: opts.eventType,
      points: opts.points,
      source_type: opts.sourceType ?? null,
      source_id: opts.sourceId ?? null,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getUserProgress(userId: string, courseId?: string) {
  const supabase = await createClient();
  let query = supabase.from("user_progress").select("*").eq("user_id", userId);
  if (courseId) query = query.eq("course_id", courseId);

  const { data, error } = await query.order("updated_at", { ascending: false });
  if (error) {
    console.error("[academy] getUserProgress", error.message);
    return [];
  }
  return data ?? [];
}

export async function listUserCertificates(userId: string): Promise<AcademyCertificate[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("certificates")
    .select("*")
    .eq("user_id", userId)
    .order("issued_at", { ascending: false });

  if (error) {
    console.error("[academy] listUserCertificates", error.message);
    return [];
  }
  return (data ?? []) as AcademyCertificate[];
}

export async function getCertificateById(id: string): Promise<AcademyCertificate | null> {
  const admin = adminClient();
  const { data, error } = await admin.from("certificates").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return data as AcademyCertificate;
}

export async function issueCourseCertificate(
  userId: string,
  courseId: string,
  opts: { score?: number; quizId?: string }
): Promise<AcademyCertificate | null> {
  const admin = adminClient();

  const { data: existing } = await admin
    .from("certificates")
    .select("*")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (existing) return existing as AcademyCertificate;

  const { generateCertificateCode } = await import("@/lib/academy/certificates/generator");
  const code = generateCertificateCode();

  const { data, error } = await admin
    .from("certificates")
    .insert({
      user_id: userId,
      course_id: courseId,
      certificate_code: code,
      metadata: { score: opts.score ?? null, quiz_id: opts.quizId ?? null },
    })
    .select("*")
    .single();

  if (error) {
    console.error("[academy] issueCourseCertificate", error.message);
    return null;
  }
  return data as AcademyCertificate;
}

export async function getCoursesWithVideoMetadata(limit = 50) {
  const courses = await listPublishedCourses(limit);
  const flags = await getCourseVideoFlags(courses.map((c) => c.id));
  const admin = adminClient();

  const { data: lessons } = await admin
    .from("lessons")
    .select("id, course_id, slug, title, video_asset_id")
    .eq("status", "published")
    .not("video_asset_id", "is", null);

  const videoIds = [...new Set((lessons ?? []).map((l) => l.video_asset_id).filter(Boolean))] as string[];
  const { data: videos } = videoIds.length
    ? await admin.from("video_assets").select("id, title, duration_seconds, status, metadata").in("id", videoIds)
    : { data: [] };

  const videoMap = new Map((videos ?? []).map((v) => [v.id, v]));

  return courses.map((course) => {
    const courseLessons = (lessons ?? []).filter((l) => l.course_id === course.id);
    const videoLessons = courseLessons
      .map((l) => {
        const asset = l.video_asset_id ? videoMap.get(l.video_asset_id) : null;
        const meta = (asset?.metadata ?? {}) as Record<string, unknown>;
        return {
          lesson_id: l.id,
          slug: l.slug,
          title: l.title,
          video_asset_id: l.video_asset_id,
          public_url: meta.public_url ?? null,
          thumbnail_url: meta.thumbnail_url ?? null,
          render_status: meta.render_status ?? asset?.status ?? null,
          duration_seconds: asset?.duration_seconds ?? null,
        };
      })
      .filter((v) => v.video_asset_id);

    return {
      ...course,
      has_video: flags[course.id]?.hasVideo ?? false,
      video_lesson_count: flags[course.id]?.videoLessonCount ?? 0,
      video_lessons: videoLessons,
    };
  });
}

export async function countUserQuizPasses(userId: string): Promise<number> {
  const admin = adminClient();
  const { count } = await admin
    .from("xp_events")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("event_type", "quiz_pass");
  return count ?? 0;
}

export async function runSystemTest(name: string) {
  const admin = adminClient();
  const tables = await checkAcademyTables();
  const passed = Object.values(tables).every(Boolean);
  const result = { tables, passed, checkedAt: new Date().toISOString() };

  const { data: existing } = await admin.from("system_tests").select("id").eq("name", name).maybeSingle();

  const row = {
    name,
    status: passed ? "passed" : "failed",
    last_run_at: new Date().toISOString(),
    result,
  };

  if (existing?.id) {
    const { data, error } = await admin.from("system_tests").update(row).eq("id", existing.id).select("*").single();
    if (error) throw new Error(error.message);
    return data;
  }

  const { data, error } = await admin.from("system_tests").insert(row).select("*").single();
  if (error) throw new Error(error.message);
  return data;
}
