import Image from "next/image";
import { MAGAZINE, getMagazineCopy } from "@/lib/brand/magazine";
import { cn } from "@/lib/utils";

type MarkVariant = "hero" | "compact" | "footer";

export function ViaLongeVitaMark({
  variant = "compact",
  locale,
  priority = false,
  className,
}: {
  variant?: MarkVariant;
  locale?: string;
  priority?: boolean;
  className?: string;
}) {
  const copy = getMagazineCopy(locale);

  if (variant === "hero") {
    return (
      <div className={cn("text-center", className)}>
        <Image
          src={MAGAZINE.emailLockup}
          alt={MAGAZINE.name}
          width={1200}
          height={340}
          priority={priority}
          className="mx-auto h-auto w-full max-w-[560px] object-contain"
        />
        <p className="mt-3 font-display text-sm text-[#c5d9ea] sm:text-base">{copy.tagline}</p>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d4af37]/85">
          {copy.eyebrow}
        </p>
      </div>
    );
  }

  if (variant === "footer") {
    return (
      <Image
        src={MAGAZINE.emailLockup}
        alt={MAGAZINE.name}
        width={1200}
        height={340}
        className={cn("h-auto w-full max-w-[280px] rounded-md object-contain", className)}
      />
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="relative h-7 w-[6.25rem] shrink-0 overflow-hidden rounded-sm bg-[#050b1d]">
        <Image
          src={MAGAZINE.emailLockup}
          alt=""
          fill
          className="object-cover object-center"
          sizes="100px"
        />
      </span>
      <span className="font-display text-sm font-semibold tracking-[0.02em] text-[#021d33]">
        {MAGAZINE.name}
      </span>
    </span>
  );
}

export function ViaLongeVitaMasthead({
  title,
  blurb,
  locale,
  className,
}: {
  title: string;
  blurb: string;
  locale?: string;
  className?: string;
}) {
  const copy = getMagazineCopy(locale);
  return (
    <header
      className={cn(
        "relative overflow-hidden rounded-2xl border border-[#0b1f3a] bg-[#050b1d] shadow-md",
        className
      )}
    >
      <div className="absolute inset-0">
        <Image
          src={MAGAZINE.emailLockup}
          alt=""
          fill
          className="object-cover object-center opacity-40"
          sizes="(max-width: 1280px) 100vw, 1280px"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050b1d] via-[#050b1d]/88 to-[#050b1d]/50" />
      </div>
      <div className="relative px-5 py-6 sm:px-8 sm:py-8">
        <Image
          src={MAGAZINE.emailLockup}
          alt={MAGAZINE.name}
          width={1200}
          height={340}
          priority
          className="h-auto w-full max-w-[420px] object-contain"
        />
        <p className="mt-3 text-xs font-medium uppercase tracking-[0.2em] text-[#9ec9e8]">
          {copy.tagline}
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{blurb}</p>
      </div>
    </header>
  );
}
