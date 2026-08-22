"use client";

import { Camera } from "lucide-react";

export function UploadReportScreen({
  inputRef,
  uploading,
  online,
  disabled,
  onPick,
}: {
  inputRef: { current: HTMLInputElement | null };
  uploading: boolean;
  online: boolean;
  disabled?: boolean;
  onPick: (files: FileList | null) => void;
}) {
  return (
    <div className="shrink-0 border-t-2 border-slate-300 bg-white px-4 py-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        capture="environment"
        multiple
        className="sr-only"
        onChange={(e) => onPick(e.target.files)}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading || disabled}
        className="inline-flex min-h-14 w-full items-center justify-center rounded-full bg-[#2D7FF9] px-6 text-xl font-semibold text-white hover:bg-[#1f6ae0] disabled:opacity-60"
      >
        <Camera className="mr-2 h-6 w-6" />
        {uploading ? "Nahrávám a čtu zprávu…" : "Nahrát zprávu"}
      </button>
      <p className="mt-2 text-center text-base leading-6 text-slate-700">
        {online
          ? "Foto celé stránky nebo PDF z e-mailu. Soubor zůstane uložený i když čtení selže."
          : "Jste offline. Soubor se nahraje po připojení, pokud okno necháte otevřené."}
      </p>
    </div>
  );
}
