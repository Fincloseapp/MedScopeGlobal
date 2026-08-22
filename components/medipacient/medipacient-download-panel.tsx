import Link from "next/link";
import { Download, LogIn, QrCode, Smartphone } from "lucide-react";
import { MeDipacientMark } from "@/components/medipacient/medipacient-mark";
import { MEDIPACIENT } from "@/lib/medipacient/branding";

type Variant = "homepage" | "marketing" | "app";

export function MeDipacientDownloadPanel({
  variant = "marketing",
  className,
}: {
  variant?: Variant;
  className?: string;
}) {
  const compact = variant === "app";
  const qrSrc = `/api/lekari/dokumentace/qr?${new URLSearchParams({
    public: "1",
    target: MEDIPACIENT.downloadQrTarget,
    install: "1",
  }).toString()}`;

  return (
    <div
      className={
        className ??
        (variant === "homepage"
          ? "relative overflow-hidden rounded-3xl border border-[#2D7FF9]/30 bg-[#021d33] text-white shadow-xl"
          : "relative overflow-hidden rounded-2xl border border-[#2D7FF9]/30 bg-[#021d33] text-white shadow-sm")
      }
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_90%_10%,rgba(45,127,249,0.35),transparent_55%),radial-gradient(ellipse_at_10%_80%,rgba(74,222,128,0.12),transparent_40%)]"
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
            <MeDipacientMark size="md" className="rounded-[22%] ring-2 ring-white/25" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-sky-200">
                Aplikace pro veřejnost · {MEDIPACIENT.domain}
              </p>
              <p className="text-sm font-medium text-sky-100/90">{MEDIPACIENT.tagline}</p>
            </div>
          </div>
          <h2
            className={`mt-2 font-display font-bold ${
              variant === "homepage" ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"
            }`}
          >
            Stáhnout {MEDIPACIENT.shortName}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-sky-50/95">
            {MEDIPACIENT.pitch} Nainstalujete z prohlížeče na plochu — bez App Store i Google Play.
          </p>
          <p className="mt-2 text-xs leading-5 text-sky-100/90">
            Vzdělávací nástroj pro přehled zpráv. Nenahrazuje lékařskou péči ani diagnózu.
          </p>
          <ol className="mt-4 space-y-1.5 text-xs leading-5 text-sky-100/90">
            <li>
              <strong className="text-white">iPhone:</strong> Safari → Sdílet → Přidat na plochu
            </li>
            <li>
              <strong className="text-white">Android:</strong> Chrome → Nainstalovat aplikaci
            </li>
            <li>
              <strong className="text-white">PC:</strong> Chrome/Edge → ikona ⊕ v adresním řádku
            </li>
          </ol>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <a
              href={MEDIPACIENT.installUrl}
              className="inline-flex h-10 items-center rounded-full bg-[#2D7FF9] px-5 text-sm font-semibold text-white hover:bg-[#1f6ae0]"
            >
              <Smartphone className="mr-2 h-4 w-4" />
              Otevřít aplikaci a nainstalovat
            </a>
            <Link
              href={`${MEDIPACIENT.routes.download}?guide=1`}
              className="inline-flex h-10 items-center rounded-full border border-white/40 bg-transparent px-5 text-sm font-semibold text-white hover:bg-white/10"
            >
              Průvodce stažením
            </Link>
            <Link
              href={MEDIPACIENT.routes.app}
              className="inline-flex h-10 items-center rounded-full bg-white px-5 text-sm font-semibold text-[#021d33] hover:bg-sky-50"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Použít v prohlížeči (bez instalace)
            </Link>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="rounded-2xl bg-white p-4 shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrSrc}
              alt={`QR kód pro stažení ${MEDIPACIENT.fullName}`}
              width={180}
              height={180}
              className="block h-[176px] w-[176px] bg-white contrast-125 sm:h-[180px] sm:w-[180px]"
            />
          </div>
          <p className="flex items-center gap-1.5 text-center text-[11px] text-sky-100/85">
            <QrCode className="h-3.5 w-3.5" />
            Naskenujte a nainstalujte MeDipacient na plochu telefonu
          </p>
          <p className="max-w-[220px] text-center text-[10px] text-sky-100/70">
            <Download className="mr-1 inline h-3 w-3" />
            PC: Chrome/Edge → Instalovat · Android: Instalovat · iOS Safari: Sdílet → Na plochu
          </p>
        </div>
      </div>
    </div>
  );
}
