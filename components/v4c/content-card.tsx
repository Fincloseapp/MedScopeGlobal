import Link from "next/link";
import { PublicModuleImage } from "@/components/v25/public-module-image";



export function V4cContentCard({

  href,

  title,

  meta,

  summary,

  badge,

  imageUrl,

  imageAlt,

}: {

  href: string;

  title: string;

  meta?: string;

  summary?: string | null;

  badge?: string;

  imageUrl?: string | null;

  imageAlt?: string;

}) {

  return (

    <Link

      href={href}

      prefetch

      className="group block overflow-hidden rounded-2xl border border-[#cfe1f3] bg-white transition hover:-translate-y-0.5 hover:shadow-md"

    >

      {imageUrl ? (

        <div className="relative aspect-[16/9] bg-slate-100">

          <PublicModuleImage

            src={imageUrl}

            alt={imageAlt ?? title}

            className="object-cover transition group-hover:scale-[1.02]"

            sizes="(max-width: 640px) 100vw, 50vw"

          />

        </div>

      ) : null}

      <div className="p-5">

        {badge ? (

          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#005B96]">{badge}</span>

        ) : null}

        <h3 className="mt-1 font-display text-lg font-semibold text-[#021d33] group-hover:text-primary">

          {title}

        </h3>

        {meta ? <p className="mt-1 text-xs text-slate-500">{meta}</p> : null}

        {summary ? <p className="mt-2 line-clamp-3 text-sm text-slate-600">{summary}</p> : null}

      </div>

    </Link>

  );

}


