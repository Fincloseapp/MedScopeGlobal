export type PublicAvatarType = "friendly_doctor" | "nurse" | "wellness_coach";

export type PublicAvatarConfig = {
  id: PublicAvatarType;
  name: string;
  role: string;
  imageUrl: string;
  heygenAvatarId?: string;
  voiceHint: string;
};

/** European-style public health presenters */
export const PUBLIC_OSVTA_AVATARS: Record<PublicAvatarType, PublicAvatarConfig> = {
  friendly_doctor: {
    id: "friendly_doctor",
    name: "MUDr. Martin Novák",
    role: "Praktický lékař",
    imageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=640&q=80",
    voiceHint: "cs_male_warm",
  },
  nurse: {
    id: "nurse",
    name: "Sestra Klára Horáková",
    role: "Všeobecná sestra",
    imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=640&q=80",
    voiceHint: "cs_female_caring",
  },
  wellness_coach: {
    id: "wellness_coach",
    name: "Petra Svobodová",
    role: "Wellness kouč",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=640&q=80",
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
