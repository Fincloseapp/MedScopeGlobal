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
