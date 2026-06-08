import Image from "next/image";
import Link from "next/link";
import { Calendar, FlaskConical } from "lucide-react";
import type { V20StudyDisplay } from "@/lib/v20/studies/types";

export function V20StudyCard({ study }: { study: V20StudyDisplay }) {
  return (
    <article className="v20-study-card group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
      <Link href={`/studie/${study.slug}`} className="flex flex-1 flex-col">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
          <Image
            src={study.imageUrl}
            alt={study.titleCs}
            fill
            className="object-cover object-center transition duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
            {study.studyTypeLabel}
          </span>
        </div>
        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
            {study.specialtyCs}
          </p>
          <h3 className="mt-2 font-display text-lg font-semibold leading-snug text-[#021d33] group-hover:text-primary">
            {study.titleCs}
          </h3>
          <p className="mt-1 text-xs text-slate-500">{study.subtitleCs}</p>
          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-slate-600">
            {study.summaryCs}
          </p>
        </div>
      </Link>
      <footer className="flex items-center justify-between gap-2 border-t border-slate-100 px-4 py-3 text-xs text-slate-500 sm:px-5">
        <span className="inline-flex items-center gap-1 truncate">
          <FlaskConical className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {study.source.name}
        </span>
        <time className="inline-flex shrink-0 items-center gap-1" dateTime={study.publishedDate}>
          <Calendar className="h-3.5 w-3.5" aria-hidden />
          {study.publishedDateLabel}
        </time>
      </footer>
    </article>
  );
}
