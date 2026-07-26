"use client";

import { useEffect, useState } from "react";
import type { V25ImageRegistryEntry } from "@/lib/v25/types";
import { ImagePreview } from "./ImagePreview";
import { ImageTable } from "./ImageTable";

type Props = {
  images: V25ImageRegistryEntry[];
};

export function ImageCenterClient({ images }: Props) {
  const [selected, setSelected] = useState<V25ImageRegistryEntry | null>(images[0] ?? null);

  useEffect(() => {
    if (!images.length) {
      setSelected(null);
      return;
    }
    setSelected((prev) => {
      if (prev && images.some((img) => img.id === prev.id)) {
        return images.find((img) => img.id === prev.id) ?? images[0];
      }
      return images[0];
    });
  }, [images]);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <ImageTable images={images} onSelect={setSelected} selectedId={selected?.id ?? null} />
      </div>
      <ImagePreview image={selected} />
    </div>
  );
}
