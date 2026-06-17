import type { Metadata } from "next";
import { AcademyPageHeader } from "@/components/academy/page-header";
import { CourseCard } from "@/components/academy/course-card";
import { getCourseVideoFlags, listPublishedCourses } from "@/lib/academy/db";
import { buildV20PageMetadata } from "@/lib/v20/seo";

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
    return buildV20PageMetadata({
      title: "Přípravné kurzy — MedScope Academy",
      description: "Kurzy pro zájemce o studium medicíny a přípravu na přijímačky LF.",
      path: "/academy/courses?category=prijimacky",
    });
  }

  return buildV20PageMetadata({
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

  return (
    <>
      <AcademyPageHeader
        eyebrow="MedScope Academy"
        title={isPrep ? "Přípravné kurzy na přijímačky LF" : "Kurzy"}
        description={
          isPrep
            ? "Biologie, chemie, fyzika, strategie testu a pohovor — pro zájemce o studium medicíny."
            : "Publikované vzdělávací kurzy s lekcemi a kvízy."
        }
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
            {isPrep
              ? "Přípravné kurzy se načítají — zkuste obnovit stránku za chvíli."
              : "Zatím žádné publikované kurzy."}
          </div>
        )}
      </div>
    </>
  );
}
