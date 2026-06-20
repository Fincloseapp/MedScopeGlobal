import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PlayCircle } from "lucide-react";
import { AcademyPageHeader } from "@/components/academy/page-header";
import { AiLecturerPanel } from "@/components/academy/ai-lecturer-panel";
import { TtsListenButton } from "@/components/tts/tts-listen-button";
import { LessonMetadataBlock } from "@/components/academy/lesson-metadata-block";
import { LessonVideoWithConversion } from "@/components/v38/lesson-video-with-conversion";
import { getReaderContext } from "@/lib/auth/reader-context";
import { getCourseBySlug, getLessonByIdOrSlug } from "@/lib/academy/db";
import { buildV20PageMetadata } from "@/lib/v20/seo";

import { extractSlideshowManifest } from "@/lib/v25/video/content-slideshow";

function buildLessonListenText(
  title: string,
  content: string,
  contentJson: Record<string, unknown>
): string {
  const manifest = extractSlideshowManifest(contentJson, null);
  const parts = [title, content];
  if (manifest?.slides?.length) {
    parts.push(...manifest.slides.map((s) => `${s.title}. ${s.body}`));
  } else if (typeof contentJson.voiceover_text === "string") {
    parts.push(contentJson.voiceover_text);
  }
  return parts.filter(Boolean).join("\n\n");
}

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
      <p key={i} className="leading-7 text-slate-700">
        {block.replace(/\*\*/g, "")}
      </p>
    );
  });
}

export default async function AcademyLessonPage({ params }: Props) {
  const { slug, lessonId } = await params;
  const lesson = await getLessonByIdOrSlug(slug, lessonId);
  if (!lesson) notFound();

  const course = await getCourseBySlug(slug);
  const lessons = course?.lessons ?? [];
  const { isVip } = await getReaderContext();
  const lessonIndex = lessons.findIndex((l) => l.slug === lesson.slug || l.id === lesson.id);
  const listenText = buildLessonListenText(
    lesson.title,
    lesson.content,
    (lesson.content_json ?? {}) as Record<string, unknown>
  );

  return (
    <>
      <AcademyPageHeader
        eyebrow={lesson.course.title}
        title={lesson.title}
        description={`Videokurz s AI lektorem · ${lesson.duration_minutes} min`}
        ctaHref={`/academy/courses/${slug}`}
        ctaLabel="Zpět na kurz"
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <nav className="mb-4 text-sm text-muted-foreground" aria-label="Drobečková navigace">
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
          <span className="text-foreground">{lesson.title}</span>
        </nav>

        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            {lesson.duration_minutes} min
          </span>
          {lesson.video ? (
            <>
              <span className="rounded-full bg-[#e8f4fc] px-3 py-1 text-xs font-medium text-[#005B96]">
                AI video
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                AI lektor
              </span>
            </>
          ) : null}
        </div>

        <div className="grid gap-8 xl:grid-cols-[220px_1fr_320px]">
          {lessons.length > 0 ? (
            <aside className="hidden xl:block">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#005B96]">
                Lekce kurzu
              </p>
              <ol className="space-y-1">
                {lessons.map((l, i) => {
                  const active = l.slug === lesson.slug || l.id === lesson.id;
                  return (
                    <li key={l.id}>
                      <Link
                        href={`/academy/courses/${slug}/lessons/${l.slug}`}
                        className={`block rounded-lg px-3 py-2 text-sm transition ${
                          active
                            ? "bg-[#e8f4fc] font-medium text-[#005B96]"
                            : "text-slate-600 hover:bg-slate-50 hover:text-[#021d33]"
                        }`}
                      >
                        <span className="text-xs text-slate-400">{i + 1}.</span> {l.title}
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </aside>
          ) : null}

          <div className="min-w-0 space-y-6">
            <LessonVideoWithConversion
              video={lesson.video}
              lessonTitle={lesson.title}
              lessonContent={lesson.content}
              courseTopic={lesson.course.title}
              contentJson={(lesson.content_json ?? {}) as Record<string, unknown>}
              isVip={isVip}
              lessonIndex={lessonIndex >= 0 ? lessonIndex : 0}
            />
            <LessonMetadataBlock
              title={lesson.title}
              content={lesson.content}
              contentJson={(lesson.content_json ?? {}) as Record<string, unknown>}
              videoMetadata={(lesson.video?.metadata ?? null) as Record<string, unknown> | null}
              videoTitle={lesson.video?.title}
              videoDescription={String(
                (lesson.video?.metadata as Record<string, unknown> | undefined)?.description ?? ""
              )}
              slideshowTopic={
                (
                  (lesson.content_json as Record<string, unknown> | undefined)?.slideshow as
                    | { topic?: string; title?: string }
                    | undefined
                )?.topic ??
                (
                  (lesson.video?.metadata as Record<string, unknown> | undefined)?.slideshow as
                    | { topic?: string }
                    | undefined
                )?.topic
              }
            />
            <article className="prose prose-slate max-w-none space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="not-prose mb-4 flex flex-wrap items-center gap-3">
                <TtsListenButton text={listenText} label="Poslech celé lekce" />
              </div>
              {renderContent(lesson.content)}
            </article>
          </div>

          <aside className="xl:sticky xl:top-20 xl:self-start">
            <AiLecturerPanel
              lessonTitle={lesson.title}
              lessonContent={lesson.content}
              courseTitle={lesson.course.title}
            />
          </aside>
        </div>

        {lessons.length > 1 ? (
          <nav className="mt-8 xl:hidden" aria-label="Lekce kurzu">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#005B96]">
              Další lekce
            </p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {lessons.map((l) => (
                <Link
                  key={l.id}
                  href={`/academy/courses/${slug}/lessons/${l.slug}`}
                  className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium ${
                    l.slug === lesson.slug
                      ? "border-[#005B96] bg-[#e8f4fc] text-[#005B96]"
                      : "border-slate-200 text-slate-600"
                  }`}
                >
                  {l.video_asset_id ? <PlayCircle className="h-3 w-3" /> : null}
                  {l.title}
                </Link>
              ))}
            </div>
          </nav>
        ) : null}
      </div>
    </>
  );
}
