import { SITE } from "@/lib/config/site";
import { safeEditorialReturnPath } from "@/lib/editorial/return-path";
import { localizePublicHref } from "@/lib/i18n/nav-copy";

type AuthAdmin = {
  auth: {
    admin: {
      generateLink: (args: {
        type: "magiclink";
        email: string;
        options?: { redirectTo?: string };
      }) => Promise<{
        data: { properties?: { action_link?: string } | null } | null;
        error: { message?: string } | null;
      }>;
    };
  };
};

/** One-time sign-in so a guest payer can open Editorial on another device. */
export async function createEditorialMagicLink(
  admin: AuthAdmin,
  email: string,
  locale?: string | null,
  returnPath?: string | null
): Promise<string | null> {
  const normalized = String(email ?? "").trim().toLowerCase();
  if (!normalized.includes("@")) return null;
  const next = localizePublicHref(safeEditorialReturnPath(returnPath) ?? "/articles", locale ?? "cs");
  const redirectTo = `${SITE.url}/auth/callback?next=${encodeURIComponent(next)}`;
  try {
    const { data, error } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email: normalized,
      options: { redirectTo },
    });
    if (error || !data?.properties?.action_link) return null;
    return data.properties.action_link;
  } catch {
    return null;
  }
}
