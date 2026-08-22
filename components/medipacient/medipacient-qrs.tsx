import { QrCode, Smartphone } from "lucide-react";
import { MEDIPACIENT } from "@/lib/medipacient/branding";

function qrSrc(store: "ios" | "android") {
  const params = new URLSearchParams({
    public: "1",
    target: MEDIPACIENT.downloadQrTarget,
    install: "1",
    store,
    source: "qr",
  });
  return `/api/lekari/dokumentace/qr?${params.toString()}`;
}

export function MeDipacientQrs() {
  const iosHref = `${MEDIPACIENT.installUrl}&store=ios&source=qr`;
  const androidHref = `${MEDIPACIENT.installUrl}&store=android&source=qr`;

  return (
    <div className="rounded-2xl border border-[#2D7FF9]/15 bg-white p-5">
      <div className="flex items-start gap-2">
        <QrCode className="mt-0.5 h-5 w-5 shrink-0 text-[#2D7FF9]" aria-hidden />
        <div>
          <h2 className="font-display text-lg font-semibold text-[#1B1F23]">Nainstalovat z telefonu (QR)</h2>
          <p className="mt-1 text-sm text-slate-600">
            Naskenujte QR → otevře se MeDipacient → přidejte na plochu. Fotky zpráv fungují i bez dat.
          </p>
        </div>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <a
          href={iosHref}
          className="flex flex-col items-center rounded-xl border border-slate-200 bg-[#F5F7FA] p-4 hover:border-[#2D7FF9]"
        >
          <span className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrSrc("ios")}
              alt="QR — instalace MeDipacient na iPhone"
              width={176}
              height={176}
              className="block h-[176px] w-[176px] bg-white contrast-125"
            />
          </span>
          <p className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#1B1F23]">
            <Smartphone className="h-3.5 w-3.5" />
            iPhone · Safari
          </p>
        </a>
        <a
          href={androidHref}
          className="flex flex-col items-center rounded-xl border border-slate-200 bg-[#F5F7FA] p-4 hover:border-[#2D7FF9]"
        >
          <span className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrSrc("android")}
              alt="QR — instalace MeDipacient na Android"
              width={176}
              height={176}
              className="block h-[176px] w-[176px] bg-white contrast-125"
            />
          </span>
          <p className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#1B1F23]">
            <Smartphone className="h-3.5 w-3.5" />
            Android · Chrome
          </p>
        </a>
      </div>
    </div>
  );
}
