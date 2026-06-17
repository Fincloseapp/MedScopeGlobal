import type { Metadata } from "next";
import { AcademyPageHeader } from "@/components/academy/page-header";
import { CourseCard } from "@/components/academy/course-card";
import { getCourseVideoFlags, listPublishedCourses } from "@/lib/academy/db";
import { buildV20PageMetadata } from "@/lib/v20/seo";

export const revalidate = 120;

export const metadata: Metadata = buildV20PageMetadata({
  title: "Kurzy — MedScope Academy",
  description: "Přehled publikovaných videokurzů MedScope Academy pro studenty a lékaře.",
  path: "/academy/courses",
});

export default async function AcademyCoursesPage() {
  const courses = await listPublishedCourses();
  const flags = await getCourseVideoFlags(courses.map((c) => c.id));

  return (
    <>
      <AcademyPageHeader
        eyebrow="MedScope Academy"
        title="Kurzy"
        description="Publikované vzdělávací kurzy s lekcemi a kvízy."
      />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {courses.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                hasVideo={flags[course.id]?.hasVideo}
                videoLessonCount={flags[course.id]?.videoLessonCount}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            Zatím žádné publikované kurzy.
          </div>
        )}
      </div>
    </>
  );
}
