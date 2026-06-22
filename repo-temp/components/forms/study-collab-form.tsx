"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function StudyCollabForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [form, setForm] = useState({
    title: "",
    organization: "",
    summary: "",
    body: "",
    specialty: "",
    phase: "",
    contact_email: "",
    apply_url: "",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/studijni-spoluprace/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setStatus("ok");
    } catch {
      setStatus("error");
    }
  }

  if (status === "ok") {
    return <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm">Nabídka přijata ke schválení.</p>;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-[#cfe1f3] bg-white p-6">
      <Field label="Název studie">
        <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
      </Field>
      <Field label="Organizace">
        <Input value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} required />
      </Field>
      <Field label="Shrnutí">
        <textarea
          className="min-h-[80px] w-full rounded-md border border-input px-3 py-2 text-sm"
          value={form.summary}
          onChange={(e) => setForm({ ...form, summary: e.target.value })}
          required
        />
      </Field>
      <Field label="Detail">
        <textarea
          className="min-h-[120px] w-full rounded-md border border-input px-3 py-2 text-sm"
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Obor">
          <Input value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} />
        </Field>
        <Field label="Fáze">
          <Input value={form.phase} onChange={(e) => setForm({ ...form, phase: e.target.value })} />
        </Field>
      </div>
      <Field label="E-mail">
        <Input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
      </Field>
      <Field label="URL přihlášky">
        <Input type="url" value={form.apply_url} onChange={(e) => setForm({ ...form, apply_url: e.target.value })} />
      </Field>
      <Button type="submit" className="rounded-full bg-[#005B96]" disabled={status === "loading"}>
        Odeslat
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
