import { academyGenerateJson } from "@/lib/academy/ai/workers/shared";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { generateQuizForLesson } from "@/lib/v40/course/quiz-generator";
import { buildCourseMetadata } from "@/lib/v40/course/metadata-engine";
import { runVideoPipeline } from "@/lib/v40/video/pipeline";

export type GeneratedCourse = {
  course_id: string;
  slug: string;
  title: string;
  lesson_count: number;
  quiz_count: number;
  video_jobs: string[];
};

export type CourseGenerateInput = {
  topic: string;
  level?: string;
  targetAudience?: string;
  lessonCount?: number;
};

type CourseOutline = {
  title: string;
  slug: string;
  description: string;
  summary: string;
  category: string;
  audience: string;
  level: string;
  lessons: Array<{
    title: string;
    slug: string;
    content: string;
    sort_order: number;
    generate_video: boolean;
  }>;
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function buildStubOutline(input: CourseGenerateInput): CourseOutline {
  const count = input.lessonCount ?? 4;
  const title = `Kurz: ${input.topic}`;
  const lessons = Array.from({ length: count }, (_, i) => ({
    title: `Lekce ${i + 1}: ${input.topic}`,
    slug: slugify(`lekce-${i + 1}-${input.topic}`),
    content: `# ${input.topic}\n\nLekce ${i + 1} pokrývá klíčové aspekty tématu pro ${input.targetAudience ?? "studenty medicíny"}.`,
    sort_order: i + 1,
    generate_video: i < 2,
  }));
  return {
    title,
    slug: slugify(title),
    description: `Kompletní kurz k tématu ${input.topic}.`,
    summary: `AI generovaný kurz — ${input.topic}`,
    category: "general",
    audience: input.targetAudience ?? "student",
    level: input.level ?? "beginner",
    lessons,
  };
}

export async function generateCourse(input: CourseGenerateInput): Promise<GeneratedCourse> {
  const admin = createServiceRoleClient();
  const { data, provider, fallback } = await academyGenerateJson<CourseOutline>({
    system:
      "Jsi expert na medicínské kurzy pro české studenty. Piš profesionálně. Odpovídej pouze validním JSON.",
    user: `Vytvoř kompletní kurz:
Téma: ${input.topic}
Úroveň: ${input.level ?? "beginner"}
Cílová skupina: ${input.targetAudience ?? "studenti medicíny"}
Počet lekcí: ${input.lessonCount ?? 4}

JSON:
{
  "title": "...",
  "slug": "...",
  "description": "...",
  "summary": "...",
  "category": "general",
  "audience": "...",
  "level": "beginner|intermediate|advanced",
  "lessons": [{"title": "...", "slug": "...", "content": "markdown", "sort_order": 1, "generate_video": true}]
}`,
    maxTokens: 5000,
  });

  const outline =
    fallback || !data?.title
      ? buildStubOutline(input)
      : {
          ...data,
          slug: slugify(data.slug || data.title),
          level: ["beginner", "intermediate", "advanced"].includes(data.level) ? data.level : "beginner",
          lessons: data.lessons.map((l, i) => ({
            ...l,
            slug: slugify(l.slug || l.title),
            sort_order: l.sort_order ?? i + 1,
          })),
        };

  const metadata = await buildCourseMetadata({
    title: outline.title,
    description: outline.description,
    topic: input.topic,
    level: outline.level,
    audience: outline.audience,
  });

  const { data: course, error: courseErr } = await admin
    .from("courses")
    .insert({
      title: outline.title,
      slug: outline.slug,
      description: outline.description,
      summary: outline.summary,
      category: outline.category,
      level: outline.level,
      status: "draft",
      is_public: false,
      metadata: { ...metadata, v40_generated: true, audience: outline.audience, llm_provider: provider },
    })
    .select("id, slug")
    .maybeSingle();

  if (courseErr || !course) throw new Error(courseErr?.message ?? "Course insert failed");

  const videoJobs: string[] = [];
  let quizCount = 0;

  for (const lesson of outline.lessons) {
    const { data: lessonRow } = await admin
      .from("lessons")
      .insert({
        course_id: course.id,
        slug: lesson.slug,
        title: lesson.title,
        content: lesson.content,
        sort_order: lesson.sort_order,
        status: "draft",
        content_json: { v40_generated: true, key_points: metadata.key_points?.slice(0, 3) ?? [] },
      })
      .select("id")
      .maybeSingle();

    if (!lessonRow) continue;

    const quiz = await generateQuizForLesson({
      courseId: course.id,
      lessonId: lessonRow.id,
      lessonTitle: lesson.title,
      lessonContent: lesson.content,
    });
    if (quiz) quizCount++;

    if (lesson.generate_video) {
      const video = await runVideoPipeline({
        topic: lesson.title,
        lessonContent: lesson.content,
        courseTitle: outline.title,
        level: outline.level,
        useAvatar: false,
      });
      videoJobs.push(video.job_id);
      if (video.video_asset_id) {
        await admin.from("lessons").update({ video_asset_id: video.video_asset_id }).eq("id", lessonRow.id);
      }
    }
  }

  return {
    course_id: course.id,
    slug: course.slug,
    title: outline.title,
    lesson_count: outline.lessons.length,
    quiz_count: quizCount,
    video_jobs: videoJobs,
  };
}
