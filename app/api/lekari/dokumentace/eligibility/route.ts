import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/auth/session";
import { getDokumentaceEligibility } from "@/lib/lekari/dokumentace/eligibility";
import {
  createDokumentaceInstallToken,
  dokumentaceAppUrl,
} from "@/lib/lekari/dokumentace/install-link";

export const dynamic = "force-dynamic";

export async function GET() {
  const { user } = await getSessionProfile();
  const eligibility = await getDokumentaceEligibility(user?.id);

  let installUrl: string | null = null;
  let linkedInstallUrl: string | null = null;
  if (eligibility.eligible && eligibility.userId) {
    installUrl = dokumentaceAppUrl({ source: "qr", absolute: true });
    const token = createDokumentaceInstallToken(eligibility.userId);
    linkedInstallUrl = dokumentaceAppUrl({
      source: "qr-link",
      link: token,
      absolute: true,
    });
  }

  return NextResponse.json({
    ...eligibility,
    installUrl,
    linkedInstallUrl,
    verifyUrl: "/academy/lekari/overeni",
    loginUrl: "/login?next=/app/mediktor",
  });
}
