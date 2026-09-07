"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AdPortalForm({ locale }: { locale: string }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [orderHref, setOrderHref] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMsg(null);
    const form = new FormData(event.currentTarget);
    const payload = {
      company: String(form.get("company") ?? ""),
      contact_person: String(form.get("contact_person") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      ico: String(form.get("ico") ?? ""),
      dic: String(form.get("dic") ?? ""),
      buyer_address: String(form.get("buyer_address") ?? ""),
      type: String(form.get("type") ?? "banner"),
      position: String(form.get("position") ?? "homepage_mid"),
      duration: String(form.get("duration") ?? "30"),
      banner_url: String(form.get("banner_url") ?? ""),
      ad_text: String(form.get("ad_text") ?? ""),
      url: String(form.get("url") ?? ""),
      locale,
    };
    try {
      const res = await fetch("/api/ads/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await res.json()) as {
        ok?: boolean;
        id?: string;
        token?: string;
        recommendation?: string;
        error?: string;
      };
      if (!res.ok || !body.ok || !body.id) {
        setMsg(body.error ?? "Odeslání selhalo.");
        return;
      }
      setOrderHref(`/firmy/reklama/objednavka/${body.id}?token=${encodeURIComponent(body.token ?? "")}`);
      setMsg(
        body.recommendation === "deny"
          ? "Tři autonomní editoři našli problém. Admin ještě potvrdí zákaz."
          : "Žádost je u tří editorů. Po povolení sem přijde platba a náhled faktury."
      );
    } catch (error) {
      setMsg(error instanceof Error ? error.message : "Odeslání selhalo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="mt-8 space-y-4 rounded-2xl border bg-white p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          Firma
          <Input name="company" required minLength={2} className="mt-1" />
        </label>
        <label className="text-sm">
          Kontaktní osoba
          <Input name="contact_person" required minLength={2} className="mt-1" />
        </label>
        <label className="text-sm">
          E-mail
          <Input name="email" type="email" required className="mt-1" />
        </label>
        <label className="text-sm">
          Telefon
          <Input name="phone" className="mt-1" />
        </label>
        <label className="text-sm">
          IČO
          <Input name="ico" className="mt-1" />
        </label>
        <label className="text-sm">
          DIČ
          <Input name="dic" className="mt-1" />
        </label>
        <label className="text-sm sm:col-span-2">
          Fakturační adresa firmy
          <Input name="buyer_address" className="mt-1" />
        </label>
        <label className="text-sm">
          Formát
          <select name="type" className="mt-1 w-full rounded-md border px-3 py-2 text-sm">
            <option value="banner">Banner</option>
            <option value="sponsored_article">Sponzorovaný článek</option>
            <option value="newsletter">Zmínka v newsletteru</option>
          </select>
        </label>
        <label className="text-sm">
          Umístění
          <select name="position" className="mt-1 w-full rounded-md border px-3 py-2 text-sm">
            <option value="homepage_mid">Homepage</option>
            <option value="article_inline">Veřejný článek</option>
            <option value="congress_top">Kongresy</option>
          </select>
        </label>
        <label className="text-sm">
          Délka (dny)
          <select name="duration" className="mt-1 w-full rounded-md border px-3 py-2 text-sm">
            <option value="30">30</option>
            <option value="60">60</option>
            <option value="90">90</option>
          </select>
        </label>
        <label className="text-sm">
          Cílová URL
          <Input name="url" type="url" className="mt-1" />
        </label>
        <label className="text-sm sm:col-span-2">
          URL vizuálu (JPG/PNG/WEBP, banner 1200×400 nebo 300×250)
          <Input name="banner_url" type="url" className="mt-1" />
        </label>
        <label className="text-sm sm:col-span-2">
          Text reklamy
          <textarea
            name="ad_text"
            rows={5}
            maxLength={4000}
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            required
          />
        </label>
      </div>
      <Button type="submit" disabled={busy} className="bg-[#005B96]">
        {busy ? "Odesílám…" : "Odeslat k editorial checku"}
      </Button>
      {msg ? <p className="text-sm text-slate-700">{msg}</p> : null}
      {orderHref ? (
        <p className="text-sm">
          <a href={orderHref} className="font-medium text-[#005B96] hover:underline">
            Stav objednávky a náhled faktury
          </a>
        </p>
      ) : null}
    </form>
  );
}
