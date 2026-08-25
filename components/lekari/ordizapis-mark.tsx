import Image from "next/image";
import { ORDIZAPIS } from "@/lib/lekari/dokumentace/branding";

type Size = "sm" | "md" | "lg" | "xl";

const SIZE_PX: Record<Size, number> = {
  sm: 36,
  md: 48,
  lg: 72,
  xl: 112,
};

export function OrdiZapisMark({
  size = "md",
  className,
  priority,
}: {
  size?: Size;
  className?: string;
  priority?: boolean;
}) {
  const px = SIZE_PX[size];
  return (
    <Image
      src={ORDIZAPIS.assets.icon192}
      alt={`${ORDIZAPIS.shortName} — ${ORDIZAPIS.provider}`}
      width={px}
      height={px}
      priority={priority}
      className={
        className ??
        "rounded-[22%] shadow-[0_8px_24px_-12px_rgba(2,29,51,0.55)]"
      }
    />
  );
}

export function OrdiZapisLockup({
  tone = "dark",
  showTagline = true,
  className,
}: {
  tone?: "dark" | "light";
  showTagline?: boolean;
  className?: string;
}) {
  const title = tone === "light" ? "text-white" : "text-[#021d33]";
  const sub = tone === "light" ? "text-sky-200" : "text-[#005B96]";
  const muted = tone === "light" ? "text-sky-100/85" : "text-slate-600";

  return (
    <div className={`flex items-center gap-3 sm:gap-4 ${className ?? ""}`}>
      <OrdiZapisMark size="lg" priority />
      <div className="min-w-0">
        <p className={`font-display text-2xl font-bold tracking-tight sm:text-3xl ${title}`}>
          {ORDIZAPIS.shortName}
        </p>
        <p className={`text-xs font-semibold sm:text-sm ${sub}`}>{ORDIZAPIS.lockline}</p>
        {showTagline ? (
          <p className={`mt-1 text-sm leading-5 ${muted}`}>{ORDIZAPIS.tagline}</p>
        ) : null}
      </div>
    </div>
  );
}
