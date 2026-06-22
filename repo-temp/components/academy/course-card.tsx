import Link from "next/link";
import { Clock, GraduationCap, PlayCircle, Sparkles, Unlock } from "lucide-react";
import { formatFreePreviewLabel, getFreePreviewLessonCount } from "@/lib/academy/preview";
import type { AcademyCourse } from "@/types/academy";

const LEVEL_LABELS: Record<string, string> = {
  beginner: "Začátečník",
  intermediate: "Středně pokročilý",
  advanced: "Pokročilý",
  priprava: "Příprava na přijímačky",
};

const CATEGORY_LABELS: Record<string, string> = {
  prijimacky: "Přijímačky LF",
};

export function CourseCard({
  course,
  hasVideo,
  videoLessonCount,
  lessonCount,
  showFreePreview = false,
}: {
  course: AcademyCourse;
  hasVideo?: boolean;
  videoLessonCount?: number;
  /** Published lesson count when known (e.g. course detail) */
  lessonCount?: number;
  showFreePreview?: boolean;
}) {
  const meta = (course.metadata ?? {}) as { has_video?: boolean; is_free?: boolean };
  const showVideo = hasVideo ?? meta.has_video ?? false;
  const freePreviewLabel =
    lessonCount && lessonCount > 0
      ? formatFreePreviewLabel(lessonCount)
      : "První lekce zdarma (≈30 %)";
  const freeCount = lessonCount ? getFreePreviewLessonCount(lessonCount) : 1;

  return (
    <Link
      href={`/academy/courses/${course.slug}`}
      className="block rounded-2xl border border-[#cfe1f3] bg-white p-5 shadow-[0_12px_30px_-24px_rgba(0,91,150,0.55)] transition hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          {course.category ? (
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#005B96]">
              {CATEGORY_LABELS[course.category] ?? course.category}
            </p>
          ) : null}
          <h3 className="mt-1 font-display text-lg font-semibold text-[#021d33]">{course.title}</h3>
        </div>
        <GraduationCap className="h-5 w-5 shrink-0 text-[#005B96]/60" />
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-slate-600">
        {course.summary ?? course.description}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
          {LEVEL_LABELS[course.level] ?? course.level}
        </span>
        {lessonCount != null && lessonCount > 0 ? (
          <span>{lessonCount} lekcí</span>
        ) : null}
        {course.duration_minutes > 0 ? (
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            ≈ {course.duration_minutes} min
          </span>
        ) : null}
        {course.xp_reward > 0 ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 font-semibold text-amber-800">
            <Sparkles className="h-3 w-3" aria-hidden />
            +{course.xp_reward} XP
          </span>
        ) : null}
        {showVideo ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f4fc] px-2 py-0.5 font-medium text-[#005B96]">
            <PlayCircle className="h-3 w-3" aria-hidden />
            Video{videoLessonCount ? ` · ${videoLessonCount}` : ""}
          </span>
        ) : null}
        {(showFreePreview || meta.is_free) ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-800">
            <Unlock className="h-3 w-3" aria-hidden />
            {freeCount} zdarma
          </span>
        ) : null}
      </div>
      {showFreePreview ? (
        <p className="mt-2 text-[11px] leading-snug text-emerald-700">{freePreviewLabel}</p>
      ) : null}
    </Link>
  );
}
