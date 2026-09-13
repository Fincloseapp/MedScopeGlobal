"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SALES_PACKAGES, formatSalesCzk, type SalesPackageId } from "@/lib/sales/packages";

export function PausalOrderForm({ defaultPackage }: { defaultPackage?: SalesPackageId }) {
  const [packageId, setPackageId] = useState<SalesPackageId>(defaultPackage ?? "magazine");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{
    checkoutUrl: string | null;
    portalUrl: string | null;
    invoiceNumber?: string;
    variableSymbol?: string;
  } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const payload = {
      company: String(form.get("company") ?? ""),
      contactName: String(form.get("contactName") ?? ""),
      email: String(form.get("email") ?? ""),
      ico: String(form.get("ico") ?? "") || undefined,
      address: String(form.get("address") ?? "") || undefined,
      website: String(form.get("website") ?? "") || undefined,
      offerText: String(form.get("offerText") ?? "") || undefined,
      packageId,
      termsAccepted: form.get("terms") === "on",
    };
    const res = await fetch("/api/sales/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = (await res.json()) as {
      error?: string;
      checkoutUrl?: string | null;
      portalUrl?: string | null;
      invoiceNumber?: string;
      variableSymbol?: string;
    };
    setBusy(false);
    if (!res.ok) {
      setError(json.error ?? "Objednávku se nepodařilo vytvořit.");
      return;
    }
    setDone({
      checkoutUrl: json.checkoutUrl ?? null,
      portalUrl: json.portalUrl ?? null,
      invoiceNumber: json.invoiceNumber,
      variableSymbol: json.variableSymbol,
    });
    if (json.checkoutUrl) window.location.href = json.checkoutUrl;
  }

  if (done && !done.checkoutUrl) {
    return (
      <div className="rounded-2xl border border-[#cfe1f3] bg-white p-5 text-sm">
        <p className="font-semibold text-[#021d33]">Objednávka je přijatá.</p>
        <p className="mt-2 text-slate-600">
          Faktura {done.invoiceNumber ?? ""} {done.variableSymbol ? `· VS ${done.variableSymbol}` : ""} byla
          odeslána na e-mail. Stripe karta nyní není k dispozici — uhraďte převodem.
        </p>
        {done.portalUrl ? (
          <Button asChild className="mt-4">
            <Link href={done.portalUrl}>Otevřít portál inzerenta</Link>
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="space-y-4 rounded-2xl border border-[#cfe1f3] bg-white p-5">
      <div className="grid gap-2 sm:grid-cols-2">
        {SALES_PACKAGES.map((pkg) => (
          <label
            key={pkg.id}
            className={`cursor-pointer rounded-xl border p-3 text-sm ${
              packageId === pkg.id ? "border-[#005B96] bg-[#f3f9ff]" : "border-slate-200"
            }`}
          >
            <input
              type="radio"
              name="package"
              className="mr-2"
              checked={packageId === pkg.id}
              onChange={() => setPackageId(pkg.id)}
            />
            <strong>{pkg.name}</strong> · {formatSalesCzk(pkg.priceCzkMonth)}/měs.
            <p className="mt-1 text-xs text-slate-600">{pkg.tagline}</p>
          </label>
        ))}
      </div>
      <input required name="company" placeholder="Firma" className="w-full rounded-lg border px-3 py-2 text-sm" />
      <input required name="contactName" placeholder="Kontaktní osoba" className="w-full rounded-lg border px-3 py-2 text-sm" />
      <input required type="email" name="email" placeholder="Firemní e-mail" className="w-full rounded-lg border px-3 py-2 text-sm" />
      <input name="ico" placeholder="IČO" className="w-full rounded-lg border px-3 py-2 text-sm" />
      <input name="address" placeholder="Fakturační adresa" className="w-full rounded-lg border px-3 py-2 text-sm" />
      <input name="website" placeholder="Web (https://…)" className="w-full rounded-lg border px-3 py-2 text-sm" />
      <textarea name="offerText" placeholder="Krátký popis nabídky, kterou chcete inzerovat" className="w-full rounded-lg border px-3 py-2 text-sm" rows={3} />
      <label className="flex items-start gap-2 text-xs text-slate-600">
        <input type="checkbox" name="terms" required className="mt-1" />
        <span>
          Souhlasím s <Link href="/inzerce/podminky" className="text-[#005B96] underline">podmínkami inzerce</Link> a
          vystavením měsíční faktury. Paušál se obnovuje, dokud jej neskončíte.
        </span>
      </label>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <Button type="submit" disabled={busy} className="rounded-full bg-[#005B96]">
        {busy ? "Odesílám…" : "Objednat paušál a získat fakturu"}
      </Button>
    </form>
  );
}
