"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LogIn,
  LogOut,
  CreditCard,
  User,
  Loader2,
  ShieldCheck,
  Building2,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { InstallAppButton } from "@/components/lekari/dok-app/install-app-button";
import { DokumentaceDownloadPanel } from "@/components/lekari/dokumentace-download-panel";

type EligibilityState = {
  eligible: boolean;
  canInstall: boolean;
  message: string;
  displayName?: string | null;
  email?: string | null;
  facilities: Array<{ id: string; name: string; role: string }>;
  loginUrl?: string;
  verifyUrl?: string;
};

type ReaderContext = {
  user: { id: string; email: string | null } | null;
  profile: { full_name?: string | null } | null;
  isVip: boolean;
  accessLevel: string | null;
};

export function DokAppAccount({
  eligibility,
  linkHint,
  onEligibility,
}: {
  eligibility?: EligibilityState | null;
  linkHint?: string | null;
  onEligibility?: (e: EligibilityState) => void;
}) {
  const [ctx, setCtx] = useState<ReaderContext | null>(null);
  const [elig, setElig] = useState<EligibilityState | null>(eligibility ?? null);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    if (eligibility) setElig(eligibility);
  }, [eligibility]);

  useEffect(() => {
    setOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);

    void (async () => {
      try {
        const [ctxRes, eligRes] = await Promise.all([
          fetch("/api/v22/reader-context", { credentials: "same-origin" }),
          fetch("/api/lekari/dokumentace/eligibility", { credentials: "same-origin" }),
        ]);
        if (ctxRes.ok) {
          setCtx((await ctxRes.json()) as ReaderContext);
        } else {
          setCtx({ user: null, profile: null, isVip: false, accessLevel: null });
        }
        if (eligRes.ok) {
          const e = (await eligRes.json()) as EligibilityState;
          setElig(e);
          onEligibility?.(e);
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
  }, [onEligibility]);

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
  const canInstall = Boolean(elig?.canInstall);

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
                  {ctx?.profile?.full_name || elig?.displayName || "Lékař"}
                </p>
                <p className="truncate text-xs text-slate-500">{ctx?.user?.email}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Přístup: {ctx?.isVip ? "VIP / předplatné" : ctx?.accessLevel || "základní"}
                </p>
                {canInstall ? (
                  <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Ověřený lékař — aplikace propojena s tímto účtem
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-amber-700">{elig?.message}</p>
                )}
                {elig?.facilities?.length ? (
                  <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-600">
                    <Building2 className="h-3.5 w-3.5 text-[#005B96]" />
                    {elig.facilities.map((f) => f.name).join(", ")}
                  </p>
                ) : null}
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-[#021d33]">Nejste přihlášeni</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Pro stažení, zápisy a historii se přihlaste ověřeným lékařským účtem.
                </p>
              </>
            )}
          </div>
        </div>

        {linkHint ? (
          <p className="mt-3 rounded-xl bg-[#eef6fb] px-3 py-2 text-xs leading-5 text-[#021d33]">
            <QrCode className="mr-1 inline h-3.5 w-3.5 text-[#005B96]" />
            {linkHint}
          </p>
        ) : null}

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

          {!canInstall ? (
            <Button asChild variant="outline" className="h-11 rounded-full border-[#cfe1f3]">
              <Link href="/academy/lekari/overeni">Ověřit lékařský účet</Link>
            </Button>
          ) : null}

          <Button asChild variant="outline" className="h-11 rounded-full border-[#cfe1f3]">
            <Link href="/predplatne#dokumentace">
              <CreditCard className="mr-2 h-4 w-4" />
              Předplatné MeDiktor (390 Kč)
            </Link>
          </Button>
        </div>
      </div>

      {canInstall ? (
        <div className="rounded-2xl border border-[#cfe1f3] bg-[#021d33] p-4 text-white">
          <p className="text-sm font-semibold">Instalace aplikace</p>
          <p className="mt-1 text-xs text-sky-100/90">
            Stažení MeDiktor je vázané na váš ověřený účet MedScopeGlobal — historie se synchronizuje.
          </p>
          <div className="mt-3">
            <InstallAppButton gated canInstall />
          </div>
        </div>
      ) : (
        <DokumentaceDownloadPanel variant="app" />
      )}

      <p className="text-center text-xs text-slate-500">
        <Link href="/lekari/dokumentace" className="text-[#005B96] underline">
          Zpět na marketingovou stránku
        </Link>
      </p>
    </div>
  );
}
