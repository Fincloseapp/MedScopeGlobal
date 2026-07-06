"use client";

import { useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { PublicStudentMaterial } from "@/lib/studenti/materials";
import { PUBLIC_LEGAL_NOTICE, PUBLIC_SOURCE_LABEL } from "@/lib/studenti/materials-anonymize";

export function MaterialPdfViewer({ material }: { material: PublicStudentMaterial }) {
  const viewUrl = `/api/studenti/materialy/${material.id}/view#toolbar=0&navpanes=0&scrollbar=1`;

  const blockContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  if (!material.can_preview) {
    return (
      <div className="rounded-2xl border border-[#cfe1f3] bg-white p-8 text-center">
        <p className="text-sm text-slate-600">
          Náhled je dostupný pouze pro PDF soubory. Tento materiál ({material.file_type ?? "soubor"})
          nelze zobrazit v prohlížeči.
        </p>
        <Link
          href="/studenti/materialy"
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#005B96] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Zpět na materiály
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[#005B96]/70">
            {PUBLIC_SOURCE_LABEL}
          </p>
          <h1 className="mt-1 font-display text-xl font-semibold text-[#021d33] sm:text-2xl">
            {material.display_title}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {material.subject}
            {material.rocnik !== null && material.rocnik > 0 ? ` · ${material.rocnik}. ročník` : ""}
          </p>
        </div>
        <Link
          href="/studenti/materialy"
          className="inline-flex items-center gap-1 rounded-full border border-[#cfe1f3] bg-white px-4 py-2 text-sm font-medium text-[#005B96] transition hover:border-[#005B96]/30"
        >
          <ArrowLeft className="h-4 w-4" />
          Zpět
        </Link>
      </div>

      <div
        className="overflow-hidden rounded-2xl border border-[#cfe1f3] bg-slate-100 shadow-[0_12px_30px_-24px_rgba(0,91,150,0.55)]"
        onContextMenu={blockContextMenu}
      >
        <iframe
          src={viewUrl}
          title={material.display_title}
          className="h-[min(80vh,900px)] w-full bg-white"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>

      <p className="text-xs leading-6 text-slate-500">{PUBLIC_LEGAL_NOTICE}</p>
    </div>
  );
}
