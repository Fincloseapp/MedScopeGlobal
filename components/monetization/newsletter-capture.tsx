"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getRevenueCopy } from "@/lib/i18n/revenue-copy";
import { getNewsletterCopy } from "@/lib/i18n/newsletter-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { trackEvent } from "@/lib/analytics";

type Props = {
  locale?: string;
  source: string;
  segment?: "public" | "doctors";
  variant?: "card" | "compact" | "followup";
  className?: string;
};

export function NewsletterCapture({
  locale = "cs",
  source,
  segment = "public",
  variant = "card",
  className = "",
}: Props) {
  const router = useRouter();
  const copy = getRevenueCopy(locale);
  const brief = getNewsletterCopy(locale);
  const latestHref = localizePublicHref("/newsletter/posledni", locale);
  const thanksHref = localizePublicHref("/newsletter/dekujeme", locale);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "dup" | "err" | "invalid">(
    "idle"
  );

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!email.includes("@")) {
      setStatus("invalid");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale, segment, source }),
      });
      const data = (await res.json()) as { ok?: boolean; already?: boolean };
      if (res.status === 400) {
        setStatus("invalid");
        return;
      }
      if (!res.ok || !data.ok) {
        setStatus("err");
        return;
      }
      trackEvent("newsletter_subscribe", { source, segment, locale });
      setEmail("");
      if (data.already) {
        setStatus("dup");
        return;
      }
      if (source !== "newsletter-thanks") {
        router.push(thanksHref);
        return;
      }
      setStatus("ok");
    } catch {
      setStatus("err");
    }
  }

  const message =
    status === "ok"
      ? copy.newsletterSuccess
      : status === "dup"
        ? copy.newsletterDuplicate
        : status === "err"
          ? copy.newsletterError
          : status === "invalid"
            ? copy.newsletterInvalid
            : null;

  const form = (
    <form onSubmit={onSubmit} className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
      <label className="sr-only" htmlFor={`nl-${source}`}>
        {copy.newsletterPlaceholder}
      </label>
      <input
        id={`nl-${source}`}
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={copy.newsletterPlaceholder}
        className="h-11 flex-1 rounded-full border border-slate-300 bg-white px-4 text-sm text-[#021d33] outline-none ring-[#005B96] focus:ring-2"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-[#005B96] px-5 text-sm font-semibold text-white hover:bg-[#004a7a] disabled:opacity-60"
      >
        {copy.newsletterCta}
      </button>
    </form>
  );

  const nextStep =
    status === "ok" ? (
      <p className="mt-2 text-xs">
        <Link href={latestHref} className="font-semibold text-[#005B96] hover:underline">
          {brief.hubLatest} →
        </Link>
      </p>
    ) : null;

  if (variant === "compact") {
    return (
      <div className={className}>
        <p className="text-sm font-semibold text-[#021d33]">{copy.newsletterTitle}</p>
        <p className="mt-1 text-xs text-slate-600">{copy.newsletterBody}</p>
        {form}
        <p className="mt-2 text-[11px] text-slate-500">{copy.newsletterPrivacy}</p>
        {message ? (
          <p className="mt-2 text-xs text-emerald-800" role="status">
            {message}
          </p>
        ) : null}
        {nextStep}
      </div>
    );
  }

  if (variant === "followup") {
    return (
      <div className={`mt-4 rounded-xl border border-slate-200 bg-white/80 p-4 ${className}`}>
        <p className="text-sm font-medium text-[#021d33]">{copy.tipsFollowup}</p>
        {form}
        {message ? (
          <p className="mt-2 text-xs text-emerald-800" role="status">
            {message}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <section
      className={`rounded-2xl border border-[#cfe1f3] bg-white px-5 py-5 sm:px-6 ${className}`}
      aria-labelledby={`nl-title-${source}`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#005B96]">
        {copy.newsletterKicker}
      </p>
      <h2
        id={`nl-title-${source}`}
        className="mt-1 font-display text-xl font-semibold text-[#021d33]"
      >
        {copy.newsletterTitle}
      </h2>
      <p className="mt-1 max-w-2xl text-sm text-slate-600">{copy.newsletterBody}</p>
      {form}
      <p className="mt-2 text-xs text-slate-500">{copy.newsletterPrivacy}</p>
      {message ? (
        <p className="mt-2 text-sm text-emerald-800" role="status">
          {message}
        </p>
      ) : null}
      {nextStep}
    </section>
  );
}
