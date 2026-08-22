import type { Metadata } from "next";
import Link from "next/link";
import { PrepShell } from "@/components/prep/prep-shell";
import { PREP_CHAPTERS } from "@/lib/prep/curriculum";
import { questionsForChapter } from "@/lib/prep/questions";
import { subjectLabel } from "@/lib/prijimacky/faculties-admissions";
import { buildV20PageMetadata } from "@/lib/v20/seo";

export const metadata: Metadata = buildV20PageMetadata({
  title: "Učení po kapitolách — MeDiprep",
  description: "Kapitoly biologie, chemie a fyziky s krátkým výkladem a mini testem. Příprava na přijímačky LF.",
  path: "/prep/uceni",
});

export default function PrepLearnIndexPage() {
  const groups = ["biologie", "chemie", "fyzika"] as const;
  return (
    <PrepShell active="/prep/uceni">
      <div className="mx-auto max-w-5xl space-y-10 px-4 py-10 sm:px-6">
        <header>
          <h1 className="font-display text-3xl font-semibold">Učení</h1>
          <p className="mt-2 max-w-2xl text-sm text-[#5a5348]">
            Každá kapitola má výklad na jednu obrazovku a osm otázek se zpětnou vazbou hned po kontrole. Až to sedí,
            jděte do časované simulace.
          </p>
        </header>
        {groups.map((subject) => (
          <section key={subject}>
            <h2 className="font-display text-xl font-semibold">{subjectLabel(subject)}</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {PREP_CHAPTERS.filter((c) => c.subject === subject).map((c) => (
                <Link
                  key={c.id}
                  href={`/prep/uceni/${c.id}`}
                  className="rounded-2xl border border-[#e0d5c4] bg-white p-5 hover:border-[#C45C26]/40"
                >
                  <p className="font-display text-lg font-semibold">{c.title}</p>
                  <p className="mt-2 line-clamp-3 text-sm text-[#5a5348]">{c.summary}</p>
                  <p className="mt-3 text-xs text-[#C45C26]">{questionsForChapter(c.id).length} otázek v bance</p>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </PrepShell>
  );
}
