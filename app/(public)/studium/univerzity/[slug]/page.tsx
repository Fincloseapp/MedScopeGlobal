import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getFacultyBySlug, getFacultyForPublicUi } from "@/lib/v25/universities";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const staticFaculty = getFacultyBySlug(slug);
  const live = await getFacultyForPublicUi(slug);
  const name = live?.name ?? staticFaculty?.name ?? "Fakulta";
  return { title: `${name} — studium medicíny` };
}

export default async function FacultyDetailPage({ params }: Props) {
  const { slug } = await params;
  const staticFaculty = getFacultyBySlug(slug);
  if (!staticFaculty) notFound();

  const faculty = (await getFacultyForPublicUi(slug))!;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <nav className="text-sm text-muted-foreground">
        <Link href="/studium/univerzity" className="hover:text-foreground">
          ← Lékařské fakulty
        </Link>
      </nav>

      <div className="mt-4 rounded-2xl bg-[#f0f7ff] p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">{faculty.city}</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-[#021d33]">{faculty.name}</h1>
        {faculty.description ? (
          <p className="mt-3 text-muted-foreground">{faculty.description}</p>
        ) : (
          <p className="mt-3 text-muted-foreground">
            Oficiální informace o studiu, přijímačkách a aktualitách na webu fakulty.
          </p>
        )}
      </div>

      <dl className="mt-8 grid gap-4 rounded-2xl border bg-white p-6 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium uppercase text-muted-foreground">Web</dt>
          <dd className="mt-1">
            <a href={faculty.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              {faculty.url}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase text-muted-foreground">Dostupnost webu</dt>
          <dd className="mt-1">
            {faculty.ok === false ? "Web momentálně nedostupný" : faculty.ok ? "Web fakulty dostupný" : "—"}
          </dd>
        </div>
        {faculty.fetchedAt ? (
          <div>
            <dt className="text-xs font-medium uppercase text-muted-foreground">Poslední kontrola</dt>
            <dd className="mt-1">{new Date(faculty.fetchedAt).toLocaleString("cs-CZ")}</dd>
          </div>
        ) : null}
        {faculty.newArticles != null ? (
          <div>
            <dt className="text-xs font-medium uppercase text-muted-foreground">Novinky (odhad)</dt>
            <dd className="mt-1">{faculty.newArticles}</dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/studium/prijimacky" className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Přijímačky
        </Link>
        <Link href="/medicina/studium" className="rounded-full border px-4 py-2 text-sm font-medium">
          Studijní obsah
        </Link>
      </div>
    </div>
  );
}
