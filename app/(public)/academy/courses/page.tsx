import type { Metadata } from "next";
import { AcademyPageHeader } from "@/components/academy/page-header";
import { CourseCard } from "@/components/academy/course-card";
import { FreePreviewBanner } from "@/components/academy/free-preview-banner";
import { PrijimackyPrepHub } from "@/components/prijimacky/prep-hub";
import { getCourseVideoFlags, listPublishedCourses } from "@/lib/academy/db";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";

export const revalidate = 120;

type Props = {
  searchParams: Promise<{ category?: string; audience?: string; level?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const isPrep =
    params.category === "prijimacky" ||
    params.audience === "prijimacky" ||
    params.level === "priprava";

  if (isPrep) {
    return await buildLocalizedV20PageMetadata({
      title: "Příprava na přijímačky LF — MedScope Academy",
      description:
        "Kurzy a self-testy z biologie, chemie a fyziky pro maturanty gymnázií + termíny přihlášek na české lékařské fakulty.",
      path: "/academy/courses?category=prijimacky",
    });
  }

  return await buildLocalizedV20PageMetadata({
    title: "Kurzy — MedScope Academy",
    description: "Přehled publikovaných videokurzů MedScope Academy pro studenty a lékaře.",
    path: "/academy/courses",
  });
}

export default async function AcademyCoursesPage({ searchParams }: Props) {
  const params = await searchParams;
  const isPrep =
    params.category === "prijimacky" ||
    params.audience === "prijimacky" ||
    params.level === "priprava";

  const courses = await listPublishedCourses(100, {
    category: params.category,
    audience: params.audience,
    level: params.level,
    prepOnly: isPrep,
  });
  const flags = await getCourseVideoFlags(courses.map((c) => c.id));

  if (isPrep) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <FreePreviewBanner totalLessons={3} className="mb-8" />
        <PrijimackyPrepHub courses={courses} flags={flags} />
      </div>
    );
  }

  return (
    <>
      <AcademyPageHeader
        eyebrow="MedScope Academy"
        title="Kurzy"
        description="Publikované vzdělávací kurzy s lekcemi, kvízy a XP odměnami."
      />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <FreePreviewBanner totalLessons={3} className="mb-8" />
        {courses.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                hasVideo={flags[course.id]?.hasVideo}
                videoLessonCount={flags[course.id]?.videoLessonCount}
                showFreePreview
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
