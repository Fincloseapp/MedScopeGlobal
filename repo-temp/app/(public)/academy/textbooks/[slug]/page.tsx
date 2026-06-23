import Link from "next/link";
import { notFound } from "next/navigation";
import { AcademyPageHeader } from "@/components/academy/page-header";
import { TextbookChapterReader, type TextbookChapter } from "@/components/academy/textbook-chapter-reader";
import { getTextbookBySlug } from "@/lib/academy/db";
import { buildV20PageMetadata } from "@/lib/v20/seo";

export const revalidate = 120;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const book = await getTextbookBySlug(slug);
  if (!book) {
    return buildV20PageMetadata({
      title: "Učebnice nenalezena",
      description: "Požadovaná učebnice nebyla nalezena.",
      path: `/academy/textbooks/${slug}`,
    });
  }
  return buildV20PageMetadata({
    title: `${book.title} — digitální učebnice`,
    description: "Interaktivní kapitoly pro studenty medicíny.",
    path: `/academy/textbooks/${slug}`,
  });
}

export default async function AcademyTextbookReaderPage({ params }: Props) {
  const { slug } = await params;
  const book = await getTextbookBySlug(slug);
  if (!book) notFound();

  const meta = (book.metadata ?? {}) as { chapters?: TextbookChapter[] };
  const chapters = meta.chapters ?? [];

  return (
    <>
      <AcademyPageHeader
        eyebrow="Učebnice"
        title={book.title}
        description="Čtěte kapitolu po kapitole s ilustracemi a bohatým formátováním."
        ctaHref="/academy/textbooks"
        ctaLabel="Zpět na učebnice"
      />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <nav className="mb-6 text-sm text-muted-foreground">
          <Link href="/academy" className="hover:text-foreground">
            Academy
          </Link>
          <span className="mx-2">/</span>
          <Link href="/academy/textbooks" className="hover:text-foreground">
            Učebnice
          </Link>
          <span className="mx-2">/</span>
          <span>{book.title}</span>
        </nav>
        <TextbookChapterReader textbookSlug={book.slug} textbookTitle={book.title} chapters={chapters} />
      </div>
    </>
  );
}
