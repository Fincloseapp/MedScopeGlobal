import Image from "next/image";
import {
  VITASCOPE,
  vitascopeLogoForDesk,
  vitascopeLogoForTrack,
  type VitascopeMedTrack,
} from "@/lib/brand/vitascope";
import type { NewsDeskId } from "@/lib/v271/news-desks";

type Size = "sm" | "md" | "lg";

const SIZE_CLASS: Record<Size, string> = {
  sm: "h-10 w-10",
  md: "h-14 w-14 sm:h-16 sm:w-16",
  lg: "h-20 w-20 sm:h-24 sm:w-24",
};

export function VitascopeMark({
  desk,
  track,
  size = "md",
  showWordmark = false,
  className = "",
}: {
  desk?: NewsDeskId | null;
  track?: VitascopeMedTrack | null;
  size?: Size;
  showWordmark?: boolean;
  className?: string;
}) {
  const src = track ? vitascopeLogoForTrack(track) : vitascopeLogoForDesk(desk);
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span
        className={`relative shrink-0 overflow-hidden rounded-full border border-white/10 bg-[#050b1d] shadow-sm ${SIZE_CLASS[size]}`}
      >
        <Image
          src={src}
          alt={`${VITASCOPE.name} — ${VITASCOPE.tagline}`}
          fill
          className="object-cover object-center"
          sizes={size === "lg" ? "96px" : size === "md" ? "64px" : "40px"}
          priority={size === "lg"}
        />
      </span>
      {showWordmark ? (
        <span className="min-w-0">
          <span className="block font-display text-sm font-semibold tracking-[0.04em] text-[#7dd3fc] sm:text-base">
            {VITASCOPE.name}
          </span>
          <span className="mt-0.5 block text-xs text-slate-300">{VITASCOPE.tagline}</span>
        </span>
      ) : null}
    </div>
  );
}

export function VitascopeMastheadBanner({
  desk,
  track,
  title,
  blurb,
}: {
  desk?: NewsDeskId | null;
  track?: VitascopeMedTrack | null;
  title: string;
  blurb: string;
}) {
  const src = track ? vitascopeLogoForTrack(track) : vitascopeLogoForDesk(desk);
  return (
    <header className="relative overflow-hidden rounded-2xl border border-[#0b1f3a] bg-[#050b1d] shadow-md">
      <div className="absolute inset-0">
        <Image
          src={src}
          alt=""
          fill
          className="object-cover object-[center_35%] opacity-55"
          sizes="(max-width: 1280px) 100vw, 1280px"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050b1d] via-[#050b1d]/92 to-[#050b1d]/55" />
      </div>
      <div className="relative flex flex-wrap items-center gap-4 px-5 py-6 sm:px-8 sm:py-8">
        <VitascopeMark desk={desk} track={track} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-semibold tracking-[0.08em] text-[#7dd3fc] sm:text-base">
            {VITASCOPE.name}
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold text-white sm:text-4xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{blurb}</p>
        </div>
      </div>
    </header>
  );
}
