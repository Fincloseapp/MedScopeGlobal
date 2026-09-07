"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAdPortalCopy } from "@/lib/i18n/ad-portal-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";

export function AdPortalForm({ locale }: { locale: string }) {
  const copy = getAdPortalCopy(locale);
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
        headers: { "content-type": "application/json" },
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
        setMsg(body.error ?? copy.fail);
        return;
      }
      setOrderHref(
        localizePublicHref(
          `/firmy/reklama/objednavka/${body.id}?token=${encodeURIComponent(body.token ?? "")}`,
          locale
        )
      );
      setMsg(body.recommendation === "deny" ? copy.deny : copy.queued);
    } catch (error) {
      setMsg(error instanceof Error ? error.message : copy.fail);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="mt-8 space-y-4 rounded-2xl border bg-white p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          {copy.company}
          <Input name="company" required minLength={2} className="mt-1" />
        </label>
        <label className="text-sm">
          {copy.contact}
          <Input name="contact_person" required minLength={2} className="mt-1" />
        </label>
        <label className="text-sm">
          {copy.email}
          <Input name="email" type="email" required className="mt-1" />
        </label>
        <label className="text-sm">
          {copy.phone}
          <Input name="phone" className="mt-1" />
        </label>
        <label className="text-sm">
          {copy.ico}
          <Input name="ico" className="mt-1" />
        </label>
        <label className="text-sm">
          {copy.dic}
          <Input name="dic" className="mt-1" />
        </label>
        <label className="text-sm sm:col-span-2">
          {copy.address}
          <Input name="buyer_address" className="mt-1" />
        </label>
        <label className="text-sm">
          {copy.format}
          <select name="type" className="mt-1 w-full rounded-md border px-3 py-2 text-sm">
            <option value="banner">{copy.formatBanner}</option>
            <option value="sponsored_article">{copy.formatSponsored}</option>
            <option value="newsletter">{copy.formatNewsletter}</option>
          </select>
        </label>
        <label className="text-sm">
          {copy.placement}
          <select name="position" className="mt-1 w-full rounded-md border px-3 py-2 text-sm">
            <option value="homepage_mid">{copy.placeHome}</option>
            <option value="article_inline">{copy.placeArticle}</option>
            <option value="congress_top">{copy.placeCongress}</option>
          </select>
        </label>
        <label className="text-sm">
          {copy.duration}
          <select name="duration" className="mt-1 w-full rounded-md border px-3 py-2 text-sm">
            <option value="30">30</option>
            <option value="60">60</option>
            <option value="90">90</option>
          </select>
        </label>
        <label className="text-sm">
          {copy.targetUrl}
          <Input name="url" type="url" className="mt-1" />
        </label>
        <label className="text-sm sm:col-span-2">
          {copy.visualUrl}
          <Input name="banner_url" type="url" className="mt-1" />
        </label>
        <label className="text-sm sm:col-span-2">
          {copy.adText}
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
        {busy ? copy.busy : copy.submit}
      </Button>
      {msg ? <p className="text-sm text-slate-700">{msg}</p> : null}
      {orderHref ? (
        <p className="text-sm">
          <a href={orderHref} className="font-medium text-[#005B96] hover:underline">
            {copy.orderLink}
          </a>
        </p>
      ) : null}
    </form>
  );
}
