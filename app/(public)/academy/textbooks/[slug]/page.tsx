import { notFound } from "next/navigation";
import { AcademyPageHeader } from "@/components/academy/page-header";
import { getTextbookBySlug } from "@/lib/academy/db";

type Props = { params: Promise<{ slug: string }> };

export default async function AcademyTextbookDetailPage({ params }: Props) {
  const { slug } = await params;
  const book = await getTextbookBySlug(slug);
  if (!book) notFound();

  return (
    <>
      <AcademyPageHeader eyebrow="Učebnice" title={book.title} description="Digitální učební materiál MedScope Academy." />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {book.content_ref ? (
          <p className="text-sm text-slate-600">Obsah: {book.content_ref}</p>
        ) : (
          <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            Plný obsah učebnice bude dostupný ve fázi 3.
          </p>
        )}
      </div>
    </>
  );
}
