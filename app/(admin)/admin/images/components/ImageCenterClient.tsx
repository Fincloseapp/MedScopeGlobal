"use client";

import { useState } from "react";
import type { V25ImageRegistryEntry } from "@/lib/v25/types";
import { ImagePreview } from "./ImagePreview";
import { ImageTable } from "./ImageTable";

type Props = {
  images: V25ImageRegistryEntry[];
};

export function ImageCenterClient({ images }: Props) {
  const [selected, setSelected] = useState<V25ImageRegistryEntry | null>(images[0] ?? null);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <ImageTable images={images} onSelect={setSelected} selectedId={selected?.id ?? null} />
      </div>
      <ImagePreview image={selected} />
    </div>
  );
}
