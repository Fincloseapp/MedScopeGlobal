import {
  editorialUnitLabel,
  type EditorialUnitId,
} from "@/lib/editorial/units";
import { OSVETA_AVATAR_TO_UNIT } from "@/lib/editorial/video-units";

export type PublicAvatarType = "friendly_doctor" | "nurse" | "wellness_coach";

export type PublicAvatarConfig = {
  id: PublicAvatarType;
  editorialUnitId: EditorialUnitId;
  /** Czech editorial unit label — no personal names */
  label: string;
  imageUrl: string;
  heygenAvatarId?: string;
  voiceHint: string;
};

/** Public health video avatars — editorial units only, curated clinical imagery. */
export const PUBLIC_OSVTA_AVATARS: Record<PublicAvatarType, PublicAvatarConfig> = {
  friendly_doctor: {
    id: "friendly_doctor",
    editorialUnitId: OSVETA_AVATAR_TO_UNIT.friendly_doctor!,
    label: editorialUnitLabel(OSVETA_AVATAR_TO_UNIT.friendly_doctor!, "cs"),
    imageUrl: "/assets/covers/clinical.webp",
    voiceHint: "cs_male_warm",
  },
  nurse: {
    id: "nurse",
    editorialUnitId: OSVETA_AVATAR_TO_UNIT.nurse!,
    label: editorialUnitLabel(OSVETA_AVATAR_TO_UNIT.nurse!, "cs"),
    imageUrl: "/assets/covers/clinical-2.webp",
    voiceHint: "cs_female_caring",
  },
  wellness_coach: {
    id: "wellness_coach",
    editorialUnitId: OSVETA_AVATAR_TO_UNIT.wellness_coach!,
    label: editorialUnitLabel(OSVETA_AVATAR_TO_UNIT.wellness_coach!, "cs"),
    imageUrl: "/assets/covers/movement.webp",
    voiceHint: "cs_female_energetic",
  },
};

export function getPublicAvatar(type: string): PublicAvatarConfig {
  return PUBLIC_OSVTA_AVATARS[type as PublicAvatarType] ?? PUBLIC_OSVTA_AVATARS.friendly_doctor;
}

export function pickAvatarForCategory(category: string): PublicAvatarType {
  switch (category) {
    case "nemoc":
      return "nurse";
    case "dlouhovekost":
    case "zivotni-styl":
      return "wellness_coach";
    default:
      return "friendly_doctor";
  }
}
