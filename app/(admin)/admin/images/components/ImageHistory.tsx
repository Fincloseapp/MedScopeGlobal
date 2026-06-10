import type { V25ImageRegistryEntry } from "@/lib/v25/types";

type Props = {
  images: V25ImageRegistryEntry[];
};

export function ImageHistory({ images }: Props) {
  const recent = [...images]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 12);

  return (
    <div className="rounded-xl border bg-white p-4">
      <h3 className="font-semibold text-[#021d33]">Historie přiřazení</h3>
      <ul className="mt-3 space-y-2 text-sm">
        {recent.length === 0 ? (
          <li className="text-muted-foreground">Zatím bez záznamů</li>
        ) : (
          recent.map((img) => (
            <li key={img.id} className="flex items-center justify-between gap-2 border-b pb-2 last:border-0">
              <span className="truncate font-medium">{img.title}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {new Date(img.updatedAt).toLocaleString("cs-CZ")}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
