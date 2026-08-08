"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, QrCode, ShieldCheck, Building2, Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InstallAppButton } from "@/components/lekari/dok-app/install-app-button";
import { DOKSCOPE } from "@/lib/lekari/dokumentace/branding";

type EligibilityResponse = {
  eligible: boolean;
  canInstall: boolean;
  reason: string;
  email?: string | null;
  displayName?: string | null;
  message: string;
  facilities: Array<{ id: string; name: string; role: string }>;
  installUrl: string | null;
  linkedInstallUrl: string | null;
  verifyUrl: string;
  loginUrl: string;
};

type Variant = "homepage" | "marketing" | "app";

export function DokumentaceDownloadPanel({
  variant = "marketing",
  className,
}: {
  variant?: Variant;
  className?: string;
}) {
  const [data, setData] = useState<EligibilityResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/lekari/dokumentace/eligibility", {
          credentials: "same-origin",
        });
        if (res.ok) {
          setData((await res.json()) as EligibilityResponse);
        } else {
          setData(null);
        }
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const canInstall = Boolean(data?.canInstall);
  const qrSrc = canInstall
    ? `/api/lekari/dokumentace/qr?linked=1&t=${Date.now()}`
    : "/api/lekari/dokumentace/qr?public=1";

  const compact = variant === "app";

  return (
    <div
      className={
        className ??
        (variant === "homepage"
          ? "relative overflow-hidden rounded-3xl border border-white/15 bg-[#021d33] text-white shadow-xl"
          : "relative overflow-hidden rounded-2xl border border-[#005B96]/30 bg-[#021d33] text-white shadow-sm")
      }
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_90%_10%,rgba(0,91,150,0.45),transparent_55%)]"
        aria-hidden
      />
      <div
        className={`relative grid gap-6 ${compact ? "p-4" : "p-6 sm:p-8"} ${
          variant === "homepage" ? "lg:grid-cols-[1.2fr_auto] lg:items-center" : "md:grid-cols-[1fr_auto] md:items-center"
        }`}
      >
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-sky-200">
            Aplikace pro ověřené lékaře
          </p>
          <h2
            className={`mt-2 font-display font-bold ${
              variant === "homepage" ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"
            }`}
          >
            {"Stáhnout "}{DOKSCOPE.shortName}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-sky-100/95">
            {DOKSCOPE.fullName} — AI zápisy z nahrávky nebo diktátu. Instalovatelná aplikace
            propojená s účtem MedScopeGlobal. Stažení jen po ověření · {DOKSCOPE.domain}
          </p>

          {loading ? (
            <p className="mt-4 inline-flex items-center gap-2 text-xs text-sky-100/80">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Ověřuji přístup…
            </p>
          ) : canInstall ? (
            <div className="mt-4 space-y-2">
              <p className="inline-flex items-center gap-2 rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-medium text-emerald-100">
                <ShieldCheck className="h-3.5 w-3.5" />
                {data?.displayName || data?.email || "Ověřený lékař"} — stažení odemčeno
              </p>
              {data?.facilities?.length ? (
                <p className="inline-flex items-center gap-2 text-xs text-sky-100/90">
                  <Building2 className="h-3.5 w-3.5" />
                  Zařízení: {data.facilities.map((f) => f.name).join(", ")}
                </p>
              ) : null}
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <InstallAppButton gated canInstall />
                <Button asChild variant="outline" className="h-9 rounded-full border-white/40 bg-transparent text-white hover:bg-white/10">
                  <Link href="/app/dokumentace">Otevřít aplikaci</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <p className="text-xs leading-5 text-amber-100/95">
                {data?.message ||
                  "Stažení je dostupné jen ověřeným lékařům. Přihlaste se a dokončete ověření."}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button asChild className="h-10 rounded-full bg-white px-5 text-[#021d33] hover:bg-sky-50">
                  <Link href={data?.loginUrl || "/login?next=/app/dokumentace"}>
                    <LogIn className="mr-2 h-4 w-4" />
                    Přihlásit se
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-10 rounded-full border-white/40 bg-transparent px-5 text-white hover:bg-white/10"
                >
                  <Link href={data?.verifyUrl || "/academy/lekari/overeni"}>
                    Ověřit lékařský účet
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-10 rounded-full border-white/40 bg-transparent px-5 text-white hover:bg-white/10"
                >
                  <Link href="/lekari/dokumentace">Více o Dokumentaci</Link>
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="rounded-2xl bg-white p-3 shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrSrc}
              alt={`QR kód pro stažení ${DOKSCOPE.fullName}`}
              width={180}
              height={180}
              className="h-[160px] w-[160px] sm:h-[180px] sm:w-[180px]"
            />
          </div>
          <p className="flex items-center gap-1.5 text-center text-[11px] text-sky-100/85">
            <QrCode className="h-3.5 w-3.5" />
            {canInstall
              ? "Naskenujte telefonem — odkaz je vázaný na váš účet"
              : "Naskenujte a přihlaste se ověřeným lékařským účtem"}
          </p>
          {canInstall ? (
            <p className="max-w-[200px] text-center text-[10px] text-sky-100/70">
              <Download className="mr-1 inline h-3 w-3" />
              Android: Instalovat · iOS Safari: Sdílet → Na plochu
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
