import Link from "next/link";
import { AcademyPageHeader } from "@/components/academy/page-header";
import { listTextbooks } from "@/lib/academy/db";

export const revalidate = 120;

export default async function AcademyTextbooksPage() {
  const books = await listTextbooks(30);

  return (
    <>
      <AcademyPageHeader
        eyebrow="Učebnice"
        title="Digitální učebnice"
        description="Strukturované učební materiály pro medicínu."
      />
      <div className="mx-auto max-w-4xl px-4 py-10">
        {books.length > 0 ? (
          <ul className="space-y-3">
            {books.map((b) => (
              <li key={b.id}>
                <Link
                  href={`/academy/textbooks/${b.slug}`}
                  className="block rounded-xl border border-[#cfe1f3] bg-white px-5 py-4 hover:border-[#005B96]"
                >
                  <h2 className="font-semibold text-[#021d33]">{b.title}</h2>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-sm text-slate-500">Učebnice budou brzy publikovány.</p>
        )}
      </div>
    </>
  );
}
