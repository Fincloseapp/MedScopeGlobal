"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type Kind = "offer" | "demand" | "question";

const KINDS: { id: Kind; label: string; hint: string }[] = [
  { id: "offer", label: "Chci inzerovat nabídku", hint: "Výrobek nebo služba na tržiště. Kontakty z poptávek po paušálu." },
  { id: "demand", label: "Zadat poptávku", hint: "Nemocnice, laboratoř, síť ambulancí — zdarma, bez provize." },
  { id: "question", label: "Zeptat se", hint: "Cena, paušál, podmínky. Odpověď jde na e-mail hned." },
];

export function MarketplaceIntakeForm({ defaultKind = "offer" }: { defaultKind?: Kind }) {
  const [kind, setKind] = useState<Kind>(defaultKind);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const form = new FormData(e.currentTarget);
    const payload = {
      kind,
      company: String(form.get("company") ?? ""),
      title: String(form.get("title") ?? ""),
      summary: String(form.get("summary") ?? ""),
      category: String(form.get("category") ?? "") || undefined,
      region: String(form.get("region") ?? "") || undefined,
      contactName: String(form.get("contactName") ?? ""),
      contactEmail: String(form.get("contactEmail") ?? ""),
      phone: String(form.get("phone") ?? "") || undefined,
    };
    const path = kind === "question" ? "/api/marketplace/question" : "/api/marketplace/listing";
    const body =
      kind === "question"
        ? {
            company: payload.company,
            contactName: payload.contactName,
            contactEmail: payload.contactEmail,
            message: payload.summary,
          }
        : payload;
    try {
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as { message?: string; error?: string };
      setOk(res.ok);
      setMessage(json.message ?? json.error ?? (res.ok ? "Odesláno." : "Odeslání selhalo."));
      if (res.ok) e.currentTarget.reset();
    } catch {
      setOk(false);
      setMessage("Síťová chyba. Napište na inzerce@medscopeglobal.com.");
    }
    setBusy(false);
  }

  return (
    <div id="formular" className="rounded-2xl border border-[#cfe1f3] bg-white p-5 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#005B96]">Příjem inzerce</p>
      <h2 className="mt-1 font-display text-2xl font-semibold text-[#021d33]">Formulář nebo e-mail</h2>
      <p className="mt-2 text-sm text-slate-600">
        Stejný tok: uložíme, odpovíme automaticky a obchodní oddělení naváže. E-mail{" "}
        <a className="font-semibold text-[#005B96] underline" href="mailto:inzerce@medscopeglobal.com">
          inzerce@medscopeglobal.com
        </a>
        .
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {KINDS.map((item) => (
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
      <p className="mt-2 text-xs text-slate-500">{KINDS.find((item) => item.id === kind)?.hint}</p>
      <form onSubmit={(e) => void onSubmit(e)} className="mt-4 grid gap-3 sm:grid-cols-2">
        <input required name="company" placeholder="Firma / instituce" className="rounded-lg border px-3 py-2 text-sm" />
        <input required name="contactName" placeholder="Kontaktní osoba" className="rounded-lg border px-3 py-2 text-sm" />
        <input required type="email" name="contactEmail" placeholder="E-mail" className="rounded-lg border px-3 py-2 text-sm" />
        <input name="phone" placeholder="Telefon (nepovinné)" className="rounded-lg border px-3 py-2 text-sm" />
        {kind !== "question" ? (
          <>
            <input
              required
              name="title"
              placeholder={kind === "demand" ? "Co poptáváte" : "Název nabídky"}
              className="rounded-lg border px-3 py-2 text-sm sm:col-span-2"
            />
            <input name="category" placeholder="Kategorie (POC, laboratoř, B2B…)" className="rounded-lg border px-3 py-2 text-sm" />
            <input name="region" placeholder="Region (Česko, EU…)" className="rounded-lg border px-3 py-2 text-sm" />
          </>
        ) : null}
        <textarea
          required
          name="summary"
          rows={4}
          placeholder={
            kind === "question"
              ? "Dotaz k paušálu, tržišti nebo podmínkám"
              : kind === "demand"
                ? "Popis poptávky — bez e-mailu na veřejné desce"
                : "Popis nabídky pro kupující"
          }
          className="rounded-lg border px-3 py-2 text-sm sm:col-span-2"
        />
        <div className="sm:col-span-2">
          <Button type="submit" disabled={busy} className="rounded-full bg-[#005B96]">
            {busy ? "Odesílám…" : "Odeslat"}
          </Button>
        </div>
        {message ? (
          <p className={`text-sm sm:col-span-2 ${ok ? "text-emerald-800" : "text-amber-800"}`}>{message}</p>
        ) : null}
      </form>
    </div>
  );
}
