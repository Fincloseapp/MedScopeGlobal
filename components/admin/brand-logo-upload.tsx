"use client";

import { useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MedScopeLogo } from "@/components/brand/medscope-logo";
import { MEDSCOPE_LOGO } from "@/lib/brand/logo";

const VARIANTS = [
  { id: "transparent", label: "Logo_Transparent.png — světlé pozadí" },
  { id: "print", label: "Logo_Print.png — tisk / PDF" },
  { id: "negative", label: "Logo_Negative.png — dark mode" },
] as const;

export function BrandLogoUploadPanel() {
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function upload(variant: string, file: File) {
    setLoading(variant);
    setMessage(null);
    try {
      const fd = new FormData();
      fd.append("variant", variant);
      fd.append("file", file);
      const res = await fetch("/api/admin/brand/logos", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      setMessage(`Nahráno: ${json.filename}`);
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6">
      <div>
        <h2 className="font-display text-lg font-bold text-[#021d33]">Logo MedScopeGlobal</h2>
        <p className="mt-1 text-sm text-slate-600">
          Zdroj na disku D: <code className="text-xs">D:\MedScopeGlobal\logo\</code> →{" "}
          <code className="text-xs">public/assets/logo/</code>
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-6 rounded-xl bg-slate-50 p-4">
        <MedScopeLogo href="" variant="transparent" width={140} height={36} />
        <MedScopeLogo href="" variant="negative" width={140} height={36} />
      </div>

      <ul className="space-y-3 text-xs text-slate-600">
        <li>Transparent: {MEDSCOPE_LOGO.transparent}</li>
        <li>Print: {MEDSCOPE_LOGO.print}</li>
        <li>Negative: {MEDSCOPE_LOGO.negative}</li>
      </ul>

      {VARIANTS.map((v) => (
        <div key={v.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-100 p-4">
          <span className="min-w-[200px] flex-1 text-sm font-medium">{v.label}</span>
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) upload(v.id, f);
              }}
            />
            <Button type="button" variant="outline" className="rounded-full" disabled={loading !== null} asChild>
              <span>
                {loading === v.id ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                Nahrát
              </span>
            </Button>
          </label>
        </div>
      ))}

      {message ? <p className="text-sm text-slate-700">{message}</p> : null}
    </div>
  );
}
