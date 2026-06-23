/**
 * v25.2 — MarketingCoordinator: orchestrace marketerů, schvalování, týdenní report
 * v25.3 — activity logging to marketer_activity_log
 */
import { appendLog } from "../shared.mjs";
import { getSupabaseAdmin } from "../writers/writer-base.mjs";
import { logMarketerActivityDb } from "./marketer-base.mjs";

const AUTO_APPROVE_THRESHOLD = 75;

function weekStartDate(d = new Date()) {
  const date = new Date(d);
  const day = date.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setUTCDate(date.getUTCDate() + diff);
  date.setUTCHours(0, 0, 0, 0);
  return date.toISOString().slice(0, 10);
}

export async function listPendingProposals(admin) {
  const { data, error } = await admin
    .from("marketing_proposals")
    .select("*")
    .eq("status", "pending")
    .order("priority", { ascending: false })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function approveProposal(admin, proposal) {
  const targeting = proposal.targeting ?? {};
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

  let table;
  let row;

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

  const { data: campaign, error: insErr } = await admin.from(table).insert(row).select("*").single();
  if (insErr) throw insErr;

  await admin
    .from("marketing_proposals")
    .update({ status: "approved", updated_at: new Date().toISOString() })
    .eq("id", proposal.id);

  await logMarketerActivityDb(admin, {
    marketerId: proposal.marketer_id,
    action: "proposal_approved",
    details: { proposal_id: proposal.id, campaign_table: table, auto: false },
    proposalId: proposal.id,
  });

  return campaign;
}

export async function rejectProposal(admin, proposalId, notes) {
  const { data: proposal } = await admin
    .from("marketing_proposals")
    .select("marketer_id")
    .eq("id", proposalId)
    .maybeSingle();

  await admin
    .from("marketing_proposals")
    .update({
      status: "rejected",
      coordinator_notes: notes ?? "Automaticky zamítnuto koordinátorem",
      updated_at: new Date().toISOString(),
    })
    .eq("id", proposalId);

  if (proposal) {
    await logMarketerActivityDb(admin, {
      marketerId: proposal.marketer_id,
      action: "proposal_rejected",
      details: { proposal_id: proposalId, notes: notes ?? null },
      proposalId,
    });
  }
}

export async function coordinateProposals(options = {}) {
  const admin = getSupabaseAdmin();
  if (!admin) return { ok: false, detail: "no supabase" };

  await logMarketerActivityDb(admin, {
    marketerId: "public",
    action: "coordinator_started",
    details: { autoApprove: options.autoApprove !== false },
  });

  const pending = await listPendingProposals(admin);
  let approved = 0;
  let rejected = 0;
  const autoApprove = options.autoApprove !== false;

  for (const proposal of pending) {
    const score = Number(proposal.priority ?? 0);
    const traffic = Number(proposal.traffic_score ?? 0);
    const combined = (score + traffic) / 2;

    if (autoApprove && combined >= AUTO_APPROVE_THRESHOLD) {
      try {
        await approveProposal(admin, proposal);
        approved += 1;
        await logMarketerActivityDb(admin, {
          marketerId: proposal.marketer_id,
          action: "proposal_auto_approved",
          details: { proposal_id: proposal.id, combined_score: combined },
          proposalId: proposal.id,
        });
        appendLog("v25-marketers.log", `approved ${proposal.id} (score ${combined})`);
      } catch (e) {
        appendLog("v25-marketers.log", `approve failed ${proposal.id}: ${e.message}`);
      }
    } else if (autoApprove && combined < 40) {
      await rejectProposal(admin, proposal.id, "Nízké skóre relevance/traffic");
      rejected += 1;
    }
  }

  await logMarketerActivityDb(admin, {
    marketerId: "public",
    action: "coordinator_completed",
    details: { pending: pending.length, approved, rejected, leftPending: pending.length - approved - rejected },
  });

  return { ok: true, pending: pending.length, approved, rejected, leftPending: pending.length - approved - rejected };
}

export async function generateWeeklyReport() {
  const admin = getSupabaseAdmin();
  if (!admin) return { ok: false, detail: "no supabase" };

  const weekStart = weekStartDate();
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);

  const { data: all } = await admin
    .from("marketing_proposals")
    .select("status, marketer_id, priority, traffic_score")
    .gte("created_at", weekStart)
    .lt("created_at", weekEnd.toISOString());

  const rows = all ?? [];
  const pending = rows.filter((r) => r.status === "pending").length;
  const approved = rows.filter((r) => r.status === "approved").length;
  const rejected = rows.filter((r) => r.status === "rejected").length;

  const byMarketer = {};
  for (const r of rows) {
    byMarketer[r.marketer_id] = (byMarketer[r.marketer_id] ?? 0) + 1;
  }

  const summary = `Týden ${weekStart}: ${rows.length} návrhů (schváleno ${approved}, zamítnuto ${rejected}, čeká ${pending}).`;
  const metrics = {
    byMarketer,
    avgPriority: rows.length ? rows.reduce((s, r) => s + (r.priority ?? 0), 0) / rows.length : 0,
    avgTraffic: rows.length ? rows.reduce((s, r) => s + Number(r.traffic_score ?? 0), 0) / rows.length : 0,
  };

  const { data, error } = await admin
    .from("marketing_reports")
    .upsert(
      {
        week_start: weekStart,
        summary,
        proposals_pending: pending,
        proposals_approved: approved,
        proposals_rejected: rejected,
        metrics,
      },
      { onConflict: "week_start" }
    )
    .select("*")
    .single();

  if (error) {
    appendLog("v25-marketers.log", `weekly report error: ${error.message}`);
    return { ok: false, detail: error.message };
  }

  appendLog("v25-marketers.log", `weekly report ${weekStart}: ${summary}`);
  return { ok: true, report: data };
}

export async function runMarketingCoordinator(options = {}) {
  appendLog("v25-marketers.log", "MarketingCoordinator start");

  const coordination = await coordinateProposals(options);
  let report = null;

  const day = new Date().getUTCDay();
  if (options.forceReport || day === 1) {
    report = await generateWeeklyReport();
  }

  appendLog("v25-marketers.log", `MarketingCoordinator done: approved=${coordination.approved}`);
  return { ok: coordination.ok, coordination, report };
}
