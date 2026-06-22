import { AlertTriangle } from "lucide-react";

type Props = {
  variant?: "banner" | "inline";
  className?: string;
};

export function PublicTrustDisclaimer({ variant = "banner", className = "" }: Props) {
  if (variant === "inline") {
    return (
      <p className={`text-xs leading-relaxed text-slate-500 ${className}`}>
        Informace na MedScopeGlobal slouží ke vzdělávání a orientaci ve zdraví. Nenahrazují
        vyšetření ani léčbu u lékaře. V akutních případech volejte{" "}
        <strong className="font-semibold text-slate-600">155</strong> nebo{" "}
        <strong className="font-semibold text-slate-600">112</strong>.
      </p>
    );
  }

  return (
    <div
      className={`flex gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/90 px-4 py-3.5 ${className}`}
      role="note"
      aria-label="Důležité upozornění"
    >
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden />
      <div>
        <p className="text-sm font-semibold text-amber-950">Důležité upozornění</p>
        <p className="mt-1 text-sm leading-relaxed text-amber-900/90">
          Obsah slouží ke vzdělávání — nenahrazuje lékařskou péči ani diagnózu. Při akutních
          potížích kontaktujte praktického lékaře nebo volejte{" "}
          <strong className="font-semibold">155</strong> / <strong className="font-semibold">112</strong>.
        </p>
      </div>
    </div>
  );
}
