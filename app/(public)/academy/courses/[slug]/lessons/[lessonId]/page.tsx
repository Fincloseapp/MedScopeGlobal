import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AcademyPageHeader } from "@/components/academy/page-header";
import { AiLecturerPanel } from "@/components/academy/ai-lecturer-panel";
import { LessonVideoPlayer } from "@/components/academy/lesson-video-player";
import { getLessonByIdOrSlug } from "@/lib/academy/db";
import { buildV20PageMetadata } from "@/lib/v20/seo";

export const revalidate = 120;

type Props = { params: Promise<{ slug: string; lessonId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, lessonId } = await params;
  const lesson = await getLessonByIdOrSlug(slug, lessonId);
  if (!lesson) {
    return buildV20PageMetadata({
      title: "Lekce nenalezena",
      description: "Požadovaná lekce v MedScope Academy nebyla nalezena.",
      path: `/academy/courses/${slug}/lessons/${lessonId}`,
    });
  }
  return buildV20PageMetadata({
    title: `${lesson.title} — ${lesson.course.title}`,
    description: lesson.content.slice(0, 160),
    path: `/academy/courses/${slug}/lessons/${lesson.slug}`,
  });
}

function renderContent(content: string) {
  return content.split(/\n\n+/).filter(Boolean).map((block, i) => {
    if (block.startsWith("## ")) {
      return (
        <h2 key={i} className="font-display text-xl font-semibold text-[#021d33]">
          {block.replace(/^##\s+/, "")}
        </h2>
      );
    }
    if (block.startsWith("### ")) {
      return (
        <h3 key={i} className="mt-4 font-semibold text-[#021d33]">
          {block.replace(/^###\s+/, "")}
        </h3>
      );
    }
    return (
      <p key={i} className="text-slate-700">
        {block.replace(/\*\*/g, "")}
      </p>
    );
  });
}

export default async function AcademyLessonPage({ params }: Props) {
  const { slug, lessonId } = await params;
  const lesson = await getLessonByIdOrSlug(slug, lessonId);
  if (!lesson) notFound();

  return (
    <>
      <AcademyPageHeader
        eyebrow={lesson.course.title}
        title={lesson.title}
        description={`Videokurz s AI lektorem · ${lesson.duration_minutes} min`}
        ctaHref={`/academy/courses/${slug}`}
        ctaLabel="Zpět na kurz"
      />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <nav className="mb-6 text-sm text-muted-foreground">
          <Link href="/academy" className="hover:text-foreground">
            Academy
          </Link>
          <span className="mx-2">/</span>
          <Link href="/academy/courses" className="hover:text-foreground">
            Kurzy
          </Link>
          <span className="mx-2">/</span>
          <Link href={`/academy/courses/${slug}`} className="hover:text-foreground">
            {lesson.course.title}
          </Link>
          <span className="mx-2">/</span>
          <span>{lesson.title}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <LessonVideoPlayer video={lesson.video} lessonTitle={lesson.title} />
            <article className="prose prose-slate max-w-none rounded-2xl border border-slate-200 bg-white p-6">
              {renderContent(lesson.content)}
            </article>
          </div>
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <AiLecturerPanel
              lessonTitle={lesson.title}
              lessonContent={lesson.content}
              courseTitle={lesson.course.title}
            />
          </aside>
        </div>
      </div>
    </>
  );
}
