import { NextResponse } from "next/server";
import {
  loadContentRowsForImages,
  updateContentImageUrl,
  uploadImageToMediaBucket,
} from "@/lib/v25/images/content-loader";
import { isLegacyImageUrl } from "@/lib/v25/images/legacy-images";
import { loadImageRegistryLocal, appendImageFixLog } from "@/lib/v25/images/persist";
import { publicImageUrl, readLocalImage } from "@/lib/v25/images/storage";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

type GenModule = {
  saveGeneratedImage: (input: {
    section: string;
    slug: string;
    title: string;
    imageType?: string;
    module?: string;
    keywords?: string[];
  }) => { ok: boolean; relativePath?: string; error?: string };
};

async function findContentRow(section: string, slug: string) {
  const rows = await loadContentRowsForImages();
  return rows.find((r) => r.section === section && r.slug === slug);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const section = searchParams.get("section")?.trim();
  const slug = searchParams.get("slug")?.trim();
  if (!section || !slug) {
    return NextResponse.json({ error: "Missing section or slug" }, { status: 400 });
  }

  const registry = loadImageRegistryLocal();
  const existing = registry.find((i) => i.section === section && i.slug === slug);
  if (existing?.publicUrl && !isLegacyImageUrl(existing.publicUrl)) {
    return NextResponse.redirect(existing.publicUrl, 302);
  }

  const row = await findContentRow(section, slug);
  const title = row?.title ?? slug;

  const gen = (await import("@/lib/v25/images/generator-engine.mjs")) as GenModule;
  const saved = gen.saveGeneratedImage({
    section,
    slug,
    title,
    module:
      section.includes("legislat") ? "legislation" :
      section.includes("drug") ? "drug" :
      section.includes("univer") ? "university" :
      section.includes("digital") ? "digitalHealth" :
      section.includes("stud") ? "study" : "medicina",
    keywords:
      section.includes("drug")
        ? ["léčivo", "regulace", "bezpečnost"]
        : (row?.excerpt?.split(/\s+/).slice(0, 6) ?? []),
  });

  if (!saved.ok || !saved.relativePath) {
    return NextResponse.json({ error: saved.error ?? "generate failed" }, { status: 500 });
  }

  const buf = readLocalImage(saved.relativePath);
  const publicUrl =
    (buf ? await uploadImageToMediaBucket(saved.relativePath, buf) : null) ??
    publicImageUrl(saved.relativePath);

  if (row?.table && row.imageColumn && row.id) {
    await updateContentImageUrl(row.table, row.imageColumn, row.id, publicUrl);
  }

  appendImageFixLog({
    section,
    slug,
    action: "generate",
    result: "ok",
    detail: `render-on-demand → ${publicUrl}`,
  });

  if (buf) {
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        "X-MedScope-Image-Url": publicUrl,
      },
    });
  }

  return NextResponse.redirect(publicUrl, 302);
}
