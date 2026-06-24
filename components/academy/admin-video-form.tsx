"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export function AdminVideoForm() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [title, setTitle] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setStatus("Vyberte video soubor.");
      return;
    }

    setLoading(true);
    setStatus(null);
    try {
      const form = new FormData();
      form.append("title", title.trim());
      form.append("file", file);

      const res = await fetch("/api/academy/video/upload", {
        method: "POST",
        credentials: "same-origin",
        body: form,
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setStatus(data.error ?? `Chyba (${res.status})`);
        return;
      }
      setStatus("Video nahráno do Supabase Storage.");
      setTitle("");
      if (fileRef.current) fileRef.current.value = "";
      window.location.reload();
    } catch {
      setStatus("Síťová chyba");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button type="button" onClick={() => setOpen(true)}>
        + Nahrát video
      </Button>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
      <p className="text-sm font-medium text-[#021d33]">Nahrát video do Supabase Storage</p>
      <input
        required
        placeholder="Název videa"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
      />
      <input
        ref={fileRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov,.m4v"
        required
        className="w-full text-sm"
      />
      <p className="text-xs text-slate-500">
        Bucket <code>media</code> · cesta <code>academy/videos/</code> · max 100 MB
      </p>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Nahrávám…" : "Nahrát"}
        </Button>
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
          Zrušit
        </Button>
      </div>
      {status ? <p className="text-sm text-slate-600">{status}</p> : null}
    </form>
  );
}
