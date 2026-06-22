"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AD_TYPES, NEWSLETTER_POSITIONS } from "@/lib/ads/placements";
import { calculateAdPrice, formatCzk } from "@/lib/ads/pricing";

const POSITIONS = [
  { id: "homepage_top", label: "Homepage — top" },
  { id: "homepage_mid", label: "Homepage — střed" },
  { id: "homepage_bottom", label: "Homepage — spodek" },
  { id: "article_inline", label: "Články — inline" },
  { id: "diagnosis_sidebar", label: "Diagnózy — sidebar" },
  { id: "study_inline", label: "Studie — inline" },
  { id: "congress_top", label: "Kongresy — banner" },
];

const DURATIONS = [
  { id: "7", label: "7 dní" },
  { id: "14", label: "14 dní" },
  { id: "30", label: "30 dní" },
  { id: "60", label: "60 dní" },
  { id: "90", label: "90 dní" },
];

export function AdRequestForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [form, setForm] = useState({
    company: "",
    ico: "",
    dic: "",
    contact_person: "",
    email: "",
    phone: "",
    type: "banner",
    position: "homepage_mid",
    position_newsletter: "",
    duration: "30",
    banner_url: "",
    ad_text: "",
    url: "",
    gdpr: false,
    vop: false,
    include_newsletter: false,
  });

  const price = useMemo(
    () =>
      calculateAdPrice({
        type: form.type,
        position: form.position,
        positionNewsletter: form.position_newsletter || null,
        durationDays: form.duration,
        includeNewsletter: form.include_newsletter,
      }),
    [form]
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.gdpr || !form.vop) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/ads/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price }),
      });
      if (!res.ok) throw new Error("submit failed");
      setStatus("ok");
    } catch {
      setStatus("error");
    }
  }

  if (status === "ok") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-900">
        Děkujeme. Žádost byla odeslána na info@medscopeglobal.com. Po schválení obdržíte platební odkaz.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-[#cfe1f3] bg-white p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Název firmy" required>
          <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required />
        </Field>
        <Field label="Kontaktní osoba" required>
          <Input
            value={form.contact_person}
            onChange={(e) => setForm({ ...form, contact_person: e.target.value })}
            required
          />
        </Field>
        <Field label="IČO">
          <Input value={form.ico} onChange={(e) => setForm({ ...form, ico: e.target.value })} />
        </Field>
        <Field label="DIČ">
          <Input value={form.dic} onChange={(e) => setForm({ ...form, dic: e.target.value })} />
        </Field>
        <Field label="E-mail" required>
          <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </Field>
        <Field label="Telefon">
          <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Typ reklamy" required>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            {AD_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Pozice na webu">
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={form.position}
            onChange={(e) => setForm({ ...form, position: e.target.value })}
          >
            {POSITIONS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Pozice v newsletteru">
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={form.position_newsletter}
            onChange={(e) => setForm({ ...form, position_newsletter: e.target.value })}
          >
            <option value="">—</option>
            {NEWSLETTER_POSITIONS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Doba zobrazení">
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
          >
            {DURATIONS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="URL cílové stránky">
        <Input type="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
      </Field>
      <Field label="URL banneru (po nahrání do storage)">
        <Input value={form.banner_url} onChange={(e) => setForm({ ...form, banner_url: e.target.value })} />
      </Field>
      <Field label="Text reklamy">
        <textarea
          className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={form.ad_text}
          onChange={(e) => setForm({ ...form, ad_text: e.target.value })}
        />
      </Field>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.include_newsletter}
          onChange={(e) => setForm({ ...form, include_newsletter: e.target.checked })}
        />
        Zahrnout newsletter
      </label>

      <p className="rounded-xl bg-[#f0f8ff] px-4 py-3 text-sm font-semibold text-[#005B96]">
        Automatické nacenění: {formatCzk(price)}
      </p>

      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" checked={form.gdpr} onChange={(e) => setForm({ ...form, gdpr: e.target.checked })} required />
        <span>
          Souhlasím se zpracováním údajů dle{" "}
          <Link href="/gdpr" className="text-[#005B96] underline">
            GDPR
          </Link>
          .
        </span>
      </label>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" checked={form.vop} onChange={(e) => setForm({ ...form, vop: e.target.checked })} required />
        <span>
          Souhlasím s{" "}
          <Link href="/vop" className="text-[#005B96] underline">
            obchodními podmínkami
          </Link>
          .
        </span>
      </label>

      {status === "error" ? (
        <p className="text-sm text-red-600">Odeslání se nezdařilo nebo chybí souhlasy.</p>
      ) : null}

      <Button type="submit" disabled={status === "loading"} className="rounded-full bg-[#005B96]">
        {status === "loading" ? "Odesílám…" : "Odeslat žádost"}
      </Button>
    </form>
  );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required ? " *" : ""}
      </Label>
      {children}
    </div>
  );
}
