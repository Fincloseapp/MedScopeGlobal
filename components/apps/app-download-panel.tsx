"use client";

import Image from "next/image";
import Link from "next/link";
import { Download, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InstallPwaButton } from "@/components/apps/install-pwa-button";
import { appFullName, appLockline, type AppProduct } from "@/lib/apps/catalog";
import { getMarketingCopy } from "@/lib/i18n/marketing-copy";
import { getSubscribeCopy } from "@/lib/i18n/subscribe-copy";
import { getSurfaceCopy } from "@/lib/i18n/surface-copy";

export function AppDownloadPanel({
  app,
  variant = "marketing",
  className,
  extraCta,
  locale = "cs",
}: {
  app: AppProduct;
  variant?: "homepage" | "marketing" | "app";
  className?: string;
  extraCta?: { href: string; label: string };
  locale?: string;
}) {
  const qrSrc = `/api/apps/qr?app=${app.id}&t=1`;
  const compact = variant === "app";
  const apps = getMarketingCopy(locale).apps;
  const subscribe = getSubscribeCopy(locale);
  const tagline = getSurfaceCopy(locale).appTaglines[app.id] ?? app.tagline;
  const priceNote = subscribe.priceNoteByApp[app.id] ?? app.priceNote;
  const pitch = apps.pitch[app.id] ?? app.pitch;

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
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_90%_10%,rgba(45,127,249,0.35),transparent_55%)]"
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
          <div className="mb-3 flex items-center gap-3">
            <Image
              src={app.assets.icon192}
              alt={app.shortName}
              width={48}
              height={48}
              className="rounded-[22%] ring-2 ring-white/25"
            />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-sky-200">
                {apps.eyebrowApps} · {app.domain}
              </p>
              <p className="text-sm font-medium text-sky-100/90">{tagline}</p>
            </div>
          </div>
          <h2
            className={`mt-2 font-display font-bold ${
              variant === "homepage" ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"
            }`}
          >
            {apps.downloadTitle} {app.shortName}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-sky-100/95">
            {pitch} {apps.installLead}
          </p>
          <ol className="mt-4 space-y-1 text-xs text-sky-100/85">
            <li>{apps.stepIos}</li>
            <li>{apps.stepAndroid}</li>
            <li>{apps.stepDesktop}</li>
          </ol>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <InstallPwaButton app={app} />
            <Button
              asChild
              variant="outline"
              className="h-9 rounded-full border-white/40 bg-transparent text-white hover:bg-white/10"
            >
              <Link href={app.appPath}>
                {apps.openInstalled}
              </Link>
            </Button>
            {extraCta ? (
              <Button
                asChild
                variant="outline"
                className="h-9 rounded-full border-white/40 bg-transparent text-white hover:bg-white/10"
              >
                <Link href={extraCta.href}>{extraCta.label}</Link>
              </Button>
            ) : null}
          </div>
          <p className="mt-3 text-[11px] text-sky-100/70">{priceNote}</p>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="rounded-2xl bg-white p-3 shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrSrc}
              alt={`${apps.scanInstall} ${appFullName(app)}`}
              width={180}
              height={180}
              className="h-[160px] w-[160px] sm:h-[180px] sm:w-[180px]"
            />
          </div>
          <p className="flex items-center gap-1.5 text-center text-[11px] text-sky-100/85">
            <QrCode className="h-3.5 w-3.5" />
            {apps.scanInstall} {app.shortName}
          </p>
          <p className="max-w-[200px] text-center text-[10px] text-sky-100/70">
            <Download className="mr-1 inline h-3 w-3" />
            {appLockline(app)}
          </p>
        </div>
      </div>
    </div>
  );
}
