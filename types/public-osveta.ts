export type PublicHealthCategory = "prevence" | "nemoc" | "dlouhovekost" | "zivotni-styl";

export type PublicHealthTopic = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: PublicHealthCategory;
  popularity_score: number;
  created_at: string;
};

export type PublicHealthVideo = {
  id: string;
  topic_id: string;
  slug: string;
  title: string;
  script: string;
  video_url: string | null;
  avatar_type: string;
  duration_seconds: number;
  thumbnail_url: string | null;
  metadata: Record<string, unknown>;
  published_at: string | null;
  status: "draft" | "processing" | "published" | "archived";
  created_at: string;
  updated_at: string;
};

export type PublicHealthVideoWithTopic = PublicHealthVideo & {
  topic?: PublicHealthTopic | null;
};

export type PublicHealthQuizQuestion = {
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
};

export type PublicHealthQuiz = {
  id: string;
  video_id: string;
  title: string;
  passing_score: number;
  questions: PublicHealthQuizQuestion[];
  created_at: string;
};

export type PublicHealthLeaderboardEntry = {
  user_id: string;
  total_xp: number;
  event_count: number;
  last_activity: string;
  display_name?: string | null;
};

export type PublicOsvetaBadge = {
  id: string;
  label: string;
  description: string;
  earned: boolean;
};

export const PUBLIC_OSVTA_XP = {
  watch: 10,
  quiz: 20,
} as const;
