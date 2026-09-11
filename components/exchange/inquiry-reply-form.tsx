"use client";

import { useState } from "react";
import { localizePublicHref } from "@/lib/i18n/nav-copy";

export function ExchangeInquiryReplyForm({
  inquiryId,
  locale,
  canReply,
  replyCta,
  replyBlocked,
  upgradeCta,
}: {
  inquiryId: string;
  locale: string;
  canReply: boolean;
  replyCta: string;
  replyBlocked: string;
  upgradeCta: string;
}) {
  const [status, setStatus] = useState<"idle" | "ok" | "blocked" | "error">("idle");

  if (!canReply) {
    return (
      <p className="mt-3 text-sm text-slate-600">
        {replyBlocked}{" "}
        <a className="font-semibold text-[#005B96] underline" href={localizePublicHref("/exchange/pricing", locale)}>
          {upgradeCta}
        </a>
      </p>
    );
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = String(form.get("body") ?? "");
    const res = await fetch(`/api/exchange/inquiries/${inquiryId}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    if (res.status === 402) {
      setStatus("blocked");
      return;
    }
    setStatus(res.ok ? "ok" : "error");
  }

  if (status === "ok") {
    return <p className="mt-3 text-sm text-emerald-800">OK</p>;
  }

  return (
    <form onSubmit={onSubmit} className="mt-3 space-y-2">
      <textarea required minLength={8} name="body" rows={3} className="w-full rounded-lg border px-3 py-2 text-sm" />
      {status === "blocked" ? <p className="text-sm text-amber-800">{replyBlocked}</p> : null}
      {status === "error" ? <p className="text-sm text-red-600">Error</p> : null}
      <button type="submit" className="rounded-full bg-[#005B96] px-4 py-1.5 text-sm font-semibold text-white">
        {replyCta}
      </button>
    </form>
  );
}
