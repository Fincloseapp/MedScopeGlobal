import { cookies } from "next/headers";
import { getSessionProfile } from "@/lib/auth/session";
import { getVipStatus } from "@/lib/vip";
import { MEDIPREP } from "@/lib/apps/catalog";
import type { PrepSession } from "@/lib/mediprep/types";

export const MEDIPREP_OTP_COOKIE = "mediprep_otp_email";

export type { PrepSession };

export async function getPrepSession(): Promise<PrepSession> {
  const { user, profile } = await getSessionProfile();
  const loginUrl = `/login?next=${encodeURIComponent(MEDIPREP.appPath)}`;
  const jar = await cookies();
  const otpEmail = jar.get(MEDIPREP_OTP_COOKIE)?.value ?? null;

  if (!user) {
    if (otpEmail) {
      return {
        authenticated: true,
        email: otpEmail,
        userId: null,
        entitled: false,
        displayName: otpEmail,
        firstTestUsed: false,
        message: "E-mail ověřen kódem. První test zdarma — předplatné Student odemyká simulace.",
        loginUrl,
      };
    }
    return {
      authenticated: false,
      email: null,
      userId: null,
      entitled: false,
      displayName: null,
      firstTestUsed: false,
      message: "Stačí e-mail a ověřovací kód — bez hesla. První test zdarma.",
      loginUrl,
    };
  }
  const isVip = await getVipStatus(user.id);
  const studentLike =
    isVip ||
    profile?.access_level === "student" ||
    profile?.access_level === "physician" ||
    profile?.role === "admin";
  return {
    authenticated: true,
    email: user.email ?? profile?.email ?? otpEmail,
    userId: user.id,
    entitled: Boolean(studentLike),
    displayName: profile?.full_name ?? user.email ?? null,
    firstTestUsed: false,
    message: studentLike
      ? "Předplatné Student je aktivní — simulace a drill jsou odemčené."
      : "Přihlášeni. První test zdarma, další simulace v tarifu Student 149 Kč.",
    loginUrl,
  };
}
