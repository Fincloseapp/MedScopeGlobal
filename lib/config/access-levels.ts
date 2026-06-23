export const ACCESS_LEVELS = [
  {
    id: "public",
    labelKey: "access.public",
    descriptionKey: "access.publicDesc",
    order: 1,
  },
  {
    id: "physician",
    labelKey: "access.physician",
    descriptionKey: "access.physicianDesc",
    order: 2,
  },
] as const;

export type AccessLevelId = (typeof ACCESS_LEVELS)[number]["id"];

/** UI / content tier including student (between public and physician) */
export type ContentAccessLevel = AccessLevelId | "student";

export const ACCESS_RANK: Record<AccessLevelId, number> = {
  public: 1,
  physician: 2,
};

export const CONTENT_ACCESS_RANK: Record<ContentAccessLevel, number> = {
  public: 1,
  student: 2,
  physician: 3,
};

export function normalizeAccessLevel(level?: string | null): AccessLevelId {
  if (level === "physician") return "physician";
  return "public";
}

export function canAccessContent(
  userLevel: AccessLevelId | string,
  requiredLevel: AccessLevelId | string
): boolean {
  const normalizedUserLevel = normalizeAccessLevel(userLevel);
  const normalizedRequiredLevel = normalizeAccessLevel(requiredLevel);
  return ACCESS_RANK[normalizedUserLevel] >= ACCESS_RANK[normalizedRequiredLevel];
}

export function allowedAccessLevels(level: AccessLevelId | string): AccessLevelId[] {
  const normalizedLevel = normalizeAccessLevel(level);
  const rank = ACCESS_RANK[normalizedLevel];
  return (["public", "physician"] as AccessLevelId[]).filter(
    (l) => ACCESS_RANK[l] <= rank
  );
}

export const PROFESSIONS = [
  "general_public",
  "medical_student",
  "resident",
  "physician",
  "specialist",
  "pharmacist",
  "nurse",
  "researcher",
  "industry",
] as const;
