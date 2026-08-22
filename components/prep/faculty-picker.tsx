"use client";

import { useEffect } from "react";
import { PREP_FACULTIES } from "@/lib/prep/faculties";
import { usePrepProgress } from "@/components/prep/progress-store";

export function FacultyPicker({ current }: { current?: string | null }) {
  const { progress, setFaculty } = usePrepProgress();
  const selected = current ?? progress.facultySlug;

  useEffect(() => {
    if (current) setFaculty(current);
  }, [current, setFaculty]);

  return (
    <div className="flex flex-wrap gap-2">
      {PREP_FACULTIES.map((f) => {
        const on = selected === f.slug;
        return (
          <button
            key={f.slug}
            type="button"
            onClick={() => setFaculty(f.slug)}
            className={`rounded-full px-3 py-1.5 text-sm ${
              on ? "bg-[#1A2332] text-white" : "bg-white text-[#3d4a5c] ring-1 ring-[#e0d5c4]"
            }`}
          >
            {f.shortName}
          </button>
        );
      })}
    </div>
  );
}
