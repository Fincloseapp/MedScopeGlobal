import { NextResponse } from "next/server";
import { readLocalImage } from "@/lib/v25/images/storage";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ path: string[] }> };

export async function GET(_request: Request, { params }: Props) {
  const { path } = await params;
  const rel = `images/${path.join("/")}`;
  const buf = readLocalImage(rel);

  if (!buf) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ext = path.at(-1)?.split(".").pop()?.toLowerCase();
  const type =
    ext === "svg" ? "image/svg+xml" : ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "application/octet-stream";

  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": type,
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
