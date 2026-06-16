import Link from "next/link";
import { Clock, GraduationCap } from "lucide-react";
import type { AcademyCourse } from "@/types/academy";

const LEVEL_LABELS: Record<string, string> = {
  beginner: "Začátečník",
  intermediate: "Středně pokročilý",
  advanced: "Pokročilý",
};

export function CourseCard({ course }: { course: AcademyCourse }) {
  return (
    <Link
      href={`/academy/courses/${course.slug}`}
      className="group flex flex-col rounded-2xl border border-[#cfe1f3] bg-white p-5 shadow-[0_12px_30px_-24px_rgba(0,91,150,0.55)] transition hover:-translate-y-0.5 hover:border-[#005B96]/40"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#005B96]">
          {course.category ?? "Medicína"}
        </p>
        {course.xp_reward > 0 ? (
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
            +{course.xp_reward} XP
          </span>
        ) : null}
      </div>
      <h3 className="mt-2 font-display text-lg font-semibold text-[#021d33] group-hover:text-[#005B96]">
        {course.title}
      </h3>
      <p className="mt-2 flex-1 text-sm text-slate-600 line-clamp-3">
        {course.summary ?? course.description}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <GraduationCap className="h-3.5 w-3.5" />
          {LEVEL_LABELS[course.level] ?? course.level}
        </span>
        {course.duration_minutes > 0 ? (
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {course.duration_minutes} min
          </span>
        ) : null}
      </div>
    </Link>
  );
}
