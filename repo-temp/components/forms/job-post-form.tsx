"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function JobPostForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [form, setForm] = useState({
    title: "",
    company: "",
    specialization: "",
    region: "",
    employment_type: "HPP",
    description: "",
    requirements: "",
    salary_hint: "",
    contact_email: "",
    apply_url: "",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/kariera/submit", {
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
    return (
      <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
        Nabídka byla přijata ke schválení. Po publikaci se zobrazí v /kariera.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-[#cfe1f3] bg-white p-6">
      <Field label="Název pozice">
        <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
      </Field>
      <Field label="Zaměstnavatel">
        <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Specializace">
          <Input
            value={form.specialization}
            onChange={(e) => setForm({ ...form, specialization: e.target.value })}
          />
        </Field>
        <Field label="Region">
          <Input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} />
        </Field>
        <Field label="Úvazek">
          <Input
            value={form.employment_type}
            onChange={(e) => setForm({ ...form, employment_type: e.target.value })}
          />
        </Field>
      </div>
      <Field label="Popis">
        <textarea
          className="min-h-[120px] w-full rounded-md border border-input px-3 py-2 text-sm"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
        />
      </Field>
      <Field label="Požadavky">
        <textarea
          className="min-h-[80px] w-full rounded-md border border-input px-3 py-2 text-sm"
          value={form.requirements}
          onChange={(e) => setForm({ ...form, requirements: e.target.value })}
        />
      </Field>
      <Field label="Plat / benefity (nepovinné)">
        <Input value={form.salary_hint} onChange={(e) => setForm({ ...form, salary_hint: e.target.value })} />
      </Field>
      <Field label="Kontaktní e-mail">
        <Input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
      </Field>
      <Field label="URL odpovědi">
        <Input type="url" value={form.apply_url} onChange={(e) => setForm({ ...form, apply_url: e.target.value })} />
      </Field>
      {status === "error" ? <p className="text-sm text-red-600">Odeslání selhalo.</p> : null}
      <Button type="submit" disabled={status === "loading"} className="rounded-full bg-[#005B96]">
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
