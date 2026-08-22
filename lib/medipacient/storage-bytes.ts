/**
 * Tight ArrayBuffers for Storage puts on Cloudflare Workers.
 * Node `Buffer` (and `new Blob([buffer])`) can send a pooled slab or empty body,
 * so JSON `index.json` verifies as empty and throws "dokument se nepodařilo zapsat".
 */

export class StorageWriteError extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
    this.name = "StorageWriteError";
  }
}

export function copyToArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(copy).set(bytes);
  return copy;
}

export function jsonToArrayBuffer(payload: unknown): ArrayBuffer {
  return copyToArrayBuffer(new TextEncoder().encode(JSON.stringify(payload)));
}

export function storageFailureCode(status: number, message: string): string {
  const statusCode = Number(status) || 0;
  const msg = (message || "").toLowerCase();
  if (statusCode === 413 || msg.includes("too large") || msg.includes("payload")) return "http_413";
  if (statusCode === 401 || statusCode === 403 || msg.includes("unauthorized") || msg.includes("jwt")) {
    return "unauthenticated";
  }
  if (msg.includes("binding") || msg.includes("úložiště není")) return "missing_binding";
  if (statusCode) return `http_${statusCode}`;
  if (msg.includes("json") || msg.includes("parse")) return "json_corrupt";
  return "storage_write";
}

export function publicStorageDetail(error: unknown): string {
  if (error instanceof StorageWriteError) return error.code;
  if (error instanceof Error) {
    const match = error.message.match(/\bhttp_\d{3}\b/i);
    if (match) return match[0].toLowerCase();
    return storageFailureCode(0, error.message);
  }
  return "storage_write";
}
