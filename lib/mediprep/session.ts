import { cookies } from "next/headers";
import { getSessionProfile } from "@/lib/auth/session";
import { getVipSubscription } from "@/lib/vip";
import { MEDIPREP } from "@/lib/apps/catalog";
import { buildValidityLabel, type AppAccessInfo } from "@/lib/apps/access-status";
import type { PrepSession } from "@/lib/mediprep/types";
import { MEDIPREP_FREE_TEST_COOKIE } from "@/lib/studenti/pricing";

export const MEDIPREP_OTP_COOKIE = "mediprep_otp_email";

export type { PrepSession };

const SUBSCRIBE = "/predplatne#student";

export async function getPrepSession(): Promise<PrepSession> {
  const { user, profile } = await getSessionProfile();
  const loginUrl = `/login?next=${encodeURIComponent(MEDIPREP.appPath)}`;
  const jar = await cookies();
  const otpEmail = jar.get(MEDIPREP_OTP_COOKIE)?.value ?? null;
  const freeUsed = jar.get(MEDIPREP_FREE_TEST_COOKIE)?.value === "1";

  if (!user) {
    if (otpEmail) {
      const access: AppAccessInfo = {
        authenticated: true,
        accountLabel: otpEmail,
        email: otpEmail,
        planLabel: "E-mail ověřen · první test",
        entitled: false,
        validUntil: null,
        validityLabel: "omezený přístup (OTP)",
        loginUrl,
        subscribeUrl: SUBSCRIBE,
      };
      return {
        authenticated: true,
        email: otpEmail,
        userId: null,
        entitled: false,
        displayName: otpEmail,
        firstTestUsed: freeUsed,
        message: freeUsed
          ? "Volný test je vyčerpaný. Student LF: první měsíc 89 Kč, další 149 Kč."
          : "E-mail ověřen kódem. První test zdarma — předplatné Student odemyká simulace.",
        loginUrl,
        access,
      };
    }
    const access: AppAccessInfo = {
      authenticated: false,
      accountLabel: "Nepřihlášeni",
      email: null,
      planLabel: "Host · zkušební test",
      entitled: false,
      validUntil: null,
      validityLabel: buildValidityLabel({ authenticated: false, entitled: false, endsAt: null }),
      loginUrl,
      subscribeUrl: SUBSCRIBE,
    };
    return {
      authenticated: false,
      email: null,
      userId: null,
      entitled: false,
      displayName: null,
      firstTestUsed: freeUsed,
      message: freeUsed
        ? "Volný test je vyčerpaný. Student LF: první měsíc 89 Kč, další 149 Kč."
        : "Stačí e-mail a ověřovací kód — bez hesla. První test zdarma.",
      loginUrl,
      access,
    };
  }

  const vip = await getVipSubscription(user.id);
  const studentLike =
    vip.active ||
    profile?.access_level === "student" ||
    profile?.access_level === "physician" ||
    profile?.role === "admin";
  const email = user.email ?? profile?.email ?? otpEmail;
  const displayName = profile?.full_name ?? user.email ?? null;
  const planLabel = vip.active
    ? "Student LF · předplatné"
    : studentLike
      ? "Student / lékařský účet"
      : "Přihlášeni · základní";

  const access: AppAccessInfo = {
    authenticated: true,
    accountLabel: displayName || email || "Účet MedScope",
    email,
    planLabel,
    entitled: Boolean(studentLike),
    validUntil: vip.endsAt,
    validityLabel: buildValidityLabel({
      authenticated: true,
      entitled: Boolean(studentLike),
      endsAt: vip.endsAt,
    }),
    loginUrl,
    subscribeUrl: SUBSCRIBE,
  };

  return {
    authenticated: true,
    email,
    userId: user.id,
    entitled: Boolean(studentLike),
    displayName,
    firstTestUsed: studentLike ? false : freeUsed,
    message: studentLike
      ? "Předplatné Student je aktivní — simulace a drill jsou odemčené."
      : freeUsed
        ? "Přihlášeni. Volný test je vyčerpaný — další simulace v tarifu Student (89 Kč, pak 149 Kč)."
        : "Přihlášeni. První test zdarma, další simulace v tarifu Student 89 Kč / 149 Kč.",
    loginUrl,
    access,
  };
}
