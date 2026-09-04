import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getSessionProfile } from "@/lib/auth/session";
import { getDokumentaceEligibility } from "@/lib/lekari/dokumentace/eligibility";
import { dokumentaceLocaleFromUrl } from "@/lib/lekari/dokumentace/request-locale";
import { getOrdiZapisApiCopy } from "@/lib/i18n/ordizapis-api-copy";
import {
  createDokumentaceInstallToken,
  dokumentaceAppUrl,
} from "@/lib/lekari/dokumentace/install-link";

export const dynamic = "force-dynamic";

async function proxyQrPng(targetUrl: string): Promise<Buffer> {
  const api =
    "https://api.qrserver.com/v1/create-qr-code/?size=360x360&ecc=M&margin=2&data=" +
    encodeURIComponent(targetUrl);
  const res = await fetch(api, { next: { revalidate: 86400 } });
  if (!res.ok) {
    throw new Error(`QR provider ${res.status}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

/**
 * GET /api/lekari/dokumentace/qr
 * - public=1 → marketing QR (app download landing)
 * - linked=1 → personalized QR only for verified physicians (account-bound token)
 */
export async function GET(request: NextRequest) {
  const publicMode = request.nextUrl.searchParams.get("public") === "1";
  const linkedMode = request.nextUrl.searchParams.get("linked") === "1";

  if (publicMode || !linkedMode) {
    try {
      const file = path.join(process.cwd(), "public", "dokumentace-qr.png");
      const buf = await readFile(file);
      return new NextResponse(new Uint8Array(buf), {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=86400",
        },
      });
    } catch {
      const url = dokumentaceAppUrl({ source: "qr", absolute: true });
      const buf = await proxyQrPng(url);
      return new NextResponse(new Uint8Array(buf), {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }
  }

  const locale = dokumentaceLocaleFromUrl(request);
  const { user } = await getSessionProfile();
  const eligibility = await getDokumentaceEligibility(user?.id, locale);
  if (!eligibility.eligible || !eligibility.userId) {
    return NextResponse.json(
      {
        ok: false,
        error: eligibility.message || getOrdiZapisApiCopy(locale).qrVerifiedOnly,
        code: eligibility.reason,
      },
      { status: eligibility.reason === "unauthenticated" ? 401 : 403 }
    );
  }

  const token = createDokumentaceInstallToken(eligibility.userId);
  const target = dokumentaceAppUrl({
    source: "qr-link",
    link: token,
    absolute: true,
  });
  const buf = await proxyQrPng(target);
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "private, no-store",
    },
  });
}
