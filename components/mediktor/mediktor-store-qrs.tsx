"use client";

import { Apple, Play, Smartphone, QrCode } from "lucide-react";
import { MEDIKTOR } from "@/lib/lekari/dokumentace/branding";
import { MEDIKTOR_ONBOARDING, MEDIKTOR_STORE } from "@/lib/mediktor/copy";

/**
 * Build QR API URL. Keep `target` free of nested `&…` pairs — some edge layers
 * re-split encoded query values. Pass install/store as sibling params instead.
 */
function qrUrl(opts: { target: string; install?: boolean; store?: "ios" | "android" }): string {
  const params = new URLSearchParams({ public: "1", target: opts.target });
  if (opts.install) params.set("install", "1");
  if (opts.store) params.set("store", opts.store);
  return `/api/lekari/dokumentace/qr?${params.toString()}`;
}

/**
 * Dual QR block for App Store + Google Play.
 * When store URLs are missing, both QR codes point to the smart download landing
 * with platform hint (?store=ios|android) so phone install path is unmistakable.
 */
export function MediktorStoreQrs() {
  const smartBase = `https://${MEDIKTOR.domain}${MEDIKTOR_STORE.smartDownloadPath}`;
  const iosTarget =
    MEDIKTOR_STORE.appStoreUrl || `${smartBase}?install=1&store=ios`;
  const androidTarget =
    MEDIKTOR_STORE.playStoreUrl || `${smartBase}?install=1&store=android`;
  const honest = !MEDIKTOR_STORE.appStoreUrl && !MEDIKTOR_STORE.playStoreUrl;
  const iosQr = MEDIKTOR_STORE.appStoreUrl
    ? qrUrl({ target: MEDIKTOR_STORE.appStoreUrl })
    : qrUrl({ target: smartBase, install: true, store: "ios" });
  const androidQr = MEDIKTOR_STORE.playStoreUrl
    ? qrUrl({ target: MEDIKTOR_STORE.playStoreUrl })
    : qrUrl({ target: smartBase, install: true, store: "android" });

  return (
    <div className="rounded-2xl border border-[#cfe1f3] bg-white p-5 sm:p-6">
      <div className="flex items-start gap-2">
        <QrCode className="mt-0.5 h-5 w-5 shrink-0 text-[#005B96]" aria-hidden />
        <div>
          <h3 className="font-display text-lg font-bold text-[#021d33]">
            {honest
              ? "Nainstalovat na telefon (QR)"
              : MEDIKTOR_ONBOARDING.marketing.downloadCta}
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            {honest
              ? "Naskenujte QR telefonem → nainstalujte MeDiktor na plochu (ikona MeD) → e-mail + kód."
              : MEDIKTOR_ONBOARDING.marketing.startIn30}
          </p>
        </div>
      </div>
      {!honest ? (
        <p className="mt-2 text-xs leading-5 text-slate-500">
          {MEDIKTOR_ONBOARDING.marketing.otpBlurb}
        </p>
      ) : (
        <ol className="mt-3 list-decimal space-y-1 rounded-xl bg-[#eef6fb] px-4 py-3 pl-8 text-xs leading-5 text-[#021d33]">
          <li>Naskenujte QR odpovídající vašemu telefonu (iPhone / Android).</li>
          <li>Otevřete MeDiktor v prohlížeči a přidejte na plochu.</li>
          <li>Přihlaste se e-mailem + ověřovacím kódem (SMS zatím není).</li>
        </ol>
      )}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <a
          href={iosTarget}
          className="flex flex-col items-center rounded-xl border border-[#d9e8f4] bg-[#fafcff] p-4 transition hover:border-[#005B96]/40"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={iosQr}
            alt={honest ? "QR — instalace MeDiktor na iPhone (PWA)" : "QR App Store MeDiktor"}
            width={140}
            height={140}
            className="h-[140px] w-[140px]"
          />
          <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#021d33]">
            {honest ? <Smartphone className="h-3.5 w-3.5" /> : <Apple className="h-3.5 w-3.5" />}
            {honest ? "iPhone · nainstalovat" : "App Store"}
          </p>
          {honest ? (
            <p className="mt-1 text-center text-[10px] leading-4 text-slate-500">
              Safari → Sdílet → Přidat na plochu
            </p>
          ) : null}
        </a>
        <a
          href={androidTarget}
          className="flex flex-col items-center rounded-xl border border-[#d9e8f4] bg-[#fafcff] p-4 transition hover:border-[#005B96]/40"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={androidQr}
            alt={
              honest
                ? "QR — instalace MeDiktor na Android (PWA)"
                : "QR Google Play MeDiktor"
            }
            width={140}
            height={140}
            className="h-[140px] w-[140px]"
          />
          <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#021d33]">
            {honest ? <Smartphone className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {honest ? "Android · nainstalovat" : "Google Play"}
          </p>
          {honest ? (
            <p className="mt-1 text-center text-[10px] leading-4 text-slate-500">
              Chrome → ⋮ → Nainstalovat aplikaci
            </p>
          ) : null}
        </a>
      </div>
      {honest ? (
        <p className="mt-4 text-center text-[11px] text-slate-500">
          Stejná cesta:{" "}
          <a href={MEDIKTOR_STORE.smartDownloadPath} className="font-medium text-[#005B96] underline">
            {MEDIKTOR_STORE.smartDownloadPath}
          </a>
        </p>
      ) : null}
    </div>
  );
}
