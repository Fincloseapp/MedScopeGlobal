"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AD_TYPES, NEWSLETTER_POSITIONS } from "@/lib/ads/placements";
import { calculateAdPrice } from "@/lib/ads/pricing";
import { getAdRequestCopy } from "@/lib/i18n/ad-request-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { formatCzkListPrice } from "@/lib/i18n/payment-currency";

const POSITION_IDS = [
  "homepage_top",
  "homepage_mid",
  "homepage_bottom",
  "article_inline",
  "diagnosis_sidebar",
  "study_inline",
  "congress_top",
] as const;

const DURATION_IDS = ["7", "14", "30", "60", "90"] as const;

export function AdRequestForm({ locale = "cs" }: { locale?: string }) {
  const copy = getAdRequestCopy(locale);
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
        {copy.thanks}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-[#cfe1f3] bg-white p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={copy.company} required>
          <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required />
        </Field>
        <Field label={copy.contact} required>
          <Input
            value={form.contact_person}
            onChange={(e) => setForm({ ...form, contact_person: e.target.value })}
            required
          />
        </Field>
        <Field label={copy.ico}>
          <Input value={form.ico} onChange={(e) => setForm({ ...form, ico: e.target.value })} />
        </Field>
        <Field label={copy.dic}>
          <Input value={form.dic} onChange={(e) => setForm({ ...form, dic: e.target.value })} />
        </Field>
        <Field label={copy.email} required>
          <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </Field>
        <Field label={copy.phone}>
          <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={copy.type} required>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            {AD_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {copy.types[t.id] ?? t.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label={copy.position}>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={form.position}
            onChange={(e) => setForm({ ...form, position: e.target.value })}
          >
            {POSITION_IDS.map((id) => (
              <option key={id} value={id}>
                {copy.positions[id] ?? id}
              </option>
            ))}
          </select>
        </Field>
        <Field label={copy.newsletterPosition}>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={form.position_newsletter}
            onChange={(e) => setForm({ ...form, position_newsletter: e.target.value })}
          >
            <option value="">—</option>
            {NEWSLETTER_POSITIONS.map((p) => (
              <option key={p.id} value={p.id}>
                {copy.newsletterSlots[p.id] ?? p.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label={copy.duration}>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
          >
            {DURATION_IDS.map((id) => (
              <option key={id} value={id}>
                {copy.durations[id] ?? id}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label={copy.targetUrl}>
        <Input type="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
      </Field>
      <Field label={copy.bannerUrl}>
        <Input value={form.banner_url} onChange={(e) => setForm({ ...form, banner_url: e.target.value })} />
      </Field>
      <Field label={copy.adText}>
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
        {copy.includeNewsletter}
      </label>

      <p className="rounded-xl bg-[#f0f8ff] px-4 py-3 text-sm font-semibold text-[#005B96]">
        {copy.quote} {formatCzkListPrice(price, locale)}
      </p>

      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" checked={form.gdpr} onChange={(e) => setForm({ ...form, gdpr: e.target.checked })} required />
        <span>
          {copy.gdpr}{" "}
          <Link href={localizePublicHref("/gdpr", locale)} className="text-[#005B96] underline">
            GDPR
          </Link>
          .
        </span>
      </label>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" checked={form.vop} onChange={(e) => setForm({ ...form, vop: e.target.checked })} required />
        <span>
          {copy.terms}{" "}
          <Link href={localizePublicHref("/vop", locale)} className="text-[#005B96] underline">
            {copy.termsLink}
          </Link>
          .
        </span>
      </label>

      {status === "error" ? (
        <p className="text-sm text-red-600">{copy.error}</p>
      ) : null}

      <Button type="submit" disabled={status === "loading"} className="rounded-full bg-[#005B96]">
        {status === "loading" ? copy.sending : copy.submit}
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
