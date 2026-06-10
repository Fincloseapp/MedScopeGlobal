"use client";

import type { V25ImageRegistryEntry } from "@/lib/v25/types";

type Props = {
  images: V25ImageRegistryEntry[];
  onSelect?: (image: V25ImageRegistryEntry) => void;
  selectedId?: string | null;
};

export function ImageTable({ images, onSelect, selectedId }: Props) {
  if (!images.length) {
    return (
      <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
        Zatím žádné obrázky v registru. Spusťte automatické doplnění.
      </p>
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
                    className="h-10 w-16 rounded border object-cover"
                  />
                </button>
              </td>
              <td className="px-4 py-3 font-medium">{img.title}</td>
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
