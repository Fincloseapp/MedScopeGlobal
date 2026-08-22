"use client";

import Image from "next/image";
import Link from "next/link";
import { LogIn, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MeDiprepInstallButton } from "@/components/prep/mediprep-install-button";
import { MeDiprepLogo } from "@/components/prep/mediprep-mark";
import { MEDIPREP, MEDIPREP_ONBOARDING } from "@/lib/prep/branding";

type Variant = "homepage" | "marketing" | "app";

export function MeDiprepDownloadPanel({
  variant = "marketing",
  className,
}: {
  variant?: Variant;
  className?: string;
}) {
  const compact = variant === "app";
  const qrSrc = `/api/lekari/dokumentace/qr?${new URLSearchParams({
    public: "1",
    target: MEDIPREP.downloadQrTarget,
    install: "1",
  }).toString()}`;

  return (
    <div
      className={
        className ??
        (variant === "homepage"
          ? "relative overflow-hidden rounded-3xl border border-cyan-400/25 bg-[#07111F] text-white shadow-xl"
          : "relative overflow-hidden rounded-2xl border border-cyan-400/25 bg-[#07111F] text-white shadow-sm")
      }
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_90%_10%,rgba(34,211,238,0.22),transparent_55%),radial-gradient(ellipse_at_10%_80%,rgba(163,230,53,0.12),transparent_40%)]"
        aria-hidden
      />
      <div
        className={`relative grid gap-6 ${compact ? "p-4" : "p-6 sm:p-8"} ${
          variant === "homepage"
            ? "lg:grid-cols-[1.2fr_auto] lg:items-center"
            : "md:grid-cols-[1fr_auto] md:items-center"
        }`}
      >
        <div>
          <div className="mb-3">
            <MeDiprepLogo variant="dark" priority />
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-200">
            Aplikace pro studenty · {MEDIPREP.domain}
          </p>
          <p className="text-sm font-medium text-lime-300">{MEDIPREP.promoLine}</p>
          <h2
            className={`mt-2 font-display font-bold ${
              variant === "homepage" ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"
            }`}
          >
            Stáhnout {MEDIPREP.shortName}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-sky-50/95">
            Bez nastavování. Jedno klepnutí — ikona MeDiprep na ploše. První test zdarma — e-mail + kód, bez hesla.
          </p>
          <p className="mt-2 text-xs leading-5 text-cyan-100/90">{MEDIPREP_ONBOARDING.marketing.otpBlurb}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <MeDiprepInstallButton variant="hero" tone="light" />
            <Button asChild className="h-10 rounded-full bg-[#F97316] px-5 text-white hover:bg-[#ea6a0c]">
              <Link href={MEDIPREP.routes.app}>
                <LogIn className="mr-2 h-4 w-4" />
                Jen v prohlížeči
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          {!compact ? (
            <Image
              src={MEDIPREP.assets.promo}
              alt={`${MEDIPREP.shortName} – ${MEDIPREP.promoLine}`}
              width={1600}
              height={900}
              className="aspect-[4/3] w-full max-w-[280px] rounded-xl border border-cyan-200/20 bg-[#07111F] object-cover object-[center_38%] sm:max-w-[320px]"
            />
          ) : null}
          <div className="rounded-2xl bg-white p-3 shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrSrc}
              alt={`QR kód pro stažení ${MEDIPREP.fullName}`}
              width={180}
              height={180}
              className="h-[160px] w-[160px] sm:h-[180px] sm:w-[180px]"
            />
          </div>
          <p className="flex items-center gap-1.5 text-center text-[11px] text-sky-100/85">
            <QrCode className="h-3.5 w-3.5" />
            Naskenujte — v telefonu stačí Stáhnout
          </p>
        </div>
      </div>
    </div>
  );
}
