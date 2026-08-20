import { NextResponse } from "next/server";
import { APP_PRODUCTS, type AppProductId } from "@/lib/apps/catalog";
import { absoluteAppUrl, proxyQrPng } from "@/lib/apps/qr";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = (url.searchParams.get("app") || "medipacient") as AppProductId;
  const app = APP_PRODUCTS.find((a) => a.id === id) ?? APP_PRODUCTS[0];
  const target = absoluteAppUrl(app, url.searchParams.get("source") || "qr");
  const buf = await proxyQrPng(target);
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
