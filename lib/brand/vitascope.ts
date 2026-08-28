import type { NewsDeskId } from "@/lib/v271/news-desks";

/** VITASCOPE magazine mark — MedScopeGlobal editorial brand. */
export const VITASCOPE = {
  name: "VITASCOPE",
  tagline: "Magazín MedScopeGlobal",
  url: "https://medscopeglobal.com",
  /** Primary masthead (DNA + aperture + EKG). */
  masthead: "/assets/magazine/vitascope/masthead.jpg",
} as const;

/** One mark per news desk — selected from the VITASCOPE logo set. */
export const VITASCOPE_DESK_LOGO: Record<NewsDeskId, string> = {
  novinky: "/assets/magazine/vitascope/novinky.png",
  verejnost: "/assets/magazine/vitascope/verejnost.png",
  dlouhovekost: "/assets/magazine/vitascope/dlouhovekost.jpg",
  clanky: "/assets/magazine/vitascope/clanky.jpg",
};

/** Medical-track marks (remaining logo variants). */
export const VITASCOPE_TRACK_LOGO = {
  priprava: "/assets/magazine/vitascope/priprava.jpg",
  studium: "/assets/magazine/vitascope/studium.png",
} as const;

export type VitascopeMedTrack = keyof typeof VITASCOPE_TRACK_LOGO;

export function vitascopeLogoForDesk(desk: NewsDeskId | null | undefined): string {
  if (desk && VITASCOPE_DESK_LOGO[desk]) return VITASCOPE_DESK_LOGO[desk];
  return VITASCOPE.masthead;
}

export function vitascopeLogoForTrack(track: VitascopeMedTrack | null | undefined): string {
  if (track && VITASCOPE_TRACK_LOGO[track]) return VITASCOPE_TRACK_LOGO[track];
  return VITASCOPE.masthead;
}

