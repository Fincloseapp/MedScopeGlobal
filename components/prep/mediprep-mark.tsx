import Image from "next/image";
import { MEDIPREP } from "@/lib/prep/branding";

type Size = "sm" | "md" | "lg" | "xl";
const SIZE_PX: Record<Size, number> = { sm: 36, md: 48, lg: 72, xl: 112 };

export function MeDiprepMark({
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
      src={MEDIPREP.assets.icon192}
      alt={`${MEDIPREP.shortName} — ${MEDIPREP.provider}`}
      width={px}
      height={px}
      priority={priority}
      className={className ?? "rounded-[22%] shadow-[0_8px_24px_-12px_rgba(26,35,50,0.45)]"}
    />
  );
}

export function MeDiprepLogo({
  className,
  priority,
  variant = "light",
}: {
  className?: string;
  priority?: boolean;
  variant?: "light" | "dark";
}) {
  const dark = variant === "dark";
  return (
    <Image
      src={dark ? MEDIPREP.assets.logoDark : MEDIPREP.assets.logo}
      alt={`${MEDIPREP.shortName} – ${MEDIPREP.partnerLine}`}
      width={1080}
      height={320}
      priority={priority}
      className={className ?? "h-16 w-auto max-w-full object-contain object-left sm:h-20"}
    />
  );
}

export function MeDiprepLockup({
  showTagline = true,
  className,
}: {
  showTagline?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex min-w-0 flex-col gap-1 ${className ?? ""}`}>
      <MeDiprepLogo priority />
      {showTagline ? (
        <p className="text-sm leading-5 text-slate-600">{MEDIPREP.tagline}</p>
      ) : null}
    </div>
  );
}
