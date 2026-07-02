import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getJobById } from "@/lib/queries/career";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const job = await getJobById(id);
  return { title: job?.title ?? "Pracovní pozice" };
}

export default async function KarieraDetailPage({ params }: Props) {
  const { id } = await params;
  const job = await getJobById(id);
  if (!job) notFound();

  return (
    <div className="bg-[#fafcff]">
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <Link href="/kariera" className="text-sm text-[#005B96] hover:underline">
          ← Kariéra
        </Link>
        <p className="mt-4 text-[10px] uppercase tracking-wider text-[#005B96]">{job.company}</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-[#021d33]">{job.title}</h1>
        <p className="mt-2 text-sm text-slate-500">
          {[job.specialization, job.region, job.employment_type, job.salary_hint]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <div className="prose prose-slate mt-8 max-w-none">
          <p className="whitespace-pre-wrap">{job.description}</p>
          {job.requirements ? (
            <>
              <h2>Požadavky</h2>
              <p className="whitespace-pre-wrap">{job.requirements}</p>
            </>
          ) : null}
        </div>
        {(job.apply_url || job.contact_email) && (
          <div className="mt-8 flex flex-wrap gap-3">
            {job.apply_url ? (
              <a
                href={job.apply_url}
                className="rounded-full bg-[#005B96] px-5 py-2.5 text-sm font-semibold text-white"
                target="_blank"
                rel="noopener noreferrer"
              >
                Odpovědět na nabídku
              </a>
            ) : null}
            {job.contact_email ? (
              <a href={`mailto:${job.contact_email}`} className="text-sm text-[#005B96] font-semibold">
                {job.contact_email}
              </a>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
