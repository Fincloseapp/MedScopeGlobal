"use client";

import type { V25ImageRegistryEntry } from "@/lib/v25/types";

type Props = {
  images: V25ImageRegistryEntry[];
  onSelect?: (image: V25ImageRegistryEntry) => void;
  selectedId?: string | null;
};

function decodeTitle(title: string): string {
  return title
    .replace(/&#x201[cd];/gi, '"')
    .replace(/&#x201[89];/gi, "'")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#160;/g, " ");
}

export function ImageTable({ images, onSelect, selectedId }: Props) {
  if (!images.length) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
        <p className="font-medium text-[#021d33]">Registr je prázdný</p>
        <p className="mt-2">
          Spusťte „Automatické doplnění obrázků“ — pipeline vygeneruje cover (OpenAI / curated Unsplash /
          SVG fallback) a uloží ho do registru.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b bg-slate-50 text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Náhled</th>
            <th className="px-4 py-3">Titulek</th>
            <th className="px-4 py-3">Sekce</th>
            <th className="px-4 py-3">Typ</th>
            <th className="px-4 py-3">Zdroj</th>
            <th className="px-4 py-3">Vytvořeno</th>
          </tr>
        </thead>
        <tbody>
          {images.map((img) => (
            <tr
              key={img.id}
              className={`border-b last:border-0 ${selectedId === img.id ? "bg-primary/5" : "hover:bg-slate-50"}`}
            >
              <td className="px-4 py-2">
                <button type="button" onClick={() => onSelect?.(img)} className="block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.publicUrl}
                    alt=""
                    className="h-10 w-16 rounded border bg-[#f0f7ff] object-cover"
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.opacity = "0.35";
                    }}
                  />
                </button>
              </td>
              <td className="px-4 py-3 font-medium">{decodeTitle(img.title)}</td>
              <td className="px-4 py-3 text-muted-foreground">{img.section}</td>
              <td className="px-4 py-3">{img.imageType}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    img.source === "generator"
                      ? "bg-violet-100 text-violet-800"
                      : img.source === "selector"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {img.source}
                </span>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {new Date(img.createdAt).toLocaleString("cs-CZ")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
