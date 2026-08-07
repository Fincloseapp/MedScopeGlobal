"use client";

import Link from "next/link";
import { LogIn, ShieldAlert, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DokAppGate({
  message,
  loginUrl = "/login?next=/app/dokumentace",
  verifyUrl = "/academy/lekari/overeni",
  linkedHint,
}: {
  message: string;
  loginUrl?: string;
  verifyUrl?: string;
  linkedHint?: string | null;
}) {
  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col justify-center px-4 py-10">
      <div className="rounded-2xl border border-[#cfe1f3] bg-white p-6 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-700">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h2 className="mt-4 font-display text-xl font-bold text-[#021d33]">
          Jen pro ověřené lékaře
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
        {linkedHint ? (
          <p className="mt-3 inline-flex items-start gap-2 rounded-xl bg-[#eef6fb] px-3 py-2 text-xs leading-5 text-[#021d33]">
            <Building2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#005B96]" />
            {linkedHint}
          </p>
        ) : null}
        <div className="mt-5 flex flex-col gap-2">
          <Button asChild className="h-11 rounded-full bg-[#005B96]">
            <Link href={loginUrl}>
              <LogIn className="mr-2 h-4 w-4" />
              Přihlásit se lékařským účtem
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-11 rounded-full border-[#cfe1f3]">
            <Link href={verifyUrl}>Požádat o ověření lékaře</Link>
          </Button>
          <Button asChild variant="ghost" className="h-10 rounded-full text-[#005B96]">
            <Link href="/lekari/dokumentace">Zjistit více o Dokumentaci</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
