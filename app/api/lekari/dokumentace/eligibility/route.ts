import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/auth/session";
import { getDokumentaceEligibility } from "@/lib/lekari/dokumentace/eligibility";
import {
  createDokumentaceInstallToken,
  dokumentaceAppUrl,
} from "@/lib/lekari/dokumentace/install-link";
import { dokumentaceLocaleFromUrl } from "@/lib/lekari/dokumentace/request-locale";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { ordizapisLoginHref } from "@/lib/i18n/ordizapis-app-copy";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const locale = dokumentaceLocaleFromUrl(request);
  const { user } = await getSessionProfile();
  const eligibility = await getDokumentaceEligibility(user?.id, locale);

  let installUrl: string | null = null;
  let linkedInstallUrl: string | null = null;
  if (eligibility.eligible && eligibility.userId) {
    installUrl = dokumentaceAppUrl({ source: "qr", absolute: true, locale });
    const token = createDokumentaceInstallToken(eligibility.userId);
    linkedInstallUrl = dokumentaceAppUrl({
      source: "qr-link",
      link: token,
      absolute: true,
      locale,
    });
  }

  return NextResponse.json({
    ...eligibility,
    installUrl,
    linkedInstallUrl,
    verifyUrl: localizePublicHref("/academy/lekari/overeni", locale),
    loginUrl: eligibility.access.loginUrl || ordizapisLoginHref(locale),
  });
}
