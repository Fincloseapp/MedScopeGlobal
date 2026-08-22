export type IndexableDocument = { id: string; createdAt: string };

export function decodeDocId(raw: string | null | undefined): string {
  const value = (raw || "").trim();
  if (!value) return "";
  try {
    return decodeURIComponent(value).trim();
  } catch {
    return value;
  }
}

/** `/api/medipacient/documents/:id` and `/api/medipacient/documents/:id/reprocess|reminder`. */
export function documentIdFromPath(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  const i = parts.indexOf("documents");
  if (i < 0) return "";
  return decodeDocId(parts[i + 1] || "");
}

export async function resolveMeDipacientDocumentId(
  request: Request,
  params: Promise<{ id?: string }> | { id?: string } | undefined,
): Promise<string> {
  const resolved = await Promise.resolve(params);
  const fromParams = decodeDocId(typeof resolved?.id === "string" ? resolved.id : "");
  if (fromParams && fromParams !== "documents") return fromParams;
  return documentIdFromPath(new URL(request.url).pathname);
}

/**
 * Merge two index snapshots by document id.
 * Incoming wins on id clash; `deletedIds` are omitted even if still in `latest`.
 */
export function mergeDocumentIndex<T extends IndexableDocument>(
  latest: T[],
  incoming: T[],
  deletedIds: string[] = [],
): T[] {
  const deleted = new Set(deletedIds.filter(Boolean));
  const byId = new Map<string, T>();
  for (const doc of latest) {
    if (!doc?.id || deleted.has(doc.id)) continue;
    byId.set(doc.id, doc);
  }
  for (const doc of incoming) {
    if (!doc?.id || deleted.has(doc.id)) continue;
    byId.set(doc.id, doc);
  }
  return [...byId.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function isDocFolderId(name: string | null | undefined): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test((name || "").trim());
}

/** Folder listing may return `uuid` or `uuid/file.pdf`. */
export function folderIdFromEntry(name: string | null | undefined): string {
  const value = (name || "").trim();
  if (isDocFolderId(value)) return value;
  const first = value.split(/[\\/]/)[0];
  return isDocFolderId(first) ? first : "";
}

export function isStorageNotFoundError(error: { message?: string; statusCode?: string | number } | null | undefined): boolean {
  if (!error) return false;
  const code = String(error.statusCode ?? "");
  const msg = (error.message || "").toLowerCase();
  return (
    code === "404" ||
    msg.includes("not found") ||
    msg.includes("no such file") ||
    msg.includes("object not found") ||
    msg.includes("does not exist")
  );
}
