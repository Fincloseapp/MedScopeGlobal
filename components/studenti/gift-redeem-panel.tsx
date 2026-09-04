"use client";

import { useState } from "react";
import Link from "next/link";
import { isCzechFacultyLocale } from "@/lib/i18n/czech-faculty-only-copy";

export function GiftRedeemPanel({ sessionId, locale }: { sessionId: string; locale: string }) {
  const cs = isCzechFacultyLocale(locale);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  async function redeem() {
    setStatus("loading");
    try {
      const res = await fetch("/api/studenti/redeem-gift", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = (await res.json()) as { error?: string; ok?: boolean };
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? (cs ? "Aktivace se nepodařila." : "Activation failed."));
        return;
      }
      setStatus("ok");
      setMessage(cs ? "Přístup Student LF je na tomto účtu aktivní." : "Student LF access is active on this account.");
    } catch {
      setStatus("error");
      setMessage(cs ? "Síťová chyba. Zkuste to znovu." : "Network error. Try again.");
    }
  }

  const share = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="mt-8 rounded-2xl border border-[#1b1712]/12 bg-[#f6f1e8] p-5">
      <p className="text-sm font-medium text-[#1b1712]">
        {cs ? "Aktivační odkaz je připravený" : "The activation link is ready"}
      </p>
      <p className="mt-1 text-xs text-slate-500">
        {cs
          ? "Přepošlete tuto stránku studentovi. Po přihlášení klikne na Aktivovat."
          : "Forward this page to the student. After sign-in they click Activate."}
      </p>
      {share ? (
        <p className="mt-3 break-all rounded-lg bg-white px-3 py-2 text-xs text-slate-600">{share}</p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void redeem()}
          disabled={status === "loading" || status === "ok"}
          className="rounded-full bg-[#1b1712] px-5 py-2 text-sm font-semibold text-[#f6f1e8] disabled:opacity-50"
        >
          {status === "ok" ? (cs ? "Aktivováno" : "Activated") : cs ? "Aktivovat na tomto účtu" : "Activate on this account"}
        </button>
        <Link href="/login?next=/studenti/darkove" className="rounded-full border px-5 py-2 text-sm font-semibold">
          {cs ? "Přihlásit se" : "Sign in"}
        </Link>
      </div>
      {message ? (
        <p className={`mt-3 text-xs ${status === "error" ? "text-rose-700" : "text-emerald-800"}`}>{message}</p>
      ) : null}
    </div>
  );
}
