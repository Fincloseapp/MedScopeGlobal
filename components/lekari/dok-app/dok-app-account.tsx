"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogIn, LogOut, CreditCard, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { InstallAppButton } from "@/components/lekari/dok-app/install-app-button";

type ReaderContext = {
  user: { id: string; email: string | null } | null;
  profile: { full_name?: string | null } | null;
  isVip: boolean;
  accessLevel: string | null;
};

export function DokAppAccount() {
  const [ctx, setCtx] = useState<ReaderContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);

    void (async () => {
      try {
        const res = await fetch("/api/v22/reader-context", {
          credentials: "same-origin",
        });
        if (res.ok) {
          setCtx((await res.json()) as ReaderContext);
        } else {
          setCtx({ user: null, profile: null, isVip: false, accessLevel: null });
        }
      } catch {
        setCtx({ user: null, profile: null, isVip: false, accessLevel: null });
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login?next=/app/dokumentace";
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 px-4 py-16 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Načítám účet…
      </div>
    );
  }

  const loggedIn = Boolean(ctx?.user);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 px-3 pb-4 pt-2 sm:px-4">
      <div>
        <h2 className="text-base font-semibold text-[#021d33]">Účet</h2>
        <p className="mt-1 text-xs text-slate-500">
          Stav:{" "}
          <span className={online ? "text-emerald-600" : "text-amber-600"}>
            {online ? "online" : "offline"}
          </span>
        </p>
      </div>

      <div className="rounded-2xl border border-[#cfe1f3] bg-white p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e8f2f9] text-[#005B96]">
            <User className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            {loggedIn ? (
              <>
                <p className="truncate text-sm font-semibold text-[#021d33]">
                  {ctx?.profile?.full_name || "Lékař"}
                </p>
                <p className="truncate text-xs text-slate-500">{ctx?.user?.email}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Přístup: {ctx?.isVip ? "VIP / předplatné" : ctx?.accessLevel || "základní"}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-[#021d33]">Nejste přihlášeni</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Pro ukládání zápisů a historii se přihlaste.
                </p>
              </>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          {!loggedIn ? (
            <Button asChild className="h-11 rounded-full bg-[#005B96]">
              <Link href="/login?next=/app/dokumentace">
                <LogIn className="mr-2 h-4 w-4" />
                Přihlásit se
              </Link>
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-full border-[#cfe1f3]"
              onClick={() => void signOut()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Odhlásit se
            </Button>
          )}

          <Button asChild variant="outline" className="h-11 rounded-full border-[#cfe1f3]">
            <Link href="/predplatne#dokumentace">
              <CreditCard className="mr-2 h-4 w-4" />
              Předplatné Dokumentace (390 Kč)
            </Link>
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-[#cfe1f3] bg-[#021d33] p-4 text-white">
        <p className="text-sm font-semibold">Instalace aplikace</p>
        <p className="mt-1 text-xs text-sky-100/90">
          Stáhněte si MedScope Dokumentace na plochu — funguje jako nativní aplikace.
        </p>
        <div className="mt-3">
          <InstallAppButton />
        </div>
      </div>

      <p className="text-center text-xs text-slate-500">
        <Link href="/lekari/dokumentace" className="text-[#005B96] underline">
          Zpět na marketingovou stránku
        </Link>
      </p>
    </div>
  );
}
