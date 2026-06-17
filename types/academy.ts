export type AcademyCourseStatus = "draft" | "published" | "archived";
export type AcademyLevel = "beginner" | "intermediate" | "advanced";
export type AcademyLessonStatus = AcademyCourseStatus;
export type AcademyQuizStatus = AcademyCourseStatus;
export type AiTaskStatus = "queued" | "running" | "completed" | "failed" | "cancelled";
export type UserProgressStatus = "not_started" | "in_progress" | "completed";
export type LeaderboardPeriod = "weekly" | "monthly" | "all_time";

export interface AcademyCourse {
  id: string;
  slug: string;
  title: string;
  description: string;
  summary: string | null;
  status: AcademyCourseStatus;
  level: AcademyLevel;
  category: string | null;
  cover_image_url: string | null;
  duration_minutes: number;
  xp_reward: number;
  is_public: boolean;
  metadata: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AcademyLesson {
  id: string;
  course_id: string;
  slug: string;
  title: string;
  content: string;
  content_json: Record<string, unknown>;
  sort_order: number;
  duration_minutes: number;
  video_asset_id: string | null;
  status: AcademyLessonStatus;
  created_at: string;
  updated_at: string;
}

export interface AcademyQuiz {
  id: string;
  course_id: string | null;
  lesson_id: string | null;
  title: string;
  passing_score: number;
  status: AcademyQuizStatus;
  created_at: string;
  updated_at: string;
}

export interface AcademyQuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: "multiple_choice" | "true_false" | "short_answer";
  options: unknown[];
  correct_answer: Record<string, unknown>;
  sort_order: number;
  explanation: string | null;
  created_at: string;
  updated_at: string;
}

export interface AcademyQuizWithQuestions extends AcademyQuiz {
  questions: AcademyQuizQuestion[];
}

export interface AcademyCourseWithLessons extends AcademyCourse {
  lessons: AcademyLesson[];
}

export interface AiTask {
  id: string;
  task_type: string;
  status: AiTaskStatus;
  payload: Record<string, unknown>;
  result: Record<string, unknown> | null;
  priority: number;
  error_message: string | null;
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AiLog {
  id: string;
  task_id: string | null;
  worker: string;
  level: "debug" | "info" | "warn" | "error";
  message: string;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  course_id: string;
  lesson_id: string | null;
  status: UserProgressStatus;
  progress_pct: number;
  quiz_score: number | null;
  completed_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  total_xp: number;
  rank: number | null;
  period: LeaderboardPeriod;
  updated_at: string;
}

export interface AcademyHealth {
  version: string;
  ok: boolean;
  tables: Record<string, boolean>;
  courseCount: number;
  generatedAt: string;
}

export interface CreateCourseInput {
  slug: string;
  title: string;
  description?: string;
  summary?: string;
  level?: AcademyLevel;
  category?: string;
  cover_image_url?: string;
  duration_minutes?: number;
  xp_reward?: number;
  is_public?: boolean;
  status?: AcademyCourseStatus;
  metadata?: Record<string, unknown>;
}

export interface UpdateCourseInput {
  title?: string;
  description?: string;
  summary?: string;
  level?: AcademyLevel;
  category?: string;
  status?: AcademyCourseStatus;
  is_public?: boolean;
  duration_minutes?: number;
  xp_reward?: number;
}

export interface CreateLessonInput {
  course_id: string;
  slug: string;
  title: string;
  content?: string;
  sort_order?: number;
  duration_minutes?: number;
  status?: AcademyLessonStatus;
}

export interface CreateQuizInput {
  course_id: string;
  title: string;
  passing_score?: number;
  lesson_id?: string | null;
  status?: AcademyQuizStatus;
  questions?: {
    question_text: string;
    question_type?: AcademyQuizQuestion["question_type"];
    options?: { label: string; value: string }[];
    correct_answer: Record<string, unknown>;
    sort_order?: number;
    explanation?: string | null;
  }[];
}

export interface UpdateLessonInput {
  title?: string;
  content?: string;
  sort_order?: number;
  duration_minutes?: number;
  status?: AcademyLessonStatus;
  video_asset_id?: string | null;
}

export interface UpdateQuizInput {
  title?: string;
  passing_score?: number;
  status?: AcademyQuizStatus;
}

export interface ExpertReviewResult {
  target_type: "course" | "lesson" | "quiz";
  target_id: string;
  score: number;
  approved: boolean;
  issues: string[];
  recommendations: string[];
  provider: string;
}

export interface UpdateProgressInput {
  course_id: string;
  lesson_id?: string | null;
  status?: UserProgressStatus;
  progress_pct?: number;
  quiz_score?: number;
}

export interface QuizSubmitAnswer {
  question_id: string;
  answer: unknown;
}

export interface QuizSubmitResult {
  quiz_id: string;
  score: number;
  passed: boolean;
  passing_score: number;
  correct_count: number;
  total_count: number;
}

export interface MarketplaceListing {
  id: string;
  course_id: string;
  seller_id: string | null;
  price_czk: number;
  status: "draft" | "listed" | "sold_out" | "archived";
  listing_metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface MentoringSession {
  id: string;
  mentor_id: string | null;
  mentee_id: string | null;
  course_id: string | null;
  scheduled_at: string | null;
  status: "requested" | "confirmed" | "completed" | "cancelled";
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface VideoAsset {
  id: string;
  title: string;
  storage_path: string | null;
  duration_seconds: number;
  status: "pending" | "processing" | "ready" | "failed";
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ClinicalSimulation {
  id: string;
  title: string;
  slug: string;
  scenario_json: Record<string, unknown>;
  difficulty: string;
  status: AcademyCourseStatus;
  created_at: string;
  updated_at: string;
}

export interface Textbook {
  id: string;
  title: string;
  slug: string;
  content_ref: string | null;
  status: AcademyCourseStatus;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface StudyGame {
  id: string;
  title: string;
  slug: string;
  game_type: string;
  config: Record<string, unknown>;
  status: AcademyCourseStatus;
  created_at: string;
  updated_at: string;
}

export interface AiScenario {
  id: string;
  title: string;
  slug: string;
  prompt_template: string;
  status: AcademyCourseStatus;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface MarketingEvent {
  id: string;
  event_type: string;
  payload: Record<string, unknown>;
  scheduled_at: string | null;
  status: "pending" | "sent" | "failed" | "cancelled";
  created_at: string;
  updated_at: string;
}

export interface SystemTest {
  id: string;
  name: string;
  status: "idle" | "running" | "passed" | "failed";
  last_run_at: string | null;
  result: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
