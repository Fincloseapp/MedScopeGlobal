import { MEDIPACIENT } from "@/lib/medipacient/branding";

type Size = "sm" | "md" | "lg" | "xl";
const SIZE_PX: Record<Size, number> = { sm: 36, md: 48, lg: 72, xl: 112 };

export function MeDipacientMark({
  size = "md",
  className,
}: {
  size?: Size;
  className?: string;
}) {
  const px = SIZE_PX[size];
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={px}
      height={px}
      className={className ?? "rounded-[22%] shadow-[0_8px_24px_-12px_rgba(2,29,51,0.45)]"}
      aria-label={`${MEDIPACIENT.shortName} — ${MEDIPACIENT.provider}`}
      role="img"
    >
      <rect width="64" height="64" rx="14" fill={MEDIPACIENT.colors.primary} />
      <rect x="28" y="16" width="8" height="32" rx="2" fill="#fff" />
      <rect x="16" y="28" width="32" height="8" rx="2" fill="#fff" />
      <circle cx="50" cy="14" r="5" fill={MEDIPACIENT.colors.accent} />
    </svg>
  );
}

export function MeDipacientLockup({
  tone = "dark",
  showTagline = true,
  size = "lg",
  className,
}: {
  tone?: "dark" | "light";
  showTagline?: boolean;
  size?: Size;
  className?: string;
}) {
  const title = tone === "light" ? "text-white" : "text-[#021d33]";
  const sub = tone === "light" ? "text-sky-200" : "text-[#2D7FF9]";
  const muted = tone === "light" ? "text-sky-100/85" : "text-slate-600";
  const titleSize =
    size === "xl"
      ? "text-3xl sm:text-4xl"
      : size === "lg"
        ? "text-2xl sm:text-3xl"
        : "text-xl sm:text-2xl";

  return (
    <div className={`flex items-center gap-3 sm:gap-4 ${className ?? ""}`}>
      <MeDipacientMark size={size} className="shrink-0 rounded-[22%] shadow-[0_8px_24px_-12px_rgba(2,29,51,0.45)]" />
      <div className="min-w-0">
        <p className={`font-display font-bold tracking-tight ${titleSize} ${title}`}>
          {MEDIPACIENT.shortName}
        </p>
        <p className={`text-xs font-semibold sm:text-sm ${sub}`}>{MEDIPACIENT.lockline}</p>
        {showTagline ? (
          <p className={`mt-1 text-sm leading-5 sm:text-base ${muted}`}>{MEDIPACIENT.tagline}</p>
        ) : null}
      </div>
    </div>
  );
}
