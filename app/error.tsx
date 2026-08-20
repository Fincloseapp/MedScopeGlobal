"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[MedScopeGlobal]", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-start justify-center gap-4 px-4 py-16">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#005B96]">
        MedScopeGlobal.com
      </p>
      <h1 className="font-display text-2xl font-semibold text-[#021d33]">
        Stránka se nenačetla
      </h1>
      <p className="text-sm text-slate-600">
        Došlo k chybě v prohlížeči. Obnovte stránku, nebo se vraťte na úvod.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-lg bg-[#005B96] px-4 py-2 text-sm font-semibold text-white hover:bg-[#004a7a]"
        >
          Obnovit
        </button>
        <Link
          href="/"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-[#021d33] hover:bg-slate-50"
        >
          Domů
        </Link>
      </div>
    </main>
  );
}
