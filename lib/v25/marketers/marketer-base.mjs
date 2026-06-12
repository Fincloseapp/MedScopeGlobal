/**
 * v25.2 — Sdílená logika AI marketerů
 */
import { appendLog, readJson, writeJson } from "../shared.mjs";
import { generateJsonFromLlm, getSupabaseAdmin } from "../writers/writer-base.mjs";

export const MARKETER_IDS = ["public", "students", "pro"];

export function loadPartners() {
  return readJson("ads/partners.json") ?? { partners: [], updatedAt: null };
}

export function savePartners(data) {
  writeJson("ads/partners.json", { ...data, updatedAt: new Date().toISOString() });
}

export function scorePartner(partner, hints = {}) {
  const commission = Number(partner.commission_pct ?? partner.commission ?? 5);
  const relevance = Number(partner.relevance ?? 50);
  const traffic = Number(partner.traffic_potential ?? hints.trafficScore ?? 40);
  const score = commission * 0.3 + relevance * 0.4 + traffic * 0.3;
  return Math.round(score * 100) / 100;
}

export function rankPartners(partners, hints = {}) {
  return [...partners]
    .map((p) => ({ ...p, score: scorePartner(p, hints) }))
    .sort((a, b) => b.score - a.score);
}

export async function analyzeTrafficHints(admin, segment) {
  const hints = { segment, topics: [], trafficScore: 40 };

  if (!admin) return hints;

  if (segment === "public") {
    const { data } = await admin
      .from("articles")
      .select("public_topic")
      .eq("audience", "public")
      .eq("published", true)
      .order("published_at", { ascending: false })
      .limit(50);
    const topics = [...new Set((data ?? []).map((r) => r.public_topic).filter(Boolean))];
    hints.topics = topics;
    hints.trafficScore = Math.min(90, 30 + topics.length * 10);
  } else if (segment === "students") {
    const { data } = await admin
      .from("articles")
      .select("student_topic, study_year, med_track")
      .eq("audience", "professional")
      .not("student_topic", "is", null)
      .limit(50);
    hints.topics = [...new Set((data ?? []).map((r) => r.student_topic).filter(Boolean))];
    hints.studyYears = [...new Set((data ?? []).map((r) => r.study_year).filter(Boolean))];
    hints.medTracks = [...new Set((data ?? []).map((r) => r.med_track).filter(Boolean))];
    hints.trafficScore = Math.min(85, 25 + (data?.length ?? 0) * 3);
  } else {
    const { count } = await admin
      .from("articles")
      .select("id", { count: "exact", head: true })
      .eq("audience", "professional")
      .eq("published", true);
    hints.trafficScore = Math.min(80, 20 + (count ?? 0));
    hints.articleCount = count ?? 0;
  }

  return hints;
}

export async function generateAdCopy({ segment, partner, topic, angle }) {
  const system = `Jsi český marketingový copywriter pro zdravotnický portál MedScopeGlobal.
Segment: ${segment}. Piš eticky, transparentně (označ sponzorovaný obsah), bez léčebných tvrzení.
Vrať JSON: { "title": string, "body_html": string (krátký HTML odstavec), "cta_text": string }`;

  const user = `Partner: ${partner.name}. Téma: ${topic}. Úhel: ${angle}.
URL: ${partner.url ?? partner.affiliate_url ?? "#"}.`;

  const parsed = await generateJsonFromLlm({ system, user, maxTokens: 800 });
  if (parsed?.title) return parsed;

  return {
    title: `${partner.name}: ${topic}`,
    body_html: `<p>Objevte ${partner.name} — ${angle}. Obsah je sponzorovaný.</p>`,
    cta_text: "Zjistit více",
  };
}

export async function logProposal(admin, proposal) {
  if (!admin) {
    appendLog("v25-marketers.log", "logProposal: no supabase");
    return null;
  }

  const row = {
    marketer_id: proposal.marketer_id,
    status: "pending",
    title: proposal.title,
    body_html: proposal.body_html ?? "",
    campaign_type: proposal.campaign_type ?? "inline",
    targeting: proposal.targeting ?? {},
    affiliate_url: proposal.affiliate_url ?? null,
    cta_text: proposal.cta_text ?? null,
    partner_id: proposal.partner_id ?? null,
    partner_name: proposal.partner_name ?? null,
    priority: proposal.priority ?? 50,
    traffic_score: proposal.traffic_score ?? null,
    relevance_score: proposal.relevance_score ?? null,
    commission_estimate: proposal.commission_estimate ?? null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await admin.from("marketing_proposals").insert(row).select("*").single();
  if (error) {
    appendLog("v25-marketers.log", `logProposal error: ${error.message}`);
    return null;
  }
  appendLog("v25-marketers.log", `proposal ${data.id} from ${proposal.marketer_id}`);
  return data;
}

export async function runMarketer({ marketerId, segment, partnerFilter, topics, angles }) {
  const admin = getSupabaseAdmin();
  const hints = await analyzeTrafficHints(admin, segment);
  const partnersData = loadPartners();
  let partners = partnersData.partners ?? [];

  if (partnerFilter) {
    partners = partners.filter((p) => partnerFilter(p));
  }

  const ranked = rankPartners(partners, hints).slice(0, 5);
  const proposals = [];

  for (let i = 0; i < Math.min(3, ranked.length); i++) {
    const partner = ranked[i];
    const topic = topics[i % topics.length] ?? hints.topics?.[0] ?? "zdraví";
    const angle = angles[i % angles.length] ?? "praktický tip pro čtenáře";

    const copy = await generateAdCopy({ segment, partner, topic, angle });
    const proposal = await logProposal(admin, {
      marketer_id: marketerId,
      title: copy.title,
      body_html: copy.body_html,
      cta_text: copy.cta_text,
      affiliate_url: partner.affiliate_url ?? partner.url,
      partner_id: partner.id,
      partner_name: partner.name,
      campaign_type: "inline",
      targeting: buildTargeting(segment, topic, hints),
      priority: Math.round(partner.score ?? 50),
      traffic_score: hints.trafficScore,
      relevance_score: partner.relevance ?? 50,
      commission_estimate: partner.commission_pct ?? partner.commission ?? null,
    });

    if (proposal) proposals.push(proposal);
  }

  return { ok: true, marketerId, proposals: proposals.length, hints };
}

function buildTargeting(segment, topic, hints) {
  if (segment === "public") return { target_topics: [topic] };
  if (segment === "students") {
    return {
      target_topics: [topic],
      study_years: hints.studyYears ?? [],
      med_tracks: hints.medTracks ?? [],
    };
  }
  return { b2b_category: topic, target_specialties: [] };
}

export async function discoverPartners(admin, candidates) {
  const existing = loadPartners();
  const byId = new Map((existing.partners ?? []).map((p) => [p.id, p]));

  for (const c of candidates) {
    const scored = {
      ...c,
      relevance: c.relevance ?? 50,
      traffic_potential: c.traffic_potential ?? 40,
      commission_pct: c.commission_pct ?? c.commission ?? 5,
      score: scorePartner(c),
      discovered_at: new Date().toISOString(),
    };
    byId.set(c.id, { ...byId.get(c.id), ...scored });
  }

  const partners = [...byId.values()].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  savePartners({ partners });
  appendLog("v25-marketers.log", `partners.json updated: ${partners.length} entries`);
  return partners;
}
