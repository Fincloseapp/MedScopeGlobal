"use client";

import type { V25ImageRegistryEntry } from "@/lib/v25/types";

type Props = {
  image: V25ImageRegistryEntry | null;
};

export function ImagePreview({ image }: Props) {
  if (!image) {
    return (
      <div className="flex h-full min-h-[280px] items-center justify-center rounded-xl border border-dashed bg-slate-50 p-6 text-sm text-muted-foreground">
        Vyberte obrázek v tabulce pro náhled
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Náhled</p>
      <div className="mt-3 overflow-hidden rounded-lg border bg-[#f0f7ff]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image.publicUrl} alt={image.title} className="w-full object-cover" />
      </div>
      <dl className="mt-4 grid gap-2 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">Titulek</dt>
          <dd className="font-medium">{image.title}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Sekce / slug</dt>
          <dd>
            {image.section} / {image.slug}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Styl</dt>
          <dd>{image.stylePassed ? "Schváleno (neutrální · evropský · profesionální)" : "Zamítnuto"}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">URL</dt>
          <dd className="break-all">
            <a href={image.publicUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              {image.publicUrl}
            </a>
          </dd>
        </div>
      </dl>
    </div>
  );
}
