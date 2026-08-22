"use client";

import Link from "next/link";
import { LogIn, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MEDIPACIENT } from "@/lib/medipacient/branding";

export function MeDipacientGate({
  message,
  loginUrl = "/login?next=/app/pacient",
}: {
  message: string;
  loginUrl?: string;
}) {
  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col justify-center px-4 py-10">
      <div className="rounded-2xl border border-[#2D7FF9]/20 bg-white p-6 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-50 text-[#2D7FF9]">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h2 className="mt-4 font-display text-xl font-bold text-[#021d33]">Přihlaste se do MeDipacient</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
        <p className="mt-3 text-xs leading-5 text-slate-500">
          Použijte stejný účet MedScopeGlobal jako na webu. Žádné druhé heslo.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <Button asChild className="h-11 rounded-full bg-[#2D7FF9] hover:bg-[#1f6ae0]">
            <Link href={loginUrl}>
              <LogIn className="mr-2 h-4 w-4" />
              Přihlásit se a otevřít aplikaci
            </Link>
          </Button>
          <Button asChild variant="ghost" className="h-10 rounded-full text-[#2D7FF9]">
            <Link href={MEDIPACIENT.routes.marketing}>Jak MeDipacient funguje</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
