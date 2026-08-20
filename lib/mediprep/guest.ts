import type { PrepSession } from "@/lib/mediprep/types";
import { MEDIPREP } from "@/lib/apps/catalog";

export const GUEST_PREP_SESSION: PrepSession = {
  authenticated: false,
  email: null,
  userId: null,
  entitled: false,
  displayName: null,
  firstTestUsed: false,
  message: "Stačí e-mail a ověřovací kód — bez hesla. První test zdarma.",
  loginUrl: `/login?next=${encodeURIComponent(MEDIPREP.appPath)}`,
};
