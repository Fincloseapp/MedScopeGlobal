"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getTurnstileSiteKeyClient, useCaptchaToken } from "@/components/security/use-captcha";

type Kind = "offer" | "demand";

export function MarketplaceIntakeForm({ defaultKind = "offer" }: { defaultKind?: Kind }) {
  const [kind, setKind] = useState<Kind>(defaultKind);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const siteKey = getTurnstileSiteKeyClient();
  const { token: captchaToken, widget, required: captchaRequired } = useCaptchaToken(siteKey);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    if (captchaRequired && !captchaToken) {
      setOk(false);
      setMessage("Potvrďte CAPTCHA a odešlete znovu.");
      setBusy(false);
      return;
    }
    const form = new FormData(e.currentTarget);
    const payload = {
      kind,
      company: String(form.get("company") ?? ""),
      title: String(form.get("title") ?? ""),
      summary: String(form.get("summary") ?? ""),
      contactEmail: String(form.get("contactEmail") ?? ""),
      termsAccepted: form.get("terms") === "on",
      captchaToken: captchaToken || undefined,
    };
    try {
      const res = await fetch("/api/marketplace/listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as { message?: string; error?: string };
      setOk(res.ok);
      setMessage(json.message ?? json.error ?? (res.ok ? "Odesláno." : "Odeslání selhalo."));
      if (res.ok) e.currentTarget.reset();
    } catch {
      setOk(false);
      setMessage("Síťová chyba. Obchodní oddělení záznam doplní z dalšího běhu.");
    }
    setBusy(false);
  }

  return (
    <div id="formular" className="rounded-2xl border border-[#cfe1f3] bg-white p-5 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#005B96]">Jen firmy</p>
      <h2 className="mt-1 font-display text-2xl font-semibold text-[#021d33]">Firemní formulář tržiště</h2>
      <p className="mt-2 text-sm text-slate-600">
        Firma, jeden pracovní e-mail, nabídka nebo poptávka. Bez telefonu, bez jména osoby, bez další schránky.
        Magazín a předplatné čtenářů sem nepatří.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {(
          [
            { id: "offer" as const, label: "Nabídka služeb" },
            { id: "demand" as const, label: "Poptávka firmy" },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setKind(item.id)}
            className={`rounded-full px-3 py-1.5 text-sm ${
              kind === item.id ? "bg-[#005B96] text-white" : "border border-slate-200 bg-white text-slate-700"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <form onSubmit={(e) => void onSubmit(e)} className="mt-4 grid gap-3">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-[#021d33]">Firma</span>
          <input required name="company" placeholder="Název společnosti" className="w-full rounded-lg border px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-[#021d33]">Pracovní e-mail</span>
          <input required type="email" name="contactEmail" placeholder="obchod@firma.cz" className="w-full rounded-lg border px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-[#021d33]">
            {kind === "demand" ? "Co poptáváte" : "Název nabídky"}
          </span>
          <input required name="title" className="w-full rounded-lg border px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-[#021d33]">Stručný popis</span>
          <textarea required name="summary" rows={4} className="w-full rounded-lg border px-3 py-2 text-sm" />
        </label>
        <label className="flex items-start gap-2 text-xs text-slate-600">
          <input type="checkbox" name="terms" required className="mt-1" />
          <span>
            Jsem firma. Souhlasím se zpracováním tohoto e-mailu pro obsluhu tržiště (GDPR čl. 6 odst. 1 písm. b).
            Inzerce bude označená. Osobní údaje třetích osob sem nevkládám.
          </span>
        </label>
        <div className="space-y-3">
          {widget}
          <Button type="submit" disabled={busy || (captchaRequired && !captchaToken)} className="rounded-full bg-[#005B96]">
            {busy ? "Odesílám…" : kind === "demand" ? "Zadat poptávku" : "Zveřejnit nabídku"}
          </Button>
        </div>
        {message ? <p className={`text-sm ${ok ? "text-emerald-800" : "text-amber-800"}`}>{message}</p> : null}
      </form>
    </div>
  );
}
