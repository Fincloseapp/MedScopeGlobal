import Link from "next/link";
import Image from "next/image";
import { getLegislationList } from "@/lib/queries/v4c/legislation";
import { getUniversityNewsList } from "@/lib/queries/v4c/university-news";
import { getDrugNewsList } from "@/lib/queries/v4c/drug-news";
import { V21_MEDICAL_IMAGES } from "@/lib/v21/images";
import { formatCsDate } from "@/lib/v21/enrich";

export async function V21HomepageSections() {
  const [legislation, universities, drugs] = await Promise.all([
    getLegislationList(undefined, 3),
    getUniversityNewsList(),
    getDrugNewsList(),
  ]);
  const uniLatest = universities.slice(0, 3);
  const drugLatest = drugs.slice(0, 3);

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl font-semibold text-[#021d33]">Nejnovější legislativa</h2>
          <Link href="/legislativa" className="text-sm font-medium text-primary">
            Vše →
          </Link>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {legislation.map((item) => (
            <Link
              key={item.id}
              href={`/legislativa/${item.slug}`}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative aspect-[16/10] bg-slate-100">
                <Image
                  src={item.image_url ?? V21_MEDICAL_IMAGES.legislation}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="33vw"
                />
              </div>
              <div className="p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">{item.category}</p>
                <h3 className="mt-1 font-semibold text-[#021d33] group-hover:text-primary">{item.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-slate-600">{item.summary}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl font-semibold text-[#021d33]">Nejnovější lékové novinky</h2>
          <Link href="/leky/novinky" className="text-sm font-medium text-primary">
            Vše →
          </Link>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {drugLatest.map((item) => (
            <Link
              key={item.id}
              href={`/leky/novinky/${item.slug}`}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">{item.agency ?? "SÚKL"}</p>
              <h3 className="mt-1 font-semibold text-[#021d33] group-hover:text-primary">{item.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-slate-600">{item.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl font-semibold text-[#021d33]">Novinky z univerzit</h2>
          <div className="flex gap-3 text-sm font-medium">
            <Link href="/studium/univerzity" className="text-primary">
              Fakulty LF →
            </Link>
            <Link href="/novinky/univerzity" className="text-primary">
              Novinky →
            </Link>
          </div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {uniLatest.map((item) => (
            <Link
              key={item.id}
              href={`/novinky/univerzity/${item.slug}`}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5"
            >
              <div className="relative aspect-[16/10] bg-slate-100">
                <Image
                  src={item.image_url ?? V21_MEDICAL_IMAGES.university}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="33vw"
                />
              </div>
              <div className="p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                  {item.university ?? "LF"}
                </p>
                <h3 className="mt-1 font-semibold text-[#021d33] group-hover:text-primary">{item.title}</h3>
                <p className="mt-1 text-xs text-slate-500">{formatCsDate(item.published_date)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
