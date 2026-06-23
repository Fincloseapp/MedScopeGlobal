import { createServiceRoleClient } from "@/lib/supabase/service";
import { createClient } from "@/lib/supabase/server";
import { awardXp } from "@/lib/academy/db";
import type {
  PublicHealthCategory,
  PublicHealthLeaderboardEntry,
  PublicHealthQuiz,
  PublicHealthTopic,
  PublicHealthVideo,
  PublicHealthVideoWithTopic,
  PublicOsvetaBadge,
} from "@/types/public-osveta";
import { PUBLIC_OSVTA_XP } from "@/types/public-osveta";

function adminClient() {
  return createServiceRoleClient();
}

export async function listPublicHealthVideos(opts?: {
  limit?: number;
  category?: PublicHealthCategory;
  offset?: number;
}): Promise<PublicHealthVideoWithTopic[]> {
  const supabase = await createClient();
  let query = supabase
    .from("public_health_videos")
    .select(
      opts?.category
        ? "*, topic:public_health_topics!inner(*)"
        : "*, topic:public_health_topics(*)"
    )
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (opts?.category) {
    query = query.eq("topic.category", opts.category);
  }
  if (opts?.limit) query = query.limit(opts.limit);
  if (opts?.offset) query = query.range(opts.offset, opts.offset + (opts.limit ?? 20) - 1);

  const { data, error } = await query;
  if (error) {
    console.error("[osveta] listPublicHealthVideos", error.message);
    return [];
  }
  return (data ?? []) as PublicHealthVideoWithTopic[];
}

export async function getTodayPublicHealthVideo(): Promise<PublicHealthVideoWithTopic | null> {
  const supabase = await createClient();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("public_health_videos")
    .select("*, topic:public_health_topics(*)")
    .eq("status", "published")
    .gte("published_at", todayStart.toISOString())
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[osveta] getTodayPublicHealthVideo", error.message);
    return null;
  }
  if (data) return data as PublicHealthVideoWithTopic;

  const { data: latest } = await supabase
    .from("public_health_videos")
    .select("*, topic:public_health_topics(*)")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (latest as PublicHealthVideoWithTopic | null) ?? null;
}

export async function getPublicHealthVideoBySlug(slug: string): Promise<PublicHealthVideoWithTopic | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("public_health_videos")
    .select("*, topic:public_health_topics(*)")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("[osveta] getPublicHealthVideoBySlug", error.message);
    return null;
  }
  return (data as PublicHealthVideoWithTopic | null) ?? null;
}

export async function getPublicHealthQuizByVideoId(videoId: string): Promise<PublicHealthQuiz | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("public_health_quizzes")
    .select("*")
    .eq("video_id", videoId)
    .maybeSingle();

  if (error) {
    console.error("[osveta] getPublicHealthQuizByVideoId", error.message);
    return null;
  }
  return (data as PublicHealthQuiz | null) ?? null;
}

export async function listPublicHealthTopics(): Promise<PublicHealthTopic[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("public_health_topics")
    .select("*")
    .order("popularity_score", { ascending: false });

  if (error) {
    console.error("[osveta] listPublicHealthTopics", error.message);
    return [];
  }
  return (data ?? []) as PublicHealthTopic[];
}

export async function getPublicOsvetaLeaderboard(limit = 20): Promise<PublicHealthLeaderboardEntry[]> {
  const admin = adminClient();
  const { data, error } = await admin
    .from("public_health_leaderboard")
    .select("*")
    .order("total_xp", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[osveta] getPublicOsvetaLeaderboard", error.message);
    return [];
  }

  const entries = (data ?? []) as PublicHealthLeaderboardEntry[];
  if (!entries.length) return entries;

  const userIds = entries.map((e) => e.user_id);
  const { data: profiles } = await admin
    .from("users")
    .select("id, full_name, email")
    .in("id", userIds);

  const nameMap = new Map<string, string | null>();
  for (const p of profiles ?? []) {
    const label = p.full_name ?? (p.email ? p.email.split("@")[0] : null);
    nameMap.set(p.id, label);
  }

  return entries.map((e) => ({
    ...e,
    display_name: nameMap.get(e.user_id) ?? `Uživatel ${e.user_id.slice(0, 6)}`,
  }));
}

export async function awardPublicOsvetaWatchXp(userId: string, videoId: string) {
  const admin = adminClient();
  const { data: existing } = await admin
    .from("xp_events")
    .select("id")
    .eq("user_id", userId)
    .eq("event_type", "public_osveta_watch")
    .eq("source_id", videoId)
    .maybeSingle();

  if (existing) return { awarded: false, points: 0, reason: "already_watched" as const };

  await awardXp(userId, {
    eventType: "public_osveta_watch",
    points: PUBLIC_OSVTA_XP.watch,
    sourceType: "public_osveta",
    sourceId: videoId,
  });

  return { awarded: true, points: PUBLIC_OSVTA_XP.watch };
}

export async function submitPublicOsvetaQuiz(
  userId: string,
  videoId: string,
  answers: string[]
): Promise<{ passed: boolean; score: number; xpAwarded: number; alreadyCompleted: boolean }> {
  const admin = adminClient();
  const { data: quiz } = await admin
    .from("public_health_quizzes")
    .select("*")
    .eq("video_id", videoId)
    .maybeSingle();

  if (!quiz) throw new Error("Kvíz nenalezen");

  const questions = (quiz.questions ?? []) as Array<{ correct_answer: string }>;
  if (!questions.length) throw new Error("Kvíz nemá otázky");

  const { data: existing } = await admin
    .from("xp_events")
    .select("id")
    .eq("user_id", userId)
    .eq("event_type", "public_osveta_quiz")
    .eq("source_id", videoId)
    .maybeSingle();

  if (existing) {
    return { passed: true, score: 100, xpAwarded: 0, alreadyCompleted: true };
  }

  let correct = 0;
  for (let i = 0; i < questions.length; i++) {
    if (answers[i]?.trim() === questions[i].correct_answer) correct += 1;
  }
  const score = Math.round((correct / questions.length) * 100);
  const passed = score >= (quiz.passing_score ?? 67);

  let xpAwarded = 0;
  if (passed) {
    await awardXp(userId, {
      eventType: "public_osveta_quiz",
      points: PUBLIC_OSVTA_XP.quiz,
      sourceType: "public_osveta",
      sourceId: videoId,
    });
    xpAwarded = PUBLIC_OSVTA_XP.quiz;
  }

  return { passed, score, xpAwarded, alreadyCompleted: false };
}

export async function getUserPublicOsvetaBadges(userId: string): Promise<PublicOsvetaBadge[]> {
  const admin = adminClient();
  const { data: events } = await admin
    .from("xp_events")
    .select("event_type, created_at")
    .eq("user_id", userId)
    .in("event_type", ["public_osveta_watch", "public_osveta_quiz"]);

  const watches = (events ?? []).filter((e) => e.event_type === "public_osveta_watch");
  const quizzes = (events ?? []).filter((e) => e.event_type === "public_osveta_quiz");

  const watchDates = new Set(
    watches.map((w) => new Date(w.created_at as string).toISOString().slice(0, 10))
  );

  const weekStreak = watchDates.size >= 7;

  return [
    {
      id: "first_video",
      label: "První video",
      description: "Shlédl jste první osvětové video",
      earned: watches.length >= 1,
    },
    {
      id: "quiz_master",
      label: "Kvízový mistr",
      description: "Dokončili jste mini-kvíz",
      earned: quizzes.length >= 1,
    },
    {
      id: "week_prevention",
      label: "Týden prevence",
      description: "Sledujete zdravotní tipy pravidelně",
      earned: weekStreak || watches.length >= 5,
    },
    {
      id: "dedicated",
      label: "Osvětový nadšenec",
      description: "10+ zhlédnutých videí",
      earned: watches.length >= 10,
    },
  ];
}

export async function checkPublicOsvetaTables(): Promise<Record<string, boolean>> {
  const admin = adminClient();
  const tables = ["public_health_topics", "public_health_videos", "public_health_quizzes"];
  const result: Record<string, boolean> = {};
  for (const table of tables) {
    const { error } = await admin.from(table).select("id").limit(1);
    result[table] = !error;
  }
  return result;
}

export async function countPublishedOsvetaVideos(): Promise<number> {
  const admin = adminClient();
  const { count, error } = await admin
    .from("public_health_videos")
    .select("*", { count: "exact", head: true })
    .eq("status", "published");
  if (error) return 0;
  return count ?? 0;
}

export async function insertPublicHealthVideo(input: {
  topicId: string;
  slug: string;
  title: string;
  script: string;
  avatarType: string;
  durationSeconds: number;
  videoUrl?: string;
  thumbnailUrl?: string;
  metadata?: Record<string, unknown>;
  publishedAt?: string;
  status?: PublicHealthVideo["status"];
}): Promise<PublicHealthVideo | null> {
  const admin = adminClient();
  const { data, error } = await admin
    .from("public_health_videos")
    .insert({
      topic_id: input.topicId,
      slug: input.slug,
      title: input.title,
      script: input.script,
      avatar_type: input.avatarType,
      duration_seconds: input.durationSeconds,
      video_url: input.videoUrl ?? null,
      thumbnail_url: input.thumbnailUrl ?? null,
      metadata: input.metadata ?? {},
      published_at: input.publishedAt ?? new Date().toISOString(),
      status: input.status ?? "published",
    })
    .select("*")
    .single();

  if (error) {
    console.error("[osveta] insertPublicHealthVideo", error.message);
    return null;
  }
  return data as PublicHealthVideo;
}
