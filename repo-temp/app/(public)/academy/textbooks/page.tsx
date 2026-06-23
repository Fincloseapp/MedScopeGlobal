import Link from "next/link";
import { AcademyPageHeader } from "@/components/academy/page-header";
import { listTextbooks } from "@/lib/academy/db";

export const revalidate = 120;

export default async function AcademyTextbooksPage() {
  const textbooks = await listTextbooks();

  return (
    <>
      <AcademyPageHeader
        eyebrow="Učebnice"
        title="Digitální učebnice"
        description="Strukturované učební texty pro LF a klinickou praxi."
      />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        {textbooks.length > 0 ? (
          <ul className="space-y-3">
            {textbooks.map((book) => (
              <li key={book.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <h2 className="font-display text-lg font-semibold">{book.title}</h2>
                <Link href={`/academy/textbooks/${book.slug}`} className="mt-2 inline-block text-sm text-[#005B96] hover:underline">
                  Číst →
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-sm text-slate-500">Učebnice se generují AI pipeline.</p>
        )}
      </div>
    </>
  );
}
