export type AcademyBadge = {
  id: string;
  label: string;
  description: string;
  earned: boolean;
  icon: string;
};

const XP_TIERS: { min: number; id: string; label: string; description: string; icon: string }[] = [
  { min: 500, id: "expert", label: "Expert", description: "500+ XP celkem", icon: "🏆" },
  { min: 200, id: "advanced", label: "Pokročilý", description: "200+ XP celkem", icon: "⭐" },
  { min: 50, id: "student", label: "Student", description: "50+ XP celkem", icon: "📚" },
  { min: 0, id: "novice", label: "Nováček", description: "Začátek v Academy", icon: "🎓" },
];

export function computeXpBadges(totalXp: number): AcademyBadge[] {
  const earnedTier = XP_TIERS.find((t) => totalXp >= t.min) ?? XP_TIERS[XP_TIERS.length - 1];

  return XP_TIERS.map((tier) => ({
    id: tier.id,
    label: tier.label,
    description: tier.description,
    icon: tier.icon,
    earned: totalXp >= tier.min,
  })).reverse();
}

export function computeCourseBadges(opts: {
  completedCourses: number;
  passedQuizzes: number;
  certificates: number;
}): AcademyBadge[] {
  return [
    {
      id: "first-quiz",
      label: "První kvíz",
      description: "Splněný alespoň 1 kvíz",
      icon: "✅",
      earned: opts.passedQuizzes >= 1,
    },
    {
      id: "course-complete",
      label: "Absolvent",
      description: "Dokončený kurz",
      icon: "🎯",
      earned: opts.completedCourses >= 1,
    },
    {
      id: "certified",
      label: "Certifikovaný",
      description: "Vydaný certifikát",
      icon: "📜",
      earned: opts.certificates >= 1,
    },
  ];
}
