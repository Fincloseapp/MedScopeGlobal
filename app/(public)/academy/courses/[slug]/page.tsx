import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AcademyPageHeader } from "@/components/academy/page-header";
import { getCourseBySlug } from "@/lib/academy/db";
import { buildV20PageMetadata } from "@/lib/v20/seo";

export const revalidate = 120;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) {
    return buildV20PageMetadata({
      title: "Kurz nenalezen",
      description: "Požadovaný kurz v MedScope Academy nebyl nalezen.",
      path: `/academy/courses/${slug}`,
    });
  }
  return buildV20PageMetadata({
    title: `${course.title} — MedScope Academy`,
    description: course.summary ?? course.description,
    path: `/academy/courses/${slug}`,
  });
}

export default async function AcademyCourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  return (
    <>
      <AcademyPageHeader
        eyebrow="Kurz"
        title={course.title}
        description={course.summary ?? course.description}
        ctaHref="/academy/courses"
        ctaLabel="Zpět na kurzy"
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
          <span>{course.title}</span>
        </nav>

        {course.lessons.length > 0 ? (
          <ol className="space-y-3">
            {course.lessons.map((lesson, i) => (
              <li
                key={lesson.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3"
              >
                <div>
                  <p className="text-xs text-slate-500">Lekce {i + 1}</p>
                  <p className="font-medium text-[#021d33]">{lesson.title}</p>
                </div>
                {lesson.duration_minutes > 0 ? (
                  <span className="text-xs text-slate-500">{lesson.duration_minutes} min</span>
                ) : null}
              </li>
            ))}
          </ol>
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
            Tento kurz zatím nemá publikované lekce.
          </p>
        )}
      </div>
    </>
  );
}
