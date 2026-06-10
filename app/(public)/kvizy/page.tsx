import Link from "next/link";
import type { Metadata } from "next";
import { listV24Quizzes } from "@/lib/v24/quizzes";
import { buildV20PageMetadata } from "@/lib/v20/seo";

export const metadata: Metadata = buildV20PageMetadata({
  title: "Kvízy a studijní hry",
  description: "Medicínské kvízy — farmakologie, anatomie, klinické scénáře. Česká verze MedScopeGlobal v24.",
  path: "/kvizy",
});

export default function KvizyPage() {
  const quizzes = listV24Quizzes();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-3xl font-semibold text-[#021d33]">Kvízy a studijní hry</h1>
      <p className="mt-2 text-slate-600">v24.0 — příprava na LF a klinickou praxi.</p>
      <ul className="mt-8 space-y-4">
        {quizzes.map((q) => (
          <li key={q.slug}>
            <Link
              href={`/kvizy/${q.slug}`}
              className="block rounded-xl border border-slate-200 bg-white p-5 hover:border-sky-200"
            >
              <span className="font-semibold text-[#005B96]">{q.title}</span>
              <span className="mt-1 block text-xs text-slate-500">{q.type}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
