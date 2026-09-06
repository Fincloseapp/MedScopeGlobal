"use client";

import { DokumentaceWorkspace } from "@/components/lekari/dokumentace-workspace";

export function DokAppRecord({ locale }: { locale?: string }) {
  return (
    <div className="dok-app-record mx-auto w-full max-w-3xl px-3 pb-4 pt-2 sm:px-4">
      <DokumentaceWorkspace variant="app" locale={locale} />
    </div>
  );
}
