import { randomUUID } from "crypto";
import { tryCreateServiceRoleClient } from "@/lib/supabase/service";
import {
  dueDateFromSummary,
  mergeControlReminder,
  type ControlReminder,
  type ControlReminderStatus,
} from "@/lib/medipacient/control-reminder";
import {
  decodeDocId,
  isDocFolderId,
  isStorageNotFoundError,
  mergeDocumentIndex,
} from "@/lib/medipacient/document-index";
import {
  copyToArrayBuffer,
  jsonToArrayBuffer,
  publicStorageDetail,
  StorageWriteError,
  storageFailureCode,
} from "@/lib/medipacient/storage-bytes";
import {
  AI_FAILED_CS,
  MedicalExtractError,
  MIN_OCR_CHARS,
  analyzeMedicalReportText,
  type PatientSummary,
} from "@/lib/medipacient/patient-summary";
import { extractTextFromMedicalFile } from "@/lib/medipacient/extract-medical-file";
import type { LabValue, Recommendation, VisitPlanStored } from "@/lib/medipacient/medicalParserCZ";
import { documentLimitErrorCs, MEDIPACIENT_HARD_DOC_CAP } from "@/lib/medipacient/entitlement";
import {
  mergeReminderLists,
  scheduleRemindersFromPlan,
  type ScheduledReminder,
} from "@/lib/medipacient/reminderEngine";
import type { TimelineDocumentInput } from "@/lib/medipacient/timelineEngine";

const BUCKET = "media";
const PREFIX = "medipacient";
const MAX_BYTES = 12 * 1024 * 1024;
const MAX_DOCS = MEDIPACIENT_HARD_DOC_CAP;

const ALLOWED_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/gif",
]);

export type MeDipacientDocument = {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  createdAt: string;
  storagePath: string;
  patientSummary?: PatientSummary | null;
  extractStatus?: "pending" | "ready" | "failed";
  extractError?: string | null;
  controlReminder?: ControlReminder;
  labValues?: LabValue[];
  recommendations?: Recommendation[];
  visitPlan?: VisitPlanStored | null;
  controlDate?: string | null;
};

export type MeDipacientExportPayload = {
  exportedAt: string;
  app: "MeDipacient";
  account: { email: string | null };
  documents: Array<{
    id: string;
    name: string;
    mimeType: string;
    size: number;
    createdAt: string;
    extractStatus?: MeDipacientDocument["extractStatus"];
    extractError?: string | null;
    patientSummary?: PatientSummary | null;
    controlReminder?: ControlReminder;
    labValues?: LabValue[];
    recommendations?: Recommendation[];
    visitPlan?: VisitPlanStored | null;
    controlDate?: string | null;
  }>;
};

function withMergedReminder(doc: MeDipacientDocument): MeDipacientDocument {
  const merged = mergeControlReminder(doc.controlReminder, dueDateFromSummary(doc.patientSummary));
  if (!merged) return doc;
  if (
    doc.controlReminder &&
    doc.controlReminder.dueAt === merged.dueAt &&
    doc.controlReminder.status === merged.status &&
    (doc.controlReminder.emailSentOn || null) === (merged.emailSentOn || null)
  ) {
    return doc;
  }
  return { ...doc, controlReminder: merged };
}

type ExtractSidecar = {
  version: 1 | 2;
  ocrText: string;
  patientSummary: PatientSummary;
  modelVersion: string;
  labValues?: LabValue[];
  recommendations?: Recommendation[];
  visitPlan?: VisitPlanStored | null;
  controlDate?: string | null;
  reminderCandidates?: ScheduledReminder[];
};

type IndexFile = { version: 1; documents: MeDipacientDocument[]; reminders?: ScheduledReminder[] };

function storageUserId(userId: string) {
  return userId.trim();
}

function indexPath(userId: string) {
  return `${PREFIX}/${storageUserId(userId)}/index.json`;
}

function extractPath(userId: string, id: string) {
  return `${PREFIX}/${storageUserId(userId)}/${id}/extract.json`;
}

function metaPath(userId: string, id: string) {
  return `${PREFIX}/${storageUserId(userId)}/${id}/meta.json`;
}

function folderPath(userId: string, id: string) {
  return `${PREFIX}/${storageUserId(userId)}/${id}`;
}

function safeName(name: string): string {
  const base = name.replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/^\.+/, "").slice(0, 80);
  return base || "soubor";
}

function emptyIndex(): IndexFile {
  return { version: 1, documents: [], reminders: [] };
}

export function assertUploadable(file: { name: string; type: string; size: number }): string | null {
  if (!file.size || file.size > MAX_BYTES) {
    return `Soubor je prázdný nebo větší než ${Math.round(MAX_BYTES / 1024 / 1024)} MB.`;
  }
  const mime = (file.type || "").toLowerCase();
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  const okExt = ["pdf", "jpg", "jpeg", "png", "webp", "heic", "heif", "gif"].includes(ext);
  if (!ALLOWED_MIME.has(mime) && !okExt) {
    return "Nahrajte PDF nebo fotografii zprávy (JPG, PNG, WEBP).";
  }
  return null;
}

async function uploadBytes(
  path: string,
  bytes: ArrayBuffer,
  contentType: string,
  upsert = true,
): Promise<void> {
  const admin = tryCreateServiceRoleClient();
  if (!admin) throw new StorageWriteError("Úložiště není dostupné.", "missing_binding");
  if (!bytes.byteLength) throw new StorageWriteError("Uložení selhalo: prázdné tělo.", "empty_body");
  const { error } = await admin.storage.from(BUCKET).upload(path, bytes, {
    contentType,
    upsert,
    cacheControl: "0",
  });
  if (error) {
    const status = Number((error as { statusCode?: string | number }).statusCode) || 0;
    const code = storageFailureCode(status, error.message);
    throw new StorageWriteError(`Uložení selhalo: ${code}`, code);
  }
}

async function uploadJson(path: string, payload: unknown): Promise<void> {
  await uploadBytes(path, jsonToArrayBuffer(payload), "application/json; charset=utf-8", true);
}

async function readIndex(userId: string): Promise<IndexFile> {
  const admin = tryCreateServiceRoleClient();
  if (!admin) throw new Error("Úložiště není dostupné.");
  const { data, error } = await admin.storage.from(BUCKET).download(indexPath(userId));
  if (error || !data) {
    if (!error || isStorageNotFoundError(error)) return emptyIndex();
    throw new Error(`Načtení seznamu selhalo: ${error.message}`);
  }
  try {
    const text = await data.text();
    if (!text.trim()) return emptyIndex();
    const parsed = JSON.parse(text) as IndexFile;
    if (!parsed || !Array.isArray(parsed.documents)) return emptyIndex();
    return {
      version: 1,
      documents: parsed.documents.filter((doc) => doc && typeof doc.id === "string"),
      reminders: Array.isArray(parsed.reminders) ? parsed.reminders : [],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "neplatný seznam";
    console.error("[medipacient] index-parse", { userId, message });
    return emptyIndex();
  }
}

async function writeIndex(
  userId: string,
  index: IndexFile,
  deletedIds: string[] = [],
): Promise<IndexFile> {
  let intended: IndexFile = emptyIndex();
  for (let attempt = 0; attempt < 3; attempt++) {
    const latest = await readIndex(userId);
    intended = {
      version: 1,
      documents: mergeDocumentIndex(latest.documents, index.documents, deletedIds),
      reminders: mergeReminderLists(latest.reminders || [], index.reminders || []),
    };
    const bytes = jsonToArrayBuffer(intended);
    try {
      await uploadBytes(indexPath(userId), bytes, "application/json; charset=utf-8", true);
    } catch (error) {
      console.error("[medipacient] index-put", {
        userId,
        attempt,
        bytes: bytes.byteLength,
        detail: publicStorageDetail(error),
      });
      if (attempt === 2) {
        console.error("[medipacient] index-put-giveup", { userId, detail: publicStorageDetail(error) });
        throw error instanceof StorageWriteError
          ? error
          : new StorageWriteError(`Uložení seznamu selhalo: ${publicStorageDetail(error)}`, "index_write");
      }
      continue;
    }
    let verify: IndexFile;
    try {
      verify = await readIndex(userId);
    } catch (error) {
      console.error("[medipacient] index-verify-read", {
        userId,
        attempt,
        detail: publicStorageDetail(error),
      });
      continue;
    }
    const missing = index.documents.filter(
      (doc) => !deletedIds.includes(doc.id) && !verify.documents.some((item) => item.id === doc.id),
    );
    if (!missing.length) return verify;
    console.error("[medipacient] index-verify-miss", {
      userId,
      attempt,
      bytes: bytes.byteLength,
      verifyCount: verify.documents.length,
      missing: missing.map((d) => d.id),
    });
    await new Promise((resolve) => setTimeout(resolve, 200 * (attempt + 1)));
  }
  console.error("[medipacient] index-put-unverified", {
    userId,
    intendedCount: intended.documents.length,
  });
  throw new StorageWriteError("Uložení seznamu selhalo: index_unverified", "index_unverified");
}

export async function listMeDipacientDocuments(userId: string): Promise<MeDipacientDocument[]> {
  const index = await readIndex(userId);
  const recovered = await recoverMissingFromFolders(userId, index.documents);
  const merged = mergeDocumentIndex(index.documents, recovered);
  const documents = merged.map(withMergedReminder);
  const reminderChanged = documents.some((doc, i) => doc !== merged[i]);
  if (recovered.length || reminderChanged) {
    try {
      await writeIndex(userId, { version: 1, documents, reminders: index.reminders || [] });
    } catch (error) {
      console.error("[medipacient] recover-index", { userId, detail: publicStorageDetail(error) });
    }
  }
  return [...documents].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listMeDipacientUserIds(): Promise<string[]> {
  const admin = tryCreateServiceRoleClient();
  if (!admin) return [];
  const { data, error } = await admin.storage.from(BUCKET).list(PREFIX, { limit: 200 });
  if (error || !data) return [];
  return data.map((item) => item.name).filter((name) => Boolean(name) && name !== ".emptyFolderPlaceholder");
}

export async function exportMeDipacientData(
  userId: string,
  email: string | null,
): Promise<MeDipacientExportPayload> {
  const documents = await listMeDipacientDocuments(userId);
  return {
    exportedAt: new Date().toISOString(),
    app: "MeDipacient",
    account: { email },
    documents: documents.map((doc) => ({
      id: doc.id,
      name: doc.name,
      mimeType: doc.mimeType,
      size: doc.size,
      createdAt: doc.createdAt,
      extractStatus: doc.extractStatus,
      extractError: doc.extractError ?? null,
      patientSummary: doc.patientSummary ?? null,
      controlReminder: doc.controlReminder,
      labValues: doc.labValues ?? [],
      recommendations: doc.recommendations ?? [],
      visitPlan: doc.visitPlan ?? null,
      controlDate: doc.controlDate ?? dueDateFromSummary(doc.patientSummary),
    })),
  };
}

export async function setMeDipacientControlReminder(
  userId: string,
  id: string,
  patch: { status?: ControlReminderStatus; emailSentOn?: string | null },
): Promise<MeDipacientDocument | null> {
  const index = await readIndex(userId);
  const current = index.documents.find((d) => d.id === id);
  if (!current) return null;
  const dueAt = current.controlReminder?.dueAt || dueDateFromSummary(current.patientSummary);
  if (!dueAt) return current;
  const nextReminder: ControlReminder = {
    dueAt,
    status: patch.status ?? current.controlReminder?.status ?? "open",
    emailSentOn:
      patch.emailSentOn !== undefined ? patch.emailSentOn : current.controlReminder?.emailSentOn ?? null,
  };
  return patchDocument(userId, id, { controlReminder: nextReminder });
}

export async function markControlReminderEmailed(
  userId: string,
  id: string,
  today: string,
): Promise<MeDipacientDocument | null> {
  return setMeDipacientControlReminder(userId, id, { emailSentOn: today });
}

export async function addMeDipacientDocument(
  userId: string,
  file: File,
  opts?: { maxDocs?: number; planFree?: boolean },
): Promise<MeDipacientDocument> {
  const problem = assertUploadable(file);
  if (problem) throw new Error(problem);

  if (!tryCreateServiceRoleClient()) {
    throw new StorageWriteError("Úložiště není dostupné.", "missing_binding");
  }

  const index = await readIndex(userId);
  const cap = Math.min(opts?.maxDocs ?? MAX_DOCS, MAX_DOCS);
  if (index.documents.length >= cap) {
    throw new Error(
      opts?.planFree ? documentLimitErrorCs("FREE") : `Maximum je ${cap} dokumentů na účet.`,
    );
  }

  const id = randomUUID();
  const name = safeName(file.name);
  const storagePath = `${PREFIX}/${storageUserId(userId)}/${id}/${name}`;
  const fileBytes = copyToArrayBuffer(new Uint8Array(await file.arrayBuffer()));
  const mimeType = file.type || "application/octet-stream";

  try {
    await uploadBytes(storagePath, fileBytes, mimeType, false);
  } catch (error) {
    const detail = publicStorageDetail(error);
    throw new StorageWriteError(`Nahrání selhalo: ${detail}`, detail);
  }

  const doc: MeDipacientDocument = {
    id,
    name: file.name.slice(0, 160) || name,
    mimeType,
    size: file.size,
    createdAt: new Date().toISOString(),
    storagePath,
    extractStatus: "pending",
  };
  try {
    await uploadJson(metaPath(userId, id), doc);
  } catch (error) {
    console.error("[medipacient] meta-put", { userId, id, detail: publicStorageDetail(error) });
  }
  index.documents.unshift(doc);
  let persisted = doc;
  try {
    const written = await writeIndex(userId, index);
    persisted = written.documents.find((item) => item.id === id) ?? doc;
  } catch (error) {
    console.error("[medipacient] index-after-upload", {
      userId,
      id,
      detail: publicStorageDetail(error),
    });
    persisted = doc;
  }
  console.info("[medipacient] uploaded", { userId, id, storagePath, name: persisted.name });
  const ocrBuffer = Buffer.from(fileBytes);
  try {
    return await finalizeExtract(userId, persisted, ocrBuffer);
  } catch (error) {
    const extractError = error instanceof MedicalExtractError ? error.message : AI_FAILED_CS;
    console.error("[medipacient] extract-after-save", { userId, id, extractError });
    try {
      return (
        (await patchDocument(userId, id, { extractStatus: "failed", extractError, patientSummary: null }, persisted)) ?? {
          ...persisted,
          extractStatus: "failed",
          extractError,
          patientSummary: null,
        }
      );
    } catch {
      return { ...persisted, extractStatus: "failed", extractError, patientSummary: null };
    }
  }
}

export async function removeMeDipacientDocument(userId: string, id: string): Promise<boolean> {
  const docId = decodeDocId(id);
  const index = await readIndex(userId);
  const doc = index.documents.find((d) => d.id === docId);
  if (!doc) return false;
  const admin = tryCreateServiceRoleClient();
  if (!admin) throw new Error("Úložiště není dostupné.");
  await admin.storage.from(BUCKET).remove([doc.storagePath, extractPath(userId, docId), metaPath(userId, docId)]);
  await writeIndex(userId, { version: 1, documents: index.documents.filter((d) => d.id !== docId) }, [docId]);
  return true;
}

async function readMeta(userId: string, id: string): Promise<MeDipacientDocument | null> {
  const admin = tryCreateServiceRoleClient();
  if (!admin) return null;
  const { data, error } = await admin.storage.from(BUCKET).download(metaPath(userId, id));
  if (error || !data) return null;
  try {
    const parsed = JSON.parse(await data.text()) as MeDipacientDocument;
    if (!parsed?.id || parsed.id !== id || typeof parsed.storagePath !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}

async function reconstructFromFolder(userId: string, id: string): Promise<MeDipacientDocument | null> {
  const fromMeta = await readMeta(userId, id);
  if (fromMeta) return fromMeta;
  const admin = tryCreateServiceRoleClient();
  if (!admin) return null;
  const folder = folderPath(userId, id);
  const { data, error } = await admin.storage.from(BUCKET).list(folder, { limit: 40 });
  if (error || !data?.length) return null;
  const file = data.find(
    (item) =>
      item.name &&
      item.name !== "extract.json" &&
      item.name !== "meta.json" &&
      item.name !== ".emptyFolderPlaceholder",
  );
  if (!file?.name) return null;
  const storagePath = `${folder}/${file.name}`;
  const sidecar = await readExtract(userId, id);
  const ready = Boolean(sidecar?.patientSummary?.srozumitelny_preklad);
  return {
    id,
    name: file.name.slice(0, 160),
    mimeType: (file.metadata as { mimetype?: string } | undefined)?.mimetype || "application/octet-stream",
    size: Number((file.metadata as { size?: number } | undefined)?.size || 0),
    createdAt: file.created_at || new Date().toISOString(),
    storagePath,
    patientSummary: sidecar?.patientSummary ?? null,
    extractStatus: ready ? "ready" : "pending",
    extractError: null,
  };
}

async function recoverMissingFromFolders(
  userId: string,
  known: MeDipacientDocument[],
): Promise<MeDipacientDocument[]> {
  const admin = tryCreateServiceRoleClient();
  if (!admin) return [];
  const { data, error } = await admin.storage.from(BUCKET).list(`${PREFIX}/${storageUserId(userId)}`, {
    limit: 200,
  });
  if (error || !data?.length) return [];
  const knownIds = new Set(known.map((doc) => doc.id));
  const extras: MeDipacientDocument[] = [];
  for (const entry of data) {
    if (!isDocFolderId(entry.name) || knownIds.has(entry.name)) continue;
    const recovered = await reconstructFromFolder(userId, entry.name);
    if (recovered) extras.push(recovered);
  }
  return extras;
}

async function recoverDocumentFromStorage(userId: string, id: string): Promise<MeDipacientDocument | null> {
  const recovered = await reconstructFromFolder(userId, id);
  if (!recovered) return null;
  try {
    await writeIndex(userId, { version: 1, documents: [recovered] });
  } catch (error) {
    console.error("[medipacient] recover-index-one", { userId, id, detail: publicStorageDetail(error) });
  }
  try {
    await uploadJson(metaPath(userId, id), recovered);
  } catch (error) {
    console.error("[medipacient] recover-meta", { userId, id, detail: publicStorageDetail(error) });
  }
  console.info("[medipacient] recovered-from-storage", { userId, id, storagePath: recovered.storagePath });
  return recovered;
}

async function lookupDocument(userId: string, id: string): Promise<MeDipacientDocument | null> {
  const docId = decodeDocId(id);
  if (!docId) return null;
  const index = await readIndex(userId);
  return index.documents.find((d) => d.id === docId) ?? recoverDocumentFromStorage(userId, docId);
}

export async function signMeDipacientDocument(
  userId: string,
  id: string
): Promise<{ doc: MeDipacientDocument; url: string; patientSummary: MeDipacientDocument["patientSummary"] } | null> {
  const docId = decodeDocId(id);
  const doc = await lookupDocument(userId, docId);
  if (!doc) {
    console.warn("[medipacient] get-miss", { userId, id: docId });
    return null;
  }
  const admin = tryCreateServiceRoleClient();
  if (!admin) throw new Error("Úložiště není dostupné.");
  const { data, error } = await admin.storage.from(BUCKET).createSignedUrl(doc.storagePath, 60 * 20);
  if (error || !data?.signedUrl) {
    console.warn("[medipacient] sign-fail", { userId, id: docId, path: doc.storagePath, error: error?.message });
  }
  const url = data?.signedUrl || "";
  const shouldExtract =
    doc.extractStatus === "pending" || (!doc.patientSummary && doc.extractStatus !== "failed");
  let detailed = doc;
  if (shouldExtract) {
    try {
      detailed = (await ensureMeDipacientPatientSummary(userId, docId)) ?? doc;
    } catch (error) {
      console.error("[medipacient] get-extract", { userId, id: docId, error: error instanceof Error ? error.message : error });
      detailed = {
        ...doc,
        extractStatus: "failed",
        extractError: error instanceof MedicalExtractError ? error.message : AI_FAILED_CS,
      };
    }
  }
  return { doc: detailed, url, patientSummary: detailed.patientSummary ?? doc.patientSummary ?? null };
}

async function readExtract(userId: string, id: string): Promise<ExtractSidecar | null> {
  const admin = tryCreateServiceRoleClient();
  if (!admin) return null;
  const { data, error } = await admin.storage.from(BUCKET).download(extractPath(userId, id));
  if (error || !data) return null;
  try {
    const parsed = JSON.parse(await data.text()) as ExtractSidecar;
    if (!parsed?.patientSummary || typeof parsed.ocrText !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}

async function writeExtract(userId: string, id: string, sidecar: ExtractSidecar): Promise<void> {
  await uploadJson(extractPath(userId, id), sidecar);
}

async function patchDocument(
  userId: string,
  id: string,
  patch: Partial<MeDipacientDocument>,
  fallback?: MeDipacientDocument,
) {
  const index = await readIndex(userId);
  const current = index.documents.find((d) => d.id === id) ?? fallback;
  if (!current) {
    console.warn("[medipacient] patch-miss", { userId, id });
    return null;
  }
  const updated = { ...current, ...patch };
  const next = index.documents.some((d) => d.id === id)
    ? index.documents.map((d) => (d.id === id ? updated : d))
    : [updated, ...index.documents];
  const written = await writeIndex(userId, { version: 1, documents: next });
  const saved = written.documents.find((d) => d.id === id) ?? updated;
  try {
    await uploadJson(metaPath(userId, id), saved);
  } catch (error) {
    console.error("[medipacient] meta-patch", { userId, id, detail: publicStorageDetail(error) });
  }
  return saved;
}

async function finalizeExtract(
  userId: string,
  doc: MeDipacientDocument,
  buffer: Buffer,
  existingOcr?: string,
): Promise<MeDipacientDocument> {
  try {
    const ocrText =
      existingOcr && existingOcr.trim().length >= MIN_OCR_CHARS
        ? existingOcr
        : await extractTextFromMedicalFile(buffer, doc.name, doc.mimeType);
    const analyzed = await analyzeMedicalReportText(ocrText);
    const controlDate =
      analyzed.extract.controlDate || dueDateFromSummary(analyzed.summary);
    const reminderCandidates = scheduleRemindersFromPlan({
      documentId: doc.id,
      visitPlan: analyzed.extract.visitPlan,
      controlDate,
      obor: analyzed.summary.obor_lekare,
    }).map((item) => ({
      ...item,
      documentId: doc.id,
    }));
    await writeExtract(userId, doc.id, {
      version: 2,
      ocrText: analyzed.ocrText,
      patientSummary: analyzed.summary,
      modelVersion: analyzed.modelVersion,
      labValues: analyzed.extract.labValues,
      recommendations: analyzed.extract.recommendations,
      visitPlan: analyzed.extract.visitPlan,
      controlDate,
      reminderCandidates,
    });
    const ready: Partial<MeDipacientDocument> = {
      patientSummary: analyzed.summary,
      extractStatus: "ready",
      extractError: null,
      controlReminder: mergeControlReminder(doc.controlReminder, controlDate),
      labValues: analyzed.extract.labValues,
      recommendations: analyzed.extract.recommendations,
      visitPlan: analyzed.extract.visitPlan,
      controlDate,
    };
    const saved = (await patchDocument(userId, doc.id, ready, doc)) ?? { ...doc, ...ready };
    await mergeDocumentReminders(userId, reminderCandidates);
    return saved;
  } catch (error) {
    const extractError = error instanceof MedicalExtractError ? error.message : AI_FAILED_CS;
    console.warn("[medipacient] extract-failed", { userId, id: doc.id, extractError });
    try {
      return (
        (await patchDocument(
          userId,
          doc.id,
          { extractStatus: "failed", extractError, patientSummary: null },
          doc,
        )) ?? { ...doc, extractStatus: "failed", extractError, patientSummary: null }
      );
    } catch (patchError) {
      console.error("[medipacient] extract-patch-fail", {
        userId,
        id: doc.id,
        error: patchError instanceof Error ? patchError.message : patchError,
      });
      return { ...doc, extractStatus: "failed", extractError, patientSummary: null };
    }
  }
}

export async function ensureMeDipacientPatientSummary(
  userId: string,
  id: string,
): Promise<MeDipacientDocument | null> {
  const doc = await lookupDocument(userId, id);
  if (!doc) return null;
  if (doc.patientSummary?.srozumitelny_preklad) return doc;
  const sidecar = await readExtract(userId, id);
  if (sidecar?.patientSummary?.srozumitelny_preklad) {
    const ready: Partial<MeDipacientDocument> = {
      patientSummary: sidecar.patientSummary,
      extractStatus: "ready",
      extractError: null,
      controlReminder: mergeControlReminder(doc.controlReminder, dueDateFromSummary(sidecar.patientSummary)),
      labValues: sidecar.labValues || sidecar.patientSummary.lab_values || doc.labValues,
      recommendations: sidecar.recommendations || sidecar.patientSummary.recommendations || doc.recommendations,
      visitPlan: sidecar.visitPlan || sidecar.patientSummary.visit_plan || doc.visitPlan,
      controlDate: sidecar.controlDate || dueDateFromSummary(sidecar.patientSummary),
    };
    return (await patchDocument(userId, id, ready, doc)) ?? { ...doc, ...ready };
  }
  if (doc.extractStatus === "failed") return doc;
  if (sidecar?.ocrText && sidecar.ocrText.trim().length >= MIN_OCR_CHARS) {
    return finalizeExtract(userId, doc, Buffer.alloc(0), sidecar.ocrText);
  }
  const admin = tryCreateServiceRoleClient();
  if (!admin) return doc;
  const { data } = await admin.storage.from(BUCKET).download(doc.storagePath);
  if (!data) return doc;
  const buffer = Buffer.from(await data.arrayBuffer());
  return finalizeExtract(userId, doc, buffer, sidecar?.ocrText);
}

export async function reprocessMeDipacientDocument(
  userId: string,
  id: string,
): Promise<MeDipacientDocument | null> {
  const doc = await lookupDocument(userId, id);
  if (!doc) return null;
  const admin = tryCreateServiceRoleClient();
  if (!admin) return doc;
  const { data } = await admin.storage.from(BUCKET).download(doc.storagePath);
  if (!data) return doc;
  const buffer = Buffer.from(await data.arrayBuffer());
  return finalizeExtract(userId, doc, buffer);
}

async function mergeDocumentReminders(userId: string, incoming: ScheduledReminder[]): Promise<void> {
  if (!incoming.length) return;
  try {
    const latest = await readIndex(userId);
    await writeIndex(userId, {
      version: 1,
      documents: latest.documents,
      reminders: mergeReminderLists(latest.reminders || [], incoming),
    });
  } catch (error) {
    console.error("[medipacient] reminder-index", { userId, detail: publicStorageDetail(error) });
  }
}

export async function listMeDipacientReminders(userId: string): Promise<ScheduledReminder[]> {
  const index = await readIndex(userId);
  return [...(index.reminders || [])].sort((a, b) => a.fireAt.localeCompare(b.fireAt));
}

export async function patchMeDipacientReminder(
  userId: string,
  reminderId: string,
  patch: Partial<Pick<ScheduledReminder, "status" | "emailSentOn">>,
): Promise<ScheduledReminder | null> {
  const index = await readIndex(userId);
  const current = (index.reminders || []).find((item) => item.id === reminderId);
  if (!current) return null;
  const next = { ...current, ...patch };
  await writeIndex(userId, {
    version: 1,
    documents: index.documents,
    reminders: mergeReminderLists(index.reminders || [], [next]),
  });
  return next;
}

export function documentToTimelineInput(doc: MeDipacientDocument): TimelineDocumentInput {
  return {
    id: doc.id,
    name: doc.name,
    createdAt: doc.createdAt,
    controlDate: doc.controlDate || dueDateFromSummary(doc.patientSummary),
    visitPlan: doc.visitPlan || doc.patientSummary?.visit_plan || null,
    labValues: doc.labValues || doc.patientSummary?.lab_values || [],
    recommendations: doc.recommendations || doc.patientSummary?.recommendations || [],
    obor: doc.patientSummary?.obor_lekare || null,
  };
}
