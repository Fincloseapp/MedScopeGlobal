"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Copy, Download, Loader2, Share2, RefreshCw, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  downloadOrdiZapisDoc,
  shareOrdiZapisDoc,
} from "@/components/lekari/ordizapis-export";

type NoteListItem = {
  id: string;
  title: string | null;
  note: string;
  transcript: string | null;
  template_id: string | null;
  mode: string | null;
  created_at: string;
  source: string | null;
};

export function DokAppHistory() {
  const [notes, setNotes] = useState<NoteListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<NoteListItem | null>(null);
  const [flash, setFlash] = useState(false);
  const [authHint, setAuthHint] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setAuthHint(false);
    try {
      const res = await fetch("/api/lekari/dokumentace/notes?limit=40", {
        credentials: "same-origin",
      });
      if (res.status === 401) {
        setNotes([]);
        setAuthHint(true);
        setError("Pro historii se přihlaste.");
        return;
      }
      if (!res.ok) {
        setError("Nepodařilo se načíst zápisy.");
        setNotes([]);
        return;
      }
      const json = (await res.json()) as { notes?: NoteListItem[] };
      setNotes(json.notes ?? []);
    } catch {
      setError("Síťová chyba.");
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setFlash(true);
      window.setTimeout(() => setFlash(false), 1400);
    } catch {
      setError("Kopírování selhalo.");
    }
  }

  async function shareText(
    text: string,
    title?: string | null,
    templateId?: string | null
  ) {
    try {
      const result = await shareOrdiZapisDoc(text, {
        title: title || "OrdiZapis zápis",
        templateId,
      });
      if (result === "copied") {
        setFlash(true);
        window.setTimeout(() => setFlash(false), 1400);
      }
    } catch {
      // cancelled
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-3 px-3 pb-4 pt-2 sm:px-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-[#021d33]">Historie zápisů</h2>
          <p className="text-xs text-slate-500">Sync mobil ↔ web pod stejným účtem.</p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-9 rounded-full border-[#cfe1f3]"
          onClick={() => void load()}
        >
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Obnovit
        </Button>
      </div>

      {flash ? (
        <p className="text-xs font-medium text-[#005B96]">Zkopírováno</p>
      ) : null}
      {error ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {error}
          {authHint ? (
            <p className="mt-1">
              <Link href="/login?next=/app/dokumentace" className="font-semibold underline">
                Přihlásit se
              </Link>
            </p>
          ) : null}
        </div>
      ) : null}

      {loading ? (
        <p className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Načítám…
        </p>
      ) : notes.length === 0 && !error ? (
        <div className="space-y-3">
          <div className="rounded-2xl border border-dashed border-[#cfe1f3] bg-white px-4 py-6">
            <FileText className="h-8 w-8 text-[#005B96]/70" />
            <p className="mt-3 text-sm font-semibold text-[#021d33]">Ukázkový zápis (zkušební)</p>
            <p className="mt-1 text-xs text-slate-500">
              Vaše nahrávky se objeví zde. Níže je vzor, jak OrdiZapis skládá SOAP po diktátu.
            </p>
            <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap rounded-xl bg-[#f4f9fc] p-3 text-xs leading-5">
{`S: Únava, občasné bolesti hlavy. OA: DM2 na metforminu. FA: metformin 1000 mg 1-0-1.
O: TK 148/92 mmHg, P 78, BMI 29,2. Asp. pulmo čisté.
A: I10 esenciální hypertenze; E11.9 DM2; E78.5 hyperlipidemie.
P: Perindopril 5 mg 1-0-0 nově. Laboratoř do 4 týdnů. Kontrola 28. 5. 2026.
Lékař schvaluje finální znění. OrdiZapis není zdravotnický prostředek.`}
            </pre>
          </div>
        </div>
      ) : (
        <ul className="space-y-2">
          {notes.map((item) => (
            <li
              key={item.id}
              className="rounded-2xl border border-[#cfe1f3] bg-white p-3 shadow-[0_8px_24px_-20px_rgba(0,91,150,0.5)]"
            >
              <button
                type="button"
                className="w-full text-left"
                onClick={() => setSelected(selected?.id === item.id ? null : item)}
              >
                <p className="truncate text-sm font-semibold text-[#021d33]">
                  {item.title || "Zápis"}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {new Date(item.created_at).toLocaleString("cs-CZ")}
                  {item.source ? ` · ${item.source}` : ""}
                  {item.template_id ? ` · ${item.template_id}` : ""}
                </p>
              </button>
              <div className="mt-2 flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 rounded-full"
                  onClick={() => void copyText(item.note)}
                >
                  <Copy className="mr-1 h-3.5 w-3.5" />
                  Kopírovat
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 rounded-full"
                  onClick={() =>
                    void shareText(item.note, item.title, item.template_id)
                  }
                >
                  <Share2 className="mr-1 h-3.5 w-3.5" />
                  Sdílet
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 rounded-full"
                  onClick={() =>
                    downloadOrdiZapisDoc(item.note, {
                      title: item.title || "OrdiZapis zápis",
                      templateId: item.template_id,
                    })
                  }
                >
                  <Download className="mr-1 h-3.5 w-3.5" />
                  .doc
                </Button>
              </div>
              {selected?.id === item.id ? (
                <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap rounded-xl bg-[#f4f9fc] p-3 text-xs leading-5 text-[#021d33]">
                  {item.note}
                </pre>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
