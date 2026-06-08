/**
 * v19 async job queue — Supabase-backed with in-process drain fallback.
 */
import { createServiceRoleClient } from "@/lib/supabase/service";
import type { V19ContentMode, V19JobStatus } from "@/lib/v19/types";

export type V19JobPayload = {
  count: number;
  locale: string;
  mode?: V19ContentMode;
  ip?: string;
};

export type V19JobRecord = {
  id: string;
  status: V19JobStatus;
  payload: V19JobPayload;
  result?: unknown;
  error?: string;
  created_at: string;
  updated_at: string;
};

export async function enqueueV19Job(payload: V19JobPayload): Promise<string> {
  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("v19_content_jobs")
    .insert({
      status: "pending",
      payload,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return data.id as string;
}

export async function getV19Job(jobId: string): Promise<V19JobRecord | null> {
  const admin = createServiceRoleClient();
  const { data } = await admin
    .from("v19_content_jobs")
    .select("*")
    .eq("id", jobId)
    .maybeSingle();
  return (data as V19JobRecord) ?? null;
}

export async function updateV19Job(
  jobId: string,
  patch: Partial<Pick<V19JobRecord, "status" | "result" | "error">>
) {
  const admin = createServiceRoleClient();
  await admin
    .from("v19_content_jobs")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", jobId);
}
