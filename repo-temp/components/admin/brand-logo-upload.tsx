"use client";



import { useCallback, useEffect, useState } from "react";

import { Loader2, RefreshCw, Upload } from "lucide-react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

import { MedScopeLogo } from "@/components/brand/medscope-logo";

import { LOGO_MAPPING, LOGO_SOURCE_DIR, LOGO_SYNC_COMMAND } from "@/lib/brand/brand-system";



const VARIANTS = LOGO_MAPPING.map((m) => ({

  id: m.variant,

  label: `${m.source} → ${m.dest}`,

  usage: m.usage,

}));



export function BrandLogoUploadPanel() {

  const router = useRouter();

  const [loading, setLoading] = useState<string | null>(null);

  const [message, setMessage] = useState<string | null>(null);

  const [paths, setPaths] = useState<Record<string, string>>({});



  const refreshPaths = useCallback(async () => {

    try {

      const res = await fetch("/api/admin/brand/logos");

      const json = await res.json();

      if (json.activePaths) {

        setPaths({

          transparent: json.activePaths.transparent,

          print: json.activePaths.print,

          negative: json.activePaths.negative,

        });

      }

    } catch {

      /* ignore */

    }

  }, []);



  useEffect(() => {

    refreshPaths();

  }, [refreshPaths]);



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

      setMessage(`Nahráno: ${json.path ?? json.filename}`);

      await refreshPaths();

      router.refresh();

    } catch (e) {

      setMessage((e as Error).message);

    } finally {

      setLoading(null);

    }

  }



  async function syncFromD() {

    setLoading("sync");

    setMessage(null);

    try {

      const fd = new FormData();

      fd.append("action", "sync");

      const res = await fetch("/api/admin/brand/logos", { method: "POST", body: fd });

      const json = await res.json();

      if (!res.ok) throw new Error(json.error ?? "Sync failed");

      setMessage(json.message ?? "Synchronizace dokončena");

      await refreshPaths();

      router.refresh();

    } catch (e) {

      setMessage((e as Error).message);

    } finally {

      setLoading(null);

    }

  }



  return (

    <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6">

      <div className="flex flex-wrap items-start justify-between gap-4">

        <div>

          <h2 className="font-display text-lg font-bold text-[#021d33]">Globální systém loga v23.2.0</h2>

          <p className="mt-1 text-sm text-slate-600">

            Zdroj: <code className="text-xs">{LOGO_SOURCE_DIR}</code> →{" "}

            <code className="text-xs">public/assets/logo/</code>

          </p>

          <p className="mt-1 text-xs text-slate-500">Sync: {LOGO_SYNC_COMMAND}</p>

        </div>

        <Button

          type="button"

          variant="outline"

          className="rounded-full"

          disabled={loading !== null}

          onClick={syncFromD}

        >

          {loading === "sync" ? (

            <Loader2 className="mr-2 h-4 w-4 animate-spin" />

          ) : (

            <RefreshCw className="mr-2 h-4 w-4" />

          )}

          Sync z disku D:

        </Button>

      </div>



      <div className="flex flex-wrap items-center gap-6 rounded-xl bg-slate-50 p-4">

        <MedScopeLogo href="" variant="transparent" width={140} height={36} />

        <MedScopeLogo href="" variant="negative" width={140} height={36} />

        <MedScopeLogo href="" variant="print" width={140} height={36} />

      </div>



      <div className="overflow-x-auto rounded-xl border border-slate-100">

        <table className="w-full min-w-[480px] text-left text-xs">

          <thead className="bg-slate-50 text-slate-600">

            <tr>

              <th className="px-3 py-2 font-semibold">Zdroj (D:)</th>

              <th className="px-3 py-2 font-semibold">Cíl v projektu</th>

              <th className="px-3 py-2 font-semibold">Použití</th>

              <th className="px-3 py-2 font-semibold">Aktivní cesta</th>

            </tr>

          </thead>

          <tbody className="divide-y divide-slate-100">

            {LOGO_MAPPING.map((m) => (

              <tr key={m.variant}>

                <td className="px-3 py-2 font-mono">{m.source}</td>

                <td className="px-3 py-2 font-mono">public/assets/logo/{m.dest}</td>

                <td className="px-3 py-2 text-slate-600">{m.usage}</td>

                <td className="px-3 py-2 font-mono text-sky-700">{paths[m.variant] ?? "—"}</td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>



      {VARIANTS.map((v) => (

        <div key={v.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-100 p-4">

          <div className="min-w-[200px] flex-1">

            <span className="text-sm font-medium">{v.label}</span>

            <p className="text-xs text-slate-500">{v.usage}</p>

          </div>

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

