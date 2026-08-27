import { tryCreateServiceRoleClient } from "@/lib/supabase/service";
import { demoMediFlowDashboard } from "@/lib/mediflow/types";
import type {
  MediFlowDashboard,
  MediFlowNote,
  MediFlowSavedArticle,
  MediFlowSupplement,
  MediFlowSymptom,
} from "@/lib/mediflow/types";

function rowToNote(r: Record<string, unknown>): MediFlowNote {
  return {
    id: r.id as string,
    title: r.title as string,
    body: r.body as string,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
    tags: (r.tags as string[]) ?? [],
  };
}

function rowToSymptom(r: Record<string, unknown>): MediFlowSymptom {
  return {
    id: r.id as string,
    name: r.name as string,
    severity: r.severity as MediFlowSymptom["severity"],
    notes: (r.notes as string) ?? undefined,
    loggedAt: r.logged_at as string,
  };
}

function rowToSupplement(r: Record<string, unknown>): MediFlowSupplement {
  return {
    id: r.id as string,
    name: r.name as string,
    dosage: r.dosage as string,
    frequency: r.frequency as string,
    takenToday: r.taken_today as boolean,
    protocolSlug: (r.protocol_slug as string) ?? undefined,
  };
}

function rowToSaved(r: Record<string, unknown>): MediFlowSavedArticle {
  return {
    id: r.id as string,
    articleSlug: r.article_slug as string,
    articleTitle: r.article_title as string,
    savedAt: r.saved_at as string,
    excerpt: (r.excerpt as string) ?? undefined,
  };
}

export async function getMediFlowDashboard(userId?: string | null): Promise<MediFlowDashboard> {
  if (!userId) return demoMediFlowDashboard();

  const admin = tryCreateServiceRoleClient();
  if (!admin) return demoMediFlowDashboard();

  try {
    const [notesRes, symptomsRes, supplementsRes, savedRes] = await Promise.all([
      admin.from("mediflow_notes").select("*").eq("user_id", userId).order("updated_at", { ascending: false }).limit(50),
      admin.from("mediflow_symptoms").select("*").eq("user_id", userId).order("logged_at", { ascending: false }).limit(50),
      admin.from("mediflow_supplements").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      admin.from("mediflow_saved_articles").select("*").eq("user_id", userId).order("saved_at", { ascending: false }).limit(50),
    ]);

    const notes = (notesRes.data ?? []).map(rowToNote);
    const symptoms = (symptomsRes.data ?? []).map(rowToSymptom);
    const supplements = (supplementsRes.data ?? []).map(rowToSupplement);
    const savedArticles = (savedRes.data ?? []).map(rowToSaved);

    if (!notes.length && !symptoms.length && !supplements.length && !savedArticles.length) {
      return demoMediFlowDashboard();
    }

    return {
      notes,
      symptoms,
      supplements: supplements.length ? supplements : demoMediFlowDashboard().supplements,
      savedArticles,
      streakDays: Math.min(30, notes.length + symptoms.length),
    };
  } catch {
    return demoMediFlowDashboard();
  }
}

export async function addMediFlowNote(userId: string, body: string, title?: string): Promise<MediFlowNote> {
  const admin = tryCreateServiceRoleClient();
  if (!admin) throw new Error("Supabase unavailable");

  const now = new Date().toISOString();
  const { data, error } = await admin
    .from("mediflow_notes")
    .insert({
      user_id: userId,
      title: title ?? body.slice(0, 50),
      body,
      updated_at: now,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return rowToNote(data);
}

export async function addMediFlowSymptom(
  userId: string,
  name: string,
  severity: MediFlowSymptom["severity"] = 3
): Promise<MediFlowSymptom> {
  const admin = tryCreateServiceRoleClient();
  if (!admin) throw new Error("Supabase unavailable");

  const { data, error } = await admin
    .from("mediflow_symptoms")
    .insert({ user_id: userId, name, severity })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return rowToSymptom(data);
}

export async function toggleMediFlowSupplement(
  userId: string,
  supplementId: string,
  takenToday: boolean
): Promise<void> {
  const admin = tryCreateServiceRoleClient();
  if (!admin) throw new Error("Supabase unavailable");

  const { error } = await admin
    .from("mediflow_supplements")
    .update({ taken_today: takenToday, updated_at: new Date().toISOString() })
    .eq("id", supplementId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
}

export async function saveMediFlowArticle(
  userId: string,
  fields: { articleSlug: string; articleTitle: string; excerpt?: string }
): Promise<MediFlowSavedArticle> {
  const admin = tryCreateServiceRoleClient();
  if (!admin) throw new Error("Supabase unavailable");

  const { data, error } = await admin
    .from("mediflow_saved_articles")
    .upsert(
      {
        user_id: userId,
        article_slug: fields.articleSlug,
        article_title: fields.articleTitle,
        excerpt: fields.excerpt ?? null,
        saved_at: new Date().toISOString(),
      },
      { onConflict: "user_id,article_slug" }
    )
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return rowToSaved(data);
}

/** Cron: reset taken_today flags on all MediFlow supplements (daily at 04:00 UTC). */
export async function resetMediFlowSupplementsDaily(): Promise<{ reset: number; skipped?: boolean }> {
  const admin = tryCreateServiceRoleClient();
  if (!admin) return { reset: 0, skipped: true };

  const { data, error } = await admin
    .from("mediflow_supplements")
    .update({ taken_today: false, updated_at: new Date().toISOString() })
    .eq("taken_today", true)
    .select("id");

  if (error) throw new Error(error.message);
  return { reset: data?.length ?? 0 };
}

export async function seedMediFlowDefaults(userId: string): Promise<void> {
  const admin = tryCreateServiceRoleClient();
  if (!admin) return;

  const demo = demoMediFlowDashboard();
  const { count } = await admin
    .from("mediflow_supplements")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (count && count > 0) return;

  await admin.from("mediflow_supplements").insert(
    demo.supplements.map((s) => ({
      user_id: userId,
      name: s.name,
      dosage: s.dosage,
      frequency: s.frequency,
      taken_today: s.takenToday,
      protocol_slug: s.protocolSlug ?? null,
    }))
  );
}

export async function logDonationOrder(fields: {
  stripeSessionId: string;
  amountMinor: number;
  currency: string;
  userId?: string | null;
  articleSlug?: string;
  articleTitle?: string;
}): Promise<void> {
  const admin = tryCreateServiceRoleClient();
  if (!admin) return;

  await admin.from("v27_orders").upsert(
    {
      stripe_session_id: fields.stripeSessionId,
      kind: "donation",
      product_id: "author_donation",
      amount_czk: fields.currency === "czk" ? fields.amountMinor : Math.round(fields.amountMinor / 100),
      status: "pending",
      user_id: fields.userId ?? null,
      metadata: {
        currency: fields.currency,
        amount_minor: fields.amountMinor,
        article_slug: fields.articleSlug ?? "",
        article_title: fields.articleTitle ?? "",
      },
    },
    { onConflict: "stripe_session_id" }
  );
}

export async function logArticleTipOrder(fields: {
  stripeSessionId: string;
  amountMinor: number;
  currency: string;
  userId?: string | null;
  articleSlug: string;
  articleTitle?: string;
  locale?: string;
}): Promise<void> {
  const admin = tryCreateServiceRoleClient();
  if (!admin) return;

  const { error } = await admin.from("v27_orders").upsert(
    {
      stripe_session_id: fields.stripeSessionId,
      kind: "article_tip",
      product_id: "article_tringelt",
      amount_czk: fields.currency === "czk" ? fields.amountMinor : Math.round(fields.amountMinor / 100),
      status: "pending",
      user_id: fields.userId ?? null,
      metadata: {
        currency: fields.currency,
        amount_minor: fields.amountMinor,
        article_slug: fields.articleSlug,
        article_title: fields.articleTitle ?? "",
        locale: fields.locale ?? "cs",
      },
    },
    { onConflict: "stripe_session_id" }
  );
  if (error) {
    console.error("[logArticleTipOrder]", error.message);
  }
}
