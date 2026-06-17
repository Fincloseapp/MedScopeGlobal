import { notFound } from "next/navigation";
import { AcademyPageHeader } from "@/components/academy/page-header";
import { getTextbookBySlug } from "@/lib/academy/db";

type Props = { params: Promise<{ slug: string }> };

type TextbookMeta = {
  chapters?: number | { title: string; summary?: string }[];
  author?: string;
  edition?: string;
};

const DEMO_CHAPTERS = [
  { title: "1. Úvod do anatomie", summary: "Základní pojmy, roviny a směry v lidském těle." },
  { title: "2. Kosterní systém", summary: "Lebka, páteř, hrudní koš a končetiny." },
  { title: "3. Svalový systém", summary: "Přehled hlavních svalových skupin a jejich funkcí." },
];

export default async function AcademyTextbookDetailPage({ params }: Props) {
  const { slug } = await params;
  const book = await getTextbookBySlug(slug);
  if (!book) notFound();

  const meta = (book.metadata ?? {}) as TextbookMeta;
  const chapters = Array.isArray(meta.chapters)
    ? meta.chapters
    : typeof meta.chapters === "number"
      ? DEMO_CHAPTERS.slice(0, meta.chapters)
      : DEMO_CHAPTERS;

  return (
    <>
      <AcademyPageHeader
        eyebrow="Učebnice"
        title={book.title}
        description={
          meta.author
            ? `Autor: ${meta.author}${meta.edition ? ` · ${meta.edition}. vydání` : ""}`
            : "Digitální učební materiál MedScope Academy."
        }
      />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {book.content_ref ? (
          <p className="mb-6 text-sm text-slate-600">Obsah: {book.content_ref}</p>
        ) : null}

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Kapitoly</p>
          <ol className="mt-4 space-y-4">
            {chapters.map((ch, i) => (
              <li key={i} className="rounded-lg border border-slate-100 p-4">
                <p className="font-medium text-[#021d33]">{ch.title}</p>
                {ch.summary ? <p className="mt-1 text-sm text-slate-600">{ch.summary}</p> : null}
              </li>
            ))}
          </ol>
        </section>

        <p className="mt-6 text-center text-xs text-slate-500">
          Plný interaktivní obsah kapitol — fáze 4.
        </p>
      </div>
    </>
  );
}
