import type { MedScopeLogoVariant } from "@/lib/brand/logo";

export type LogoPreset =
  | "header"
  | "footer"
  | "newsletter-hero"
  | "newsletter-footer"
  | "admin-login"
  | "admin-sidebar"
  | "mobile";

export type LogoPresetConfig = {
  width: number;
  height: number;
  variant: MedScopeLogoVariant | "auto";
  imageClassName: string;
  className?: string;
};

/** Premium sizing — NEJM / Lancet / BMJ inspired */
export const LOGO_PRESETS: Record<LogoPreset, LogoPresetConfig> = {
  header: {
    width: 240,
    height: 56,
    variant: "auto",
    imageClassName:
      "h-11 w-auto min-w-[140px] max-w-[180px] object-contain sm:h-14 sm:max-w-[220px]",
    className: "p-0",
  },
  footer: {
    width: 200,
    height: 48,
    variant: "auto",
    imageClassName: "h-12 w-auto min-w-[140px] max-w-[200px] object-contain align-middle",
    className: "p-2 align-middle",
  },
  "newsletter-hero": {
    width: 300,
    height: 80,
    variant: "negative",
    imageClassName: "h-20 w-auto min-w-[140px] object-contain brightness-110",
    className: "pb-6",
  },
  "newsletter-footer": {
    width: 200,
    height: 48,
    variant: "transparent",
    imageClassName: "h-12 w-auto min-w-[140px] object-contain",
    className: "pt-2",
  },
  "admin-login": {
    width: 320,
    height: 96,
    variant: "auto",
    imageClassName: "h-24 w-auto min-w-[140px] max-w-[280px] object-contain",
    className: "mx-auto mb-6",
  },
  "admin-sidebar": {
    width: 180,
    height: 48,
    variant: "auto",
    imageClassName: "h-12 w-auto min-w-[120px] object-contain",
    className: "align-middle",
  },
  mobile: {
    width: 160,
    height: 44,
    variant: "auto",
    imageClassName: "h-11 w-auto max-w-[160px] object-contain",
    className: "p-1.5 sm:p-2",
  },
};
