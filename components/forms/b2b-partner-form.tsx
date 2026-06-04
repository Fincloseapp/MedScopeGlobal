"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function B2bPartnerForm({ inquiryType }: { inquiryType: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [form, setForm] = useState({
    company: "",
    contact_person: "",
    email: "",
    phone: "",
    message: "",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/b2b/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, inquiry_type: inquiryType }),
      });
      if (!res.ok) throw new Error();
      setStatus("ok");
    } catch {
      setStatus("error");
    }
  }

  if (status === "ok") {
    return (
      <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
        Děkujeme — ozveme se na uvedený e-mail.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-[#cfe1f3] bg-white p-5">
      <Field label="Firma">
        <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required />
      </Field>
      <Field label="Kontakt">
        <Input
          value={form.contact_person}
          onChange={(e) => setForm({ ...form, contact_person: e.target.value })}
          required
        />
      </Field>
      <Field label="E-mail">
        <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
      </Field>
      <Field label="Telefon">
        <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      </Field>
      <Field label="Zpráva">
        <textarea
          className="min-h-[80px] w-full rounded-md border border-input px-3 py-2 text-sm"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />
      </Field>
      {status === "error" ? <p className="text-sm text-red-600">Odeslání selhalo.</p> : null}
      <Button type="submit" disabled={status === "loading"} className="rounded-full bg-[#005B96]">
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
