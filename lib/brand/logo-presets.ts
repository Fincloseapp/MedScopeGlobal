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
    width: 310,
    height: 70,
    variant: "auto",
    imageClassName:
      "h-14 w-auto min-w-[168px] max-w-[240px] object-contain md:h-14 md:min-w-[170px] md:max-w-[232px] lg:h-[70px] lg:min-w-[196px] lg:max-w-[300px]",
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
    width: 390,
    height: 104,
    variant: "negative",
    imageClassName:
      "mx-auto h-[104px] w-auto min-w-[200px] max-w-[380px] object-contain brightness-110",
    className: "flex justify-center",
  },
  "newsletter-footer": {
    width: 240,
    height: 60,
    variant: "transparent",
    imageClassName: "mx-auto h-[60px] w-auto min-w-[170px] max-w-[280px] object-contain",
    className: "flex justify-center",
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
    width: 200,
    height: 56,
    variant: "auto",
    imageClassName: "h-14 w-auto min-w-[168px] max-w-[240px] object-contain",
    className: "p-0",
  },
};
