import {
  ARENA_ROLES,
  ARENA_SECTIONS,
  isArenaTeamSlug,
  sectionById,
  type ArenaRole,
  type ArenaSectionId,
  type ArenaTeamSlug,
} from "@/lib/growth/arena/config";
import { localeToPathSegment } from "@/lib/i18n/locale-path";
import { SITE } from "@/lib/config/site";

export type ArenaRef = {
  team: ArenaTeamSlug;
  role: ArenaRole | null;
  section: ArenaSectionId;
};

const ROLE_SET = new Set<string>(ARENA_ROLES);

function clean(raw?: string | null): string {
  return String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function parseArenaRef(
  raw?: string | null,
  sectionRaw?: string | null
): ArenaRef | null {
  const key = clean(raw).replace(/^team-/, "");
  if (!key) return null;
  const parts = key.split("-").filter(Boolean);
  let team: ArenaTeamSlug | null = null;
  let role: ArenaRole | null = null;
  let section: ArenaSectionId | null = null;

  for (const part of parts) {
    if (isArenaTeamSlug(part)) team = part;
    else if (ROLE_SET.has(part)) role = part as ArenaRole;
    else if (ARENA_SECTIONS.some((row) => row.id === part)) section = part as ArenaSectionId;
  }

  if (!team) return null;
  const fromQuery = ARENA_SECTIONS.some((row) => row.id === sectionRaw)
    ? (sectionRaw as ArenaSectionId)
    : null;
  return {
    team,
    role,
    section: fromQuery ?? section ?? "vialongevita",
  };
}

export function arenaHopPath(section: ArenaSectionId, locale?: string | null): string {
  const spec = sectionById(section);
  if (spec.czechOnly && locale && !String(locale).toLowerCase().startsWith("cs")) {
    return "/predplatne";
  }
  return spec.path;
}

export function arenaHopUrl(input: {
  team: ArenaTeamSlug;
  section?: ArenaSectionId;
  locale?: string | null;
  base?: string;
}): string {
  const origin = (input.base ?? SITE.url).replace(/\/$/, "");
  const locale = input.locale ?? "cs";
  const section = input.section ?? "vialongevita";
  const url = new URL(`${origin}/r/ai`);
  url.searchParams.set("ref", input.team);
  url.searchParams.set("section", section);
  url.searchParams.set("locale", localeToPathSegment(locale));
  return url.toString();
}
