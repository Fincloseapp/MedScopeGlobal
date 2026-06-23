import { randomUUID } from "node:crypto";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { logAdminEvent } from "@/lib/logging";
import { logSecurityEvent } from "@/lib/security/security-log";
import {
  appendClkFileLog,
  getClkRecordForUser,
  readClkStore,
  upsertClkRecord,
  type ClkAuditEntry,
  type ClkVerificationMethod,
  type ClkVerificationRecord,
  type ClkVerificationStatus,
} from "@/lib/auth/clk-data-store";

export type ClkVerifyInput = {
  userId: string;
  email?: string | null;
  fullName?: string | null;
  clkNumber: string;
  actorId?: string | null;
  ip?: string | null;
};

export type ClkVerifyResult = {
  ok: boolean;
  status: ClkVerificationStatus;
  method: ClkVerificationMethod;
  record: ClkVerificationRecord;
  message: string;
};

function normalizeClkNumber(raw: string) {
  return raw.replace(/\s+/g, "").trim().toUpperCase();
}

function hasClkApiConfig() {
  return Boolean(process.env.CLK_API_URL && process.env.CLK_API_KEY);
}

function auditEntry(
  action: string,
  actor?: string | null,
  details?: Record<string, unknown>
): ClkAuditEntry {
  return { at: new Date().toISOString(), action, actor: actor ?? null, details };
}

async function verifyViaClkApi(clkNumber: string, fullName?: string | null) {
  const baseUrl = process.env.CLK_API_URL!.replace(/\/$/, "");
  const key = process.env.CLK_API_KEY!;

  const res = await fetch(`${baseUrl}/verify`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      registrationNumber: clkNumber,
      name: fullName ?? undefined,
    }),
    cache: "no-store",
  });

  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  const verified =
    res.ok &&
    (body.verified === true ||
      body.status === "verified" ||
      body.valid === true);

  return {
    verified,
    httpStatus: res.status,
    body,
  };
}

async function persistToSupabase(record: ClkVerificationRecord) {
  const admin = createServiceRoleClient();
  const row = {
    id: record.id,
    user_id: record.userId,
    email: record.email,
    full_name: record.fullName,
    clk_number: record.clkNumber,
    status: record.status,
    method: record.method,
    api_result: record.apiResult,
    audit_log: record.auditLog,
    verified_at: record.verifiedAt,
    created_at: record.createdAt,
    updated_at: record.updatedAt,
  };

  const { error } = await admin.from("clk_verifications").upsert(row, {
    onConflict: "id",
  });
  if (error) throw new Error(error.message);
}

export async function submitClkVerification(
  input: ClkVerifyInput
): Promise<ClkVerifyResult> {
  const clkNumber = normalizeClkNumber(input.clkNumber);
  if (!/^[A-Z0-9\-]{4,20}$/.test(clkNumber)) {
    throw new Error("Neplatné evidenční číslo ČLK.");
  }

  const now = new Date().toISOString();
  const existing = getClkRecordForUser(input.userId);
  const id = existing?.id ?? randomUUID();

  let status: ClkVerificationStatus = "manual_review";
  let method: ClkVerificationMethod = "manual";
  let apiResult: Record<string, unknown> | null = null;
  let verifiedAt: string | null = null;
  let message =
    "Žádost byla přijata. Ověření proběhne ručně administrátorem (ČLK API není nakonfigurováno).";

  const log: ClkAuditEntry[] = [
    ...(existing?.auditLog ?? []),
    auditEntry("submit", input.userId, { clkNumber }),
  ];

  if (hasClkApiConfig()) {
    method = "api";
    log.push(auditEntry("api_request", input.userId, { clkNumber }));
    try {
      const api = await verifyViaClkApi(clkNumber, input.fullName);
      apiResult = { httpStatus: api.httpStatus, ...api.body };
      if (api.verified) {
        status = "verified";
        verifiedAt = now;
        message = "Ověření ČLK proběhlo úspěšně.";
        log.push(auditEntry("api_verified", input.userId, apiResult));
      } else {
        status = "rejected";
        message =
          "ČLK API nepotvrdilo platnost evidenčního čísla. Kontaktujte podporu nebo zkuste znovu.";
        log.push(auditEntry("api_rejected", input.userId, apiResult));
      }
    } catch (e) {
      status = "manual_review";
      method = "manual";
      apiResult = {
        error: e instanceof Error ? e.message : "CLK API unavailable",
      };
      message =
        "ČLK API momentálně nedostupné — žádost předána k ručnímu ověření.";
      log.push(auditEntry("api_fallback_manual", input.userId, apiResult));
    }
  } else {
    status = "manual_review";
    log.push(auditEntry("manual_queue", input.userId));
  }

  const record: ClkVerificationRecord = {
    id,
    userId: input.userId,
    email: input.email ?? null,
    fullName: input.fullName ?? null,
    clkNumber,
    status,
    method,
    verifiedAt,
    apiResult,
    auditLog: log,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  upsertClkRecord(record);
  await persistToSupabase(record);

  if (status === "verified") {
    const admin = createServiceRoleClient();
    await admin
      .from("users")
      .update({
        access_level: "physician",
        verification_status: "approved",
        profession: "physician",
      })
      .eq("id", input.userId);
  }

  await logAdminEvent("CLK_VERIFICATION", {
    user_id: input.userId,
    clk_number: clkNumber,
    status,
    method,
  });

  await logSecurityEvent({
    ip: input.ip ?? null,
    userId: input.userId,
    action: "clk_verify:submit",
    status: status === "verified" ? "ok" : "warning",
    details: { clkNumber, status, method },
  });

  appendClkFileLog(
    `submit user=${input.userId} status=${status} method=${method}`
  );

  return { ok: status === "verified", status, method, record, message };
}

export async function reviewClkVerification(params: {
  id: string;
  decision: "verified" | "rejected";
  actorId?: string | null;
  note?: string;
}) {
  const admin = createServiceRoleClient();
  const { data: row, error } = await admin
    .from("clk_verifications")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (error || !row) {
    const fromFile = readClkStore().verifications.find((v) => v.id === params.id);
    if (!fromFile) throw new Error("Záznam nenalezen.");
    const now = new Date().toISOString();
    const status: ClkVerificationStatus =
      params.decision === "verified" ? "verified" : "rejected";
    const auditLog = [
      ...fromFile.auditLog,
      auditEntry(`admin_${params.decision}`, params.actorId ?? null, {
        note: params.note ?? null,
      }),
    ];
    const record: ClkVerificationRecord = {
      ...fromFile,
      status,
      verifiedAt: status === "verified" ? now : null,
      auditLog,
      updatedAt: now,
    };
    upsertClkRecord(record);
    if (status === "verified") {
      await admin
        .from("users")
        .update({
          access_level: "physician",
          verification_status: "approved",
          profession: "physician",
        })
        .eq("id", fromFile.userId);
    }
    await logAdminEvent("CLK_REVIEW", {
      id: params.id,
      user_id: fromFile.userId,
      decision: params.decision,
      source: "file",
    });
    return record;
  }

  const now = new Date().toISOString();
  const status: ClkVerificationStatus =
    params.decision === "verified" ? "verified" : "rejected";
  const auditLog = [
    ...((row.audit_log as ClkAuditEntry[]) ?? []),
    auditEntry(`admin_${params.decision}`, params.actorId ?? null, {
      note: params.note ?? null,
    }),
  ];

  const record: ClkVerificationRecord = {
    id: row.id,
    userId: row.user_id,
    email: row.email,
    fullName: row.full_name,
    clkNumber: row.clk_number,
    status,
    method: row.method as ClkVerificationMethod,
    verifiedAt: status === "verified" ? now : null,
    apiResult: (row.api_result as Record<string, unknown>) ?? null,
    auditLog,
    createdAt: row.created_at,
    updatedAt: now,
  };

  upsertClkRecord(record);
  await admin
    .from("clk_verifications")
    .update({
      status,
      verified_at: record.verifiedAt,
      audit_log: auditLog,
      updated_at: now,
    })
    .eq("id", params.id);

  if (status === "verified") {
    await admin
      .from("users")
      .update({
        access_level: "physician",
        verification_status: "approved",
        profession: "physician",
      })
      .eq("id", row.user_id);
  }

  await logAdminEvent("CLK_REVIEW", {
    id: params.id,
    user_id: row.user_id,
    decision: params.decision,
  });

  return record;
}

export async function getClkVerificationStatus(userId: string) {
  const admin = createServiceRoleClient();
  const { data } = await admin
    .from("clk_verifications")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (data) {
    return {
      status: data.status as ClkVerificationStatus,
      clkNumber: data.clk_number as string,
      verifiedAt: data.verified_at as string | null,
      method: data.method as ClkVerificationMethod,
    };
  }

  const fileRecord = getClkRecordForUser(userId);
  if (!fileRecord) return null;

  return {
    status: fileRecord.status,
    clkNumber: fileRecord.clkNumber,
    verifiedAt: fileRecord.verifiedAt,
    method: fileRecord.method,
  };
}

export function isClkVerified(
  status: ClkVerificationStatus | string | null | undefined
) {
  return status === "verified";
}
