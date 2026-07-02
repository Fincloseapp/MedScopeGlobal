import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";

export type MarketingProposalStatus = "pending" | "approved" | "rejected";
export type MarketerId = "public" | "students" | "pro";

export type StudentAdCampaign = {
  id: string;
  title: string;
  body_html: string;
  type: string;
  study_years: number[];
  med_tracks: string[];
  target_topics: string[];
  affiliate_url: string | null;
  cta_text: string | null;
  frequency: number;
  active: boolean;
  impressions: number;
  clicks: number;
  proposal_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ProAdCampaign = {
  id: string;
  title: string;
  body_html: string;
  type: string;
  target_specialties: string[];
  b2b_category: string | null;
  affiliate_url: string | null;
  cta_text: string | null;
  frequency: number;
  active: boolean;
  impressions: number;
  clicks: number;
  proposal_id: string | null;
  created_at: string;
  updated_at: string;
};

export type MarketingProposal = {
  id: string;
  marketer_id: MarketerId;
  status: MarketingProposalStatus;
  title: string;
  body_html: string;
  campaign_type: string;
  targeting: Record<string, unknown>;
  affiliate_url: string | null;
  cta_text: string | null;
  partner_id: string | null;
  partner_name: string | null;
  priority: number;
  traffic_score: number | null;
  relevance_score: number | null;
  commission_estimate: number | null;
  coordinator_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type MarketingReport = {
  id: string;
  week_start: string;
  summary: string;
  proposals_pending: number;
  proposals_approved: number;
  proposals_rejected: number;
  metrics: Record<string, unknown>;
  created_at: string;
};

export type ManualAdAudience = "public" | "student" | "pro";
export type ManualAdZone = "header" | "sidebar" | "inline" | "footer" | "article" | "custom_path";

export type ManualAdPlacement = {
  id: string;
  audience: ManualAdAudience;
  placement_zone: ManualAdZone;
  target_path: string;
  campaign_id: string | null;
  html: string;
  active: boolean;
  priority: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type MarketerActivityLog = {
  id: string;
  marketer_id: MarketerId;
  action: string;
  details: Record<string, unknown>;
  proposal_id: string | null;
  created_at: string;
};

export type CategoryPerformance = {
  category: string;
  audience: string;
  campaigns: number;
  impressions: number;
  clicks: number;
  ctr: number;
};

export type AdsOverview = {
  proposals: { pending: number; approved: number; rejected: number; total: number };
  coordinator: { autoApprovedWeek: number; autoRejectedWeek: number; pending: number };
  campaigns: {
    public: { active: number; impressions: number; clicks: number };
    student: { active: number; impressions: number; clicks: number };
    pro: { active: number; impressions: number; clicks: number };
    manual: { active: number; total: number };
  };
  marketerActivity: { last24h: number; last7d: number; byMarketer: Record<string, number> };
  partners?: { count: number; top: Array<{ id: string; name: string; score?: number }> };
  recentLogs: MarketerActivityLog[];
};

export async function listStudentAdCampaigns(options?: {
  activeOnly?: boolean;
}): Promise<StudentAdCampaign[]> {
  const supabase = await createClient();
  let q = supabase.from("student_ad_campaigns").select("*").order("updated_at", { ascending: false });
  if (options?.activeOnly) q = q.eq("active", true);
  const { data, error } = await q;
  if (error) {
    console.error("listStudentAdCampaigns", error);
    return [];
  }
  return (data ?? []) as StudentAdCampaign[];
}

export async function listStudentAdCampaignsForArticle(article: {
  study_year?: number | null;
  med_track?: string | null;
  student_topic?: string | null;
}): Promise<StudentAdCampaign[]> {
  const { filterStudentCampaigns } = await import("@/lib/marketing/helpers");
  const campaigns = await listStudentAdCampaigns({ activeOnly: true });
  return filterStudentCampaigns(campaigns, article);
}

export async function getStudentAdCampaign(id: string): Promise<StudentAdCampaign | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("student_ad_campaigns").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as StudentAdCampaign | null;
}

export async function listProAdCampaigns(options?: { activeOnly?: boolean }): Promise<ProAdCampaign[]> {
  const supabase = await createClient();
  let q = supabase.from("pro_ad_campaigns").select("*").order("updated_at", { ascending: false });
  if (options?.activeOnly) q = q.eq("active", true);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as ProAdCampaign[];
}

export async function listMarketingProposals(options?: {
  status?: MarketingProposalStatus;
  marketerId?: MarketerId;
  limit?: number;
}): Promise<MarketingProposal[]> {
  const supabase = await createClient();
  let q = supabase
    .from("marketing_proposals")
    .select("*")
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false });
  if (options?.status) q = q.eq("status", options.status);
  if (options?.marketerId) q = q.eq("marketer_id", options.marketerId);
  if (options?.limit) q = q.limit(options.limit);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as MarketingProposal[];
}

export async function getMarketingProposal(id: string): Promise<MarketingProposal | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("marketing_proposals").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as MarketingProposal | null;
}

export async function listMarketingReports(limit = 12): Promise<MarketingReport[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("marketing_reports")
    .select("*")
    .order("week_start", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as MarketingReport[];
}

export async function updateProposalStatus(
  id: string,
  status: MarketingProposalStatus,
  coordinatorNotes?: string
): Promise<MarketingProposal> {
  const admin = createServiceRoleClient();

  if (status === "approved") {
    const { data: proposal, error: fetchErr } = await admin
      .from("marketing_proposals")
      .select("*")
      .eq("id", id)
      .single();
    if (fetchErr) throw fetchErr;

    const targeting = (proposal.targeting ?? {}) as Record<string, unknown>;
    const base = {
      title: proposal.title,
      body_html: proposal.body_html,
      type: proposal.campaign_type ?? "inline",
      affiliate_url: proposal.affiliate_url,
      cta_text: proposal.cta_text,
      active: true,
      proposal_id: proposal.id,
      updated_at: new Date().toISOString(),
    };

    let table: string;
    let row: Record<string, unknown>;

    if (proposal.marketer_id === "public") {
      table = "public_ad_campaigns";
      row = { ...base, target_topics: targeting.target_topics ?? [] };
    } else if (proposal.marketer_id === "students") {
      table = "student_ad_campaigns";
      row = {
        ...base,
        study_years: targeting.study_years ?? [],
        med_tracks: targeting.med_tracks ?? [],
        target_topics: targeting.target_topics ?? [],
      };
    } else {
      table = "pro_ad_campaigns";
      row = {
        ...base,
        target_specialties: targeting.target_specialties ?? [],
        b2b_category: targeting.b2b_category ?? null,
      };
    }

    const { error: campErr } = await admin.from(table).insert(row);
    if (campErr) throw campErr;
  }

  const { data, error } = await admin
    .from("marketing_proposals")
    .update({
      status,
      coordinator_notes: coordinatorNotes ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as MarketingProposal;
}

export async function incrementStudentAdClick(campaignId: string): Promise<void> {
  const admin = createServiceRoleClient();
  const { data } = await admin.from("student_ad_campaigns").select("clicks").eq("id", campaignId).maybeSingle();
  const next = (data?.clicks ?? 0) + 1;
  await admin
    .from("student_ad_campaigns")
    .update({ clicks: next, updated_at: new Date().toISOString() })
    .eq("id", campaignId);
}

export async function incrementProAdClick(campaignId: string): Promise<void> {
  const admin = createServiceRoleClient();
  const { data } = await admin.from("pro_ad_campaigns").select("clicks").eq("id", campaignId).maybeSingle();
  const next = (data?.clicks ?? 0) + 1;
  await admin
    .from("pro_ad_campaigns")
    .update({ clicks: next, updated_at: new Date().toISOString() })
    .eq("id", campaignId);
}

// --- v25.3 manual placements ---

export async function listManualAdPlacements(options?: {
  audience?: ManualAdAudience;
  activeOnly?: boolean;
}): Promise<ManualAdPlacement[]> {
  const supabase = await createClient();
  let q = supabase
    .from("manual_ad_placements")
    .select("*")
    .order("priority", { ascending: false })
    .order("updated_at", { ascending: false });
  if (options?.audience) q = q.eq("audience", options.audience);
  if (options?.activeOnly) q = q.eq("active", true);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as ManualAdPlacement[];
}

export async function getManualAdPlacement(id: string): Promise<ManualAdPlacement | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("manual_ad_placements").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as ManualAdPlacement | null;
}

export async function createManualAdPlacement(
  input: Omit<ManualAdPlacement, "id" | "created_at" | "updated_at">
): Promise<ManualAdPlacement> {
  const admin = createServiceRoleClient();
  const { data, error } = await admin.from("manual_ad_placements").insert(input).select("*").single();
  if (error) throw error;
  return data as ManualAdPlacement;
}

export async function updateManualAdPlacement(
  id: string,
  patch: Partial<Omit<ManualAdPlacement, "id" | "created_at">>
): Promise<ManualAdPlacement> {
  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("manual_ad_placements")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as ManualAdPlacement;
}

export async function deleteManualAdPlacement(id: string): Promise<void> {
  const admin = createServiceRoleClient();
  const { error } = await admin.from("manual_ad_placements").delete().eq("id", id);
  if (error) throw error;
}

// --- v25.3 marketer activity log ---

export async function logMarketerActivity(input: {
  marketer_id: MarketerId;
  action: string;
  details?: Record<string, unknown>;
  proposal_id?: string | null;
}): Promise<MarketerActivityLog | null> {
  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("marketer_activity_log")
    .insert({
      marketer_id: input.marketer_id,
      action: input.action,
      details: input.details ?? {},
      proposal_id: input.proposal_id ?? null,
    })
    .select("*")
    .single();
  if (error) {
    console.error("logMarketerActivity", error);
    return null;
  }
  return data as MarketerActivityLog;
}

export async function listMarketerActivityLog(options?: {
  marketerId?: MarketerId;
  action?: string;
  limit?: number;
}): Promise<MarketerActivityLog[]> {
  const supabase = await createClient();
  let q = supabase
    .from("marketer_activity_log")
    .select("*")
    .order("created_at", { ascending: false });
  if (options?.marketerId) q = q.eq("marketer_id", options.marketerId);
  if (options?.action) q = q.eq("action", options.action);
  if (options?.limit) q = q.limit(options.limit);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as MarketerActivityLog[];
}

function sumMetrics(rows: Array<{ impressions?: number; clicks?: number }>): {
  impressions: number;
  clicks: number;
} {
  let impressions = 0;
  let clicks = 0;
  for (const r of rows) {
    impressions += r.impressions ?? 0;
    clicks += r.clicks ?? 0;
  }
  return { impressions, clicks };
}

export async function getCategoryPerformanceBreakdown(): Promise<CategoryPerformance[]> {
  const supabase = await createClient();
  const results: CategoryPerformance[] = [];

  const { data: publicCampaigns } = await supabase
    .from("public_ad_campaigns")
    .select("target_topics, impressions, clicks, active");
  for (const c of publicCampaigns ?? []) {
    const topics = (c.target_topics as string[])?.length ? (c.target_topics as string[]) : ["general"];
    for (const topic of topics) {
      results.push({
        category: topic,
        audience: "public",
        campaigns: 1,
        impressions: c.impressions ?? 0,
        clicks: c.clicks ?? 0,
        ctr: c.impressions ? ((c.clicks ?? 0) / c.impressions) * 100 : 0,
      });
    }
  }

  const { data: studentCampaigns } = await supabase
    .from("student_ad_campaigns")
    .select("target_topics, impressions, clicks, active");
  for (const c of studentCampaigns ?? []) {
    const topics = (c.target_topics as string[])?.length ? (c.target_topics as string[]) : ["general"];
    for (const topic of topics) {
      results.push({
        category: topic,
        audience: "student",
        campaigns: 1,
        impressions: c.impressions ?? 0,
        clicks: c.clicks ?? 0,
        ctr: c.impressions ? ((c.clicks ?? 0) / c.impressions) * 100 : 0,
      });
    }
  }

  const { data: proCampaigns } = await supabase
    .from("pro_ad_campaigns")
    .select("b2b_category, target_specialties, impressions, clicks, active");
  for (const c of proCampaigns ?? []) {
    const categories = c.b2b_category
      ? [c.b2b_category as string]
      : (c.target_specialties as string[])?.length
        ? (c.target_specialties as string[])
        : ["general"];
    for (const cat of categories) {
      results.push({
        category: cat,
        audience: "pro",
        campaigns: 1,
        impressions: c.impressions ?? 0,
        clicks: c.clicks ?? 0,
        ctr: c.impressions ? ((c.clicks ?? 0) / c.impressions) * 100 : 0,
      });
    }
  }

  // Merge by category+audience
  const merged = new Map<string, CategoryPerformance>();
  for (const row of results) {
    const key = `${row.audience}:${row.category}`;
    const existing = merged.get(key);
    if (existing) {
      existing.campaigns += 1;
      existing.impressions += row.impressions;
      existing.clicks += row.clicks;
      existing.ctr = existing.impressions ? (existing.clicks / existing.impressions) * 100 : 0;
    } else {
      merged.set(key, { ...row });
    }
  }

  return [...merged.values()].sort((a, b) => b.impressions - a.impressions);
}

export async function getAdsOverview(options?: { includePartners?: boolean }): Promise<AdsOverview> {
  const supabase = await createClient();
  const now = Date.now();
  const dayAgo = new Date(now - 86400000).toISOString();
  const weekAgo = new Date(now - 7 * 86400000).toISOString();

  const [
    { data: proposals },
    { data: publicCampaigns },
    { data: studentCampaigns },
    { data: proCampaigns },
    { data: manualPlacements },
    { count: activity24hCount },
    { data: activity7d },
    { data: recentLogs },
  ] = await Promise.all([
    supabase.from("marketing_proposals").select("status, marketer_id, created_at"),
    supabase.from("public_ad_campaigns").select("active, impressions, clicks"),
    supabase.from("student_ad_campaigns").select("active, impressions, clicks"),
    supabase.from("pro_ad_campaigns").select("active, impressions, clicks"),
    supabase.from("manual_ad_placements").select("active"),
    supabase.from("marketer_activity_log").select("*", { count: "exact", head: true }).gte("created_at", dayAgo),
    supabase.from("marketer_activity_log").select("marketer_id").gte("created_at", weekAgo),
    supabase.from("marketer_activity_log").select("*").order("created_at", { ascending: false }).limit(20),
  ]);

  const proposalRows = proposals ?? [];
  const pending = proposalRows.filter((p) => p.status === "pending").length;
  const approved = proposalRows.filter((p) => p.status === "approved").length;
  const rejected = proposalRows.filter((p) => p.status === "rejected").length;

  const weekProposals = proposalRows.filter((p) => p.created_at >= weekAgo);
  const autoApprovedWeek = weekProposals.filter((p) => p.status === "approved").length;
  const autoRejectedWeek = weekProposals.filter((p) => p.status === "rejected").length;

  const pubMetrics = sumMetrics(publicCampaigns ?? []);
  const stuMetrics = sumMetrics(studentCampaigns ?? []);
  const proMetrics = sumMetrics(proCampaigns ?? []);

  const byMarketer: Record<string, number> = {};
  for (const row of activity7d ?? []) {
    byMarketer[row.marketer_id] = (byMarketer[row.marketer_id] ?? 0) + 1;
  }

  const overview: AdsOverview = {
    proposals: { pending, approved, rejected, total: proposalRows.length },
    coordinator: { autoApprovedWeek, autoRejectedWeek, pending },
    campaigns: {
      public: {
        active: (publicCampaigns ?? []).filter((c) => c.active).length,
        ...pubMetrics,
      },
      student: {
        active: (studentCampaigns ?? []).filter((c) => c.active).length,
        ...stuMetrics,
      },
      pro: {
        active: (proCampaigns ?? []).filter((c) => c.active).length,
        ...proMetrics,
      },
      manual: {
        active: (manualPlacements ?? []).filter((p) => p.active).length,
        total: (manualPlacements ?? []).length,
      },
    },
    marketerActivity: {
      last24h: activity24hCount ?? 0,
      last7d: (activity7d ?? []).length,
      byMarketer,
    },
    recentLogs: (recentLogs ?? []) as MarketerActivityLog[],
  };

  if (options?.includePartners !== false) {
    try {
      const { readFileSync } = await import("node:fs");
      const { join } = await import("node:path");
      const { MEDSCOPE_DATA_ROOT } = await import("@/lib/config/paths");
      const dataRoot = MEDSCOPE_DATA_ROOT;
      const raw = readFileSync(join(dataRoot, "ads", "partners.json"), "utf8");
      const parsed = JSON.parse(raw) as { partners?: Array<{ id: string; name: string; score?: number }> };
      const partners = parsed.partners ?? [];
      overview.partners = {
        count: partners.length,
        top: partners.slice(0, 5).map((p) => ({ id: p.id, name: p.name, score: p.score })),
      };
    } catch {
      overview.partners = { count: 0, top: [] };
    }
  }

  return overview;
}
