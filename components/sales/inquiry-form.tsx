"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function InquiryForm({ slug }: { slug: string }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/sales/inquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug,
        senderName: String(form.get("senderName") ?? ""),
        senderEmail: String(form.get("senderEmail") ?? ""),
        message: String(form.get("message") ?? ""),
      }),
    });
    const json = (await res.json()) as { message?: string; error?: string };
    setBusy(false);
    setMessage(json.message ?? json.error ?? (res.ok ? "Odesláno." : "Chyba."));
    if (res.ok) e.currentTarget.reset();
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="space-y-3 rounded-2xl border border-[#cfe1f3] bg-white p-5">
      <input required name="senderName" placeholder="Jméno" className="w-full rounded-lg border px-3 py-2 text-sm" />
      <input required type="email" name="senderEmail" placeholder="E-mail" className="w-full rounded-lg border px-3 py-2 text-sm" />
      <textarea required name="message" placeholder="Poptávka k nabídce inzerenta" rows={4} className="w-full rounded-lg border px-3 py-2 text-sm" />
      <Button type="submit" disabled={busy} className="rounded-full bg-[#005B96]">
        {busy ? "Odesílám…" : "Odeslat poptávku"}
      </Button>
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
    </form>
  );
}
