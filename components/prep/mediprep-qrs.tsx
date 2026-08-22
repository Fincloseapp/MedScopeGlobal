import { QrCode, Smartphone } from "lucide-react";
import { MEDIPREP } from "@/lib/prep/branding";

function qrSrc(store: "ios" | "android") {
  const params = new URLSearchParams({
    public: "1",
    target: MEDIPREP.downloadQrTarget,
    install: "1",
    store,
    source: "qr",
  });
  return `/api/lekari/dokumentace/qr?${params.toString()}`;
}

export function MeDiprepQrs() {
  const iosHref = `${MEDIPREP.routes.app}?install=1&store=ios&source=qr`;
  const androidHref = `${MEDIPREP.routes.app}?install=1&store=android&source=qr`;

  return (
    <div className="rounded-2xl border border-[#0A192F]/10 bg-[#F4F7FB] p-5">
      <div className="flex items-start gap-2">
        <QrCode className="mt-0.5 h-5 w-5 shrink-0 text-[#0A192F]" aria-hidden />
        <div>
          <h2 className="font-display text-lg font-semibold text-[#1A2332]">Z telefonu (QR)</h2>
          <p className="mt-1 text-sm text-[#5a5348]">
            Naskenujte — otevře se MeDiprep a stačí klepnout na Stáhnout. Bez nastavování.
          </p>
        </div>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <a
          href={iosHref}
          className="flex flex-col items-center rounded-xl border border-[#0A192F]/10 bg-white p-4 hover:border-[#A3E635]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrSrc("ios")} alt="QR — instalace MeDiprep na iPhone" width={140} height={140} className="h-[140px] w-[140px]" />
          <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#1A2332]">
            <Smartphone className="h-3.5 w-3.5" />
            iPhone
          </p>
        </a>
        <a
          href={androidHref}
          className="flex flex-col items-center rounded-xl border border-[#0A192F]/10 bg-white p-4 hover:border-[#A3E635]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrSrc("android")}
            alt="QR — instalace MeDiprep na Android"
            width={140}
            height={140}
            className="h-[140px] w-[140px]"
          />
          <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#1A2332]">
            <Smartphone className="h-3.5 w-3.5" />
            Android
          </p>
        </a>
      </div>
    </div>
  );
}
