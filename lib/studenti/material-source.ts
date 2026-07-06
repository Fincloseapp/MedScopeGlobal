import type { StudentMaterial } from "@/lib/studenti/materials";

const ALLOWED_ORIGINS = ["https://lf1.cz", "http://lf1.cz"];

export function isAllowedMaterialUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ALLOWED_ORIGINS.some((origin) => parsed.origin === origin);
  } catch {
    return false;
  }
}

export class MaterialSourceError extends Error {
  constructor(
    message: string,
    public readonly code: "not_found" | "invalid_source" | "fetch_failed"
  ) {
    super(message);
    this.name = "MaterialSourceError";
  }
}

/** Fetch raw bytes from the upstream LF1 source. Never expose URL to client. */
export async function fetchMaterialBytes(material: StudentMaterial): Promise<Buffer> {
  const sourceUrl = material.external_url;
  if (!sourceUrl || !isAllowedMaterialUrl(sourceUrl)) {
    throw new MaterialSourceError("Invalid source", "invalid_source");
  }

  try {
    const upstream = await fetch(sourceUrl, {
      headers: { "User-Agent": "MedScopeGlobal/1.0 (study-materials-reader)" },
      next: { revalidate: 3600 },
    });

    if (!upstream.ok) {
      throw new MaterialSourceError("Source unavailable", "fetch_failed");
    }

    return Buffer.from(await upstream.arrayBuffer());
  } catch (error) {
    if (error instanceof MaterialSourceError) throw error;
    throw new MaterialSourceError(
      error instanceof Error ? error.message : "Fetch failed",
      "fetch_failed"
    );
  }
}
