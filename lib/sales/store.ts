import { tryCreateServiceRoleClient } from "@/lib/supabase/service";
import type {
  SalesContract,
  SalesInquiry,
  SalesInvoice,
  SalesOutreach,
  SalesProspect,
  SalesRun,
} from "@/lib/sales/types";

export type SalesClient = NonNullable<ReturnType<typeof tryCreateServiceRoleClient>>;

export function salesDb(timeoutMs: number | null = 8_000): SalesClient | null {
  return tryCreateServiceRoleClient({ timeoutMs });
}

function asArray<T>(data: unknown): T[] {
  return Array.isArray(data) ? (data as T[]) : [];
}

export async function listProspects(db: SalesClient, limit = 200): Promise<SalesProspect[]> {
  const { data } = await db
    .from("sales_prospects")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(limit);
  return asArray<SalesProspect>(data);
}

export async function listContracts(db: SalesClient, limit = 200): Promise<SalesContract[]> {
  const { data } = await db
    .from("sales_contracts")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(limit);
  return asArray<SalesContract>(data).map(normalizeContract);
}

export async function listOutreach(db: SalesClient, limit = 120): Promise<SalesOutreach[]> {
  const { data } = await db
    .from("sales_outreach")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return asArray<SalesOutreach>(data);
}

export async function listInvoices(db: SalesClient, limit = 120): Promise<SalesInvoice[]> {
  const { data } = await db
    .from("sales_invoices")
    .select("*")
    .order("issued_at", { ascending: false })
    .limit(limit);
  return asArray<SalesInvoice>(data);
}

export async function listInquiries(db: SalesClient, limit = 120): Promise<SalesInquiry[]> {
  const { data } = await db
    .from("sales_inquiries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return asArray<SalesInquiry>(data);
}

export async function listRuns(db: SalesClient, limit = 20): Promise<SalesRun[]> {
  const { data } = await db
    .from("sales_runs")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(limit);
  return asArray<SalesRun>(data);
}

export async function listSuppressions(db: SalesClient): Promise<Set<string>> {
  const { data } = await db.from("sales_suppressions").select("email").limit(2000);
  return new Set(
    asArray<{ email: string }>(data)
      .map((row) => row.email?.trim().toLowerCase())
      .filter(Boolean)
  );
}

export async function findProspectByEmail(db: SalesClient, email: string): Promise<SalesProspect | null> {
  const { data } = await db.from("sales_prospects").select("*").ilike("email", email).maybeSingle();
  return (data as SalesProspect) ?? null;
}

export async function findProspectBySlug(db: SalesClient, slug: string): Promise<SalesProspect | null> {
  const { data } = await db.from("sales_prospects").select("*").eq("slug", slug).maybeSingle();
  return (data as SalesProspect) ?? null;
}

export async function findProspectByWebsite(db: SalesClient, website: string): Promise<SalesProspect | null> {
  const { data } = await db.from("sales_prospects").select("*").ilike("website", `%${website}%`).limit(1);
  return asArray<SalesProspect>(data)[0] ?? null;
}

export async function findContractById(db: SalesClient, id: string): Promise<SalesContract | null> {
  const { data } = await db.from("sales_contracts").select("*").eq("id", id).maybeSingle();
  return data ? normalizeContract(data as SalesContract) : null;
}

export async function findContractByToken(db: SalesClient, token: string): Promise<SalesContract | null> {
  const { data } = await db.from("sales_contracts").select("*").eq("portal_token", token).maybeSingle();
  return data ? normalizeContract(data as SalesContract) : null;
}

export async function findActiveContractBySlug(db: SalesClient, slug: string): Promise<SalesContract | null> {
  const { data } = await db
    .from("sales_contracts")
    .select("*")
    .eq("landing_slug", slug)
    .in("status", ["active", "past_due"])
    .order("updated_at", { ascending: false })
    .limit(1);
  const row = asArray<SalesContract>(data)[0];
  return row ? normalizeContract(row) : null;
}

export async function insertProspect(
  db: SalesClient,
  row: Partial<SalesProspect> & { company: string; slug: string }
): Promise<SalesProspect | null> {
  const { data, error } = await db.from("sales_prospects").insert(row).select("*").maybeSingle();
  if (error) {
    console.warn("[sales] insert prospect", error.message);
    return null;
  }
  return data as SalesProspect;
}

export async function updateProspect(
  db: SalesClient,
  id: string,
  patch: Partial<SalesProspect>
): Promise<void> {
  await db
    .from("sales_prospects")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id);
}

export async function insertContract(
  db: SalesClient,
  row: Partial<SalesContract> & {
    prospect_id: string;
    package_id: string;
    monthly_czk: number;
    landing_slug: string;
    portal_token: string;
  }
): Promise<SalesContract | null> {
  const { data, error } = await db.from("sales_contracts").insert(row).select("*").maybeSingle();
  if (error) {
    console.warn("[sales] insert contract", error.message);
    return null;
  }
  return data ? normalizeContract(data as SalesContract) : null;
}

export async function updateContract(
  db: SalesClient,
  id: string,
  patch: Partial<SalesContract>
): Promise<void> {
  await db
    .from("sales_contracts")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id);
}

export async function insertOutreach(
  db: SalesClient,
  row: Partial<SalesOutreach> & { prospect_id: string; subject: string; body_html: string }
): Promise<SalesOutreach | null> {
  const { data, error } = await db.from("sales_outreach").insert(row).select("*").maybeSingle();
  if (error) {
    console.warn("[sales] insert outreach", error.message);
    return null;
  }
  return data as SalesOutreach;
}

export async function updateOutreach(
  db: SalesClient,
  id: string,
  patch: Partial<SalesOutreach>
): Promise<void> {
  await db.from("sales_outreach").update(patch).eq("id", id);
}

export async function insertInvoice(
  db: SalesClient,
  row: Partial<SalesInvoice> & {
    contract_id: string;
    prospect_id: string;
    number: string;
    variable_symbol: string;
    amount_czk: number;
    period_start: string;
    period_end: string;
    due_at: string;
  }
): Promise<SalesInvoice | null> {
  const { data, error } = await db.from("sales_invoices").insert(row).select("*").maybeSingle();
  if (error) {
    console.warn("[sales] insert invoice", error.message);
    return null;
  }
  return data as SalesInvoice;
}

export async function updateInvoice(
  db: SalesClient,
  id: string,
  patch: Partial<SalesInvoice>
): Promise<void> {
  await db.from("sales_invoices").update(patch).eq("id", id);
}

export async function insertInquiry(
  db: SalesClient,
  row: Partial<SalesInquiry> & {
    landing_slug: string;
    company_name: string;
    sender_name: string;
    sender_email: string;
    message: string;
  }
): Promise<SalesInquiry | null> {
  const { data, error } = await db.from("sales_inquiries").insert(row).select("*").maybeSingle();
  if (error) {
    console.warn("[sales] insert inquiry", error.message);
    return null;
  }
  return data as SalesInquiry;
}

export async function updateInquiry(
  db: SalesClient,
  id: string,
  patch: Partial<SalesInquiry>
): Promise<void> {
  await db.from("sales_inquiries").update(patch).eq("id", id);
}

export async function insertSuppression(db: SalesClient, email: string, reason: string): Promise<void> {
  await db.from("sales_suppressions").upsert(
    { email: email.trim().toLowerCase(), reason },
    { onConflict: "email" }
  );
}

export async function insertEvent(
  db: SalesClient,
  kind: string,
  payload: Record<string, unknown>,
  ids?: { prospect_id?: string; contract_id?: string }
): Promise<void> {
  await db.from("sales_events").insert({
    kind,
    payload,
    prospect_id: ids?.prospect_id ?? null,
    contract_id: ids?.contract_id ?? null,
  });
}

export async function insertRun(db: SalesClient, row: Partial<SalesRun>): Promise<SalesRun | null> {
  const { data } = await db.from("sales_runs").insert(row).select("*").maybeSingle();
  return (data as SalesRun) ?? null;
}

export async function countInvoicesThisMonth(db: SalesClient): Promise<number> {
  const start = new Date();
  const from = `${start.getUTCFullYear()}-${String(start.getUTCMonth() + 1).padStart(2, "0")}-01`;
  const { count } = await db
    .from("sales_invoices")
    .select("id", { count: "exact", head: true })
    .gte("issued_at", from);
  return count ?? 0;
}

export async function countInquiriesForContract(
  db: SalesClient,
  contractId: string
): Promise<number> {
  const { count } = await db
    .from("sales_inquiries")
    .select("id", { count: "exact", head: true })
    .eq("contract_id", contractId);
  return count ?? 0;
}

function normalizeContract(row: SalesContract): SalesContract {
  const ads = row.ads_ids;
  const adsIds = Array.isArray(ads)
    ? ads.map(String)
    : typeof ads === "string"
      ? (() => {
          try {
            const parsed = JSON.parse(ads) as unknown;
            return Array.isArray(parsed) ? parsed.map(String) : [];
          } catch {
            return [];
          }
        })()
      : [];
  return { ...row, ads_ids: adsIds };
}
