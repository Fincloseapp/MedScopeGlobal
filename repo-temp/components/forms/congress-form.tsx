"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CongressForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "extracting" | "ok" | "error">("idle");
  const [sourceUrl, setSourceUrl] = useState("");
  const [form, setForm] = useState({
    title: "",
    summary: "",
    body: "",
    starts_at: "",
    location: "",
    price_hint: "",
    registration_url: "",
    organizer: "",
    specialty: "",
  });

  async function extractFromUrl() {
    if (!sourceUrl) return;
    setStatus("extracting");
    try {
      const res = await fetch("/api/kongresy/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source_url: sourceUrl }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error();
      setForm((f) => ({ ...f, ...json.extracted }));
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/kongresy/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source_url: sourceUrl }),
      });
      if (!res.ok) throw new Error();
      setStatus("ok");
    } catch {
      setStatus("error");
    }
  }

  if (status === "ok") {
    return <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm">Akce přijata ke schválení.</p>;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-[#cfe1f3] bg-white p-6">
      <Field label="URL zdroje (univerzita, společnost, databáze)">
        <div className="flex gap-2">
          <Input type="url" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://..." />
          <Button type="button" variant="outline" onClick={extractFromUrl} disabled={status === "extracting"}>
            {status === "extracting" ? "AI…" : "AI extrakce"}
          </Button>
        </div>
      </Field>
      <Field label="Název">
        <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
      </Field>
      <Field label="Shrnutí (AI)">
        <textarea
          className="min-h-[80px] w-full rounded-md border border-input px-3 py-2 text-sm"
          value={form.summary}
          onChange={(e) => setForm({ ...form, summary: e.target.value })}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Datum začátku (ISO)">
          <Input value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} />
        </Field>
        <Field label="Místo">
          <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        </Field>
        <Field label="Cena">
          <Input value={form.price_hint} onChange={(e) => setForm({ ...form, price_hint: e.target.value })} />
        </Field>
        <Field label="Registrace URL">
          <Input value={form.registration_url} onChange={(e) => setForm({ ...form, registration_url: e.target.value })} />
        </Field>
      </div>
      <Field label="Pořadatel">
        <Input value={form.organizer} onChange={(e) => setForm({ ...form, organizer: e.target.value })} />
      </Field>
      <Button type="submit" className="rounded-full bg-[#005B96]" disabled={status === "loading"}>
        Odeslat ke schválení
      </Button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
