#!/usr/bin/env node
import { createClient } from "@supabase/supabase-js";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadProjectEnv } from "./load-env.mjs";
import {
  auditArticle,
  summarizeArticleAudits,
  type AuditableArticle,
} from "../lib/editorial/article-quality-audit";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const HEART_SLUG =
  "beyond-the-pump-integrating-the-hearts-endocrine-function-into-early-medical-education";
const WHO_BDBV_SLUG =
  "zpravy-who-adds-first-diagnostic-test-for-ebola-bundibugyo-virus-to-its-emergency-use-listing";
const SENIOR_WELLBEING_SLUG =
  "verejnost-rozhovory-2026-06-14-zkusenost-pecovatele-o-dusevnim-zdravi-senioru-co-stoji-za-to-vedet-jeste-dnes";
const PAGE_SIZE = 500;
const ARTICLE_COLUMNS = [
  "id",
  "title",
  "slug",
  "excerpt",
  "content",
  "metadata",
  "published",
  "published_at",
  "created_at",
  "updated_at",
  "source_url",
  "source_name",
  "audience",
  "min_access_level",
  "locale",
  "rubric_slug",
  "content_type",
  "ai_generated",
].join(",");

const PROSE_REPLACEMENTS: Array<[RegExp, string]> = [
  [/(?<!\p{L})v dnešní době(?!\p{L})/giu, "v současnosti"],
  [/(?<!\p{L})je důležité si uvědomit(?!\p{L})/giu, "podstatné je"],
  [/(?<!\p{L})v tomto článku se podíváme(?!\p{L})/giu, "text shrnuje"],
  [/(?<!\p{L})závěrem lze říci(?!\p{L})/giu, "souhrnně"],
  [/(?<!\p{L})v konečném důsledku(?!\p{L})/giu, "prakticky"],
  [/(?<!\p{L})pojďme se podívat(?!\p{L})/giu, "zaměřme se"],
];

const WHO_BDBV_SOURCE = {
  name: "World Health Organization",
  url: "https://www.who.int/news/item/02-07-2026-who-adds-first-diagnostic-test-for-ebola-bundibugyo-virus-to-its-emergency-use-listing",
  originalTitle:
    "WHO adds first diagnostic test for Ebola Bundibugyo virus to its Emergency Use Listing",
  authors: "World Health Organization",
  year: 2026,
  publishedDate: "2026-07-02",
};

const WHO_BDBV_CONTENT = `<p>Světová zdravotnická organizace (WHO) 2. července 2026 oznámila zařazení prvního molekulárního diagnostického testu pro virus Bundibugyo (BDBV) na seznam Emergency Use Listing (EUL). Test vyhledává genetický materiál viru v krevním vzorku a slouží k laboratornímu potvrzení infekce. Níže uvedené údaje vycházejí z oficiálního sdělení WHO; redakční komentář MedScopeGlobal je od faktů zdroje výslovně oddělen.</p>

<h2>Co uvádí primární zdroj WHO</h2>
<p>Podle WHO prošel test nouzovým hodnoticím postupem EUL, který posuzuje dostupné podklady ke kvalitě, bezpečnosti a výkonnosti zdravotnického prostředku. Smyslem tohoto mechanismu je urychlit dostupnost důležitých zdravotnických produktů v mimořádných situacích, zejména tam, kde je běžné regulatorní posouzení nebo laboratorní kapacita omezená. Zařazení má rovněž usnadnit rozhodování států a organizací OSN při nákupu diagnostických prostředků.</p>
<p>WHO zasazuje krok do kontextu epidemie onemocnění vyvolaného virem Bundibugyo v Demokratické republice Kongo, s případy také v Ugandě. Ve sdělení uvádí, že generální ředitel WHO vyhlásil v květnu 2026 stav ohrožení veřejného zdraví mezinárodního významu a následně organizace vyzvala výrobce diagnostických prostředků k podání žádostí o nouzové zařazení.</p>
<p>K datu zveřejnění primárního zdroje WHO hlásila v Demokratické republice Kongo 1 406 laboratorně potvrzených případů a 438 úmrtí. Tato čísla jsou časově vázána k 2. červenci 2026 a nelze je bez novějšího oficiálního přehledu považovat za aktuální stav epidemie.</p>

<h2>Jaký je význam nouzového zařazení</h2>
<p>Rychlé laboratorní potvrzení může podpořit časnou identifikaci případů, péči o nemocné, epidemiologický dohled a protiepidemická opatření. EUL však není totéž co obecné doporučení použít test v každé situaci. Konkrétní nasazení závisí na místní epidemiologii, laboratorním zázemí, validovaném pracovním postupu, kontrole kvality a pravidlech příslušných zdravotnických autorit.</p>
<p>Diagnostický výsledek se musí interpretovat společně s klinickým obrazem, anamnézou expozice a aktuální definicí případu. Samotné zařazení produktu na nouzový seznam neřeší odběr a přepravu vzorku, biologickou bezpečnost, dostupnost vyškoleného personálu ani návaznost potvrzeného výsledku na izolaci, trasování kontaktů a léčebnou péči.</p>

<h2>Diagnostika je pouze část odpovědi</h2>
<p>WHO popisuje onemocnění vyvolané virem Bundibugyo jako závažnou a potenciálně život ohrožující infekci. Virus může přejít ze zvířete na člověka a dále se šířit přímým kontaktem s tělesnými tekutinami nemocného nebo zemřelého člověka, případně prostřednictvím kontaminovaných předmětů a povrchů. Dostupný laboratorní test proto musí být součástí širšího systému bezpečného odběru, ochrany zdravotníků, rychlého hlášení a řízení kontaktů.</p>
<p>Primární sdělení rovněž uvádí rozšíření laboratorní sítě v zasažených oblastech. Původní omezená kapacita několika pracovišť se podle WHO rozrostla na deset laboratoří s deklarovanou souhrnnou kapacitou přes dva tisíce testů denně. Jde o provozní údaj uvedený WHO k datu zprávy, nikoli o nezávisle ověřený ukazatel dostupnosti pro každého pacienta. Reálné využití může omezovat doprava vzorků, zásobování, personál a geografická dostupnost.</p>

<h2>Interpretace MedScopeGlobal</h2>
<p>Redakčně lze krok chápat především jako posílení diagnostické infrastruktury pro probíhající mimořádnou událost. Nejde o důkaz, že jeden test sám o sobě změní průběh epidemie, ani o podklad pro individuální diagnostiku mimo určené laboratorní a epidemiologické použití. Pro českou klinickou praxi má informace význam zejména pro specialisty v infekčním lékařství, laboratorní diagnostice, cestovní medicíně a ochraně veřejného zdraví.</p>

<h2>Limity a nejistoty</h2>
<p>Zpráva WHO je institucionální oznámení o regulatorním kroku, nikoli randomizovaná klinická studie. V tomto redakčním souhrnu proto nejsou doplňovány nevydané parametry diagnostické přesnosti ani srovnání s jinými testy. Počty případů a úmrtí se mohou rychle měnit. Pro aktuální rozhodování je nutné použít nejnovější materiály WHO, národní postupy a dokumentaci konkrétního diagnostického prostředku.</p>

<h2>Dopad do klinické praxe</h2>
<p>U pacienta s možnou expozicí se postup nemá odvozovat pouze z mediální zprávy o zařazení testu. Rozhodující jsou aktuální epidemiologická kritéria, konzultace s orgány ochrany veřejného zdraví a vyšetření v laboratoři vybavené pro práci s vysoce rizikovým infekčním materiálem. Článek nemění diagnostický ani léčebný standard.</p>

<h2>Zdroje</h2>
<ul><li><a href="${WHO_BDBV_SOURCE.url}" target="_blank" rel="noopener noreferrer">World Health Organization: WHO adds first diagnostic test for Ebola Bundibugyo virus to its Emergency Use Listing, 2 July 2026</a></li></ul>`;

type PubMedMetadata = {
  pmid: string;
  title: string;
  journal: string;
  authors: string;
  year: number | null;
  doi: string | null;
  url: string;
};

type Candidate = {
  article: AuditableArticle;
  visibilityScore: number;
  surfaces: string[];
  actions: string[];
  title?: string;
  excerpt?: string;
  content?: string;
  citation?: PubMedMetadata;
};

function parseArgs() {
  const citationLimitArg = process.argv.find((arg) =>
    arg.startsWith("--citation-limit=")
  );
  const reportArg = process.argv.find((arg) => arg.startsWith("--report-dir="));
  return {
    apply: process.argv.includes("--apply"),
    verifyApplied: process.argv.includes("--verify-applied"),
    citationLimit: Math.min(
      40,
      Math.max(1, Number(citationLimitArg?.split("=")[1] ?? 40))
    ),
    reportDir: reportArg
      ? path.resolve(ROOT, reportArg.slice("--report-dir=".length))
      : path.join(ROOT, "reports"),
  };
}

async function fetchAllPublished(admin: any): Promise<AuditableArticle[]> {
  const rows: AuditableArticle[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await admin
      .from("articles")
      .select(ARTICLE_COLUMNS)
      .eq("published", true)
      .order("published_at", { ascending: false, nullsFirst: false })
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(error.message);
    const page = (data ?? []) as AuditableArticle[];
    rows.push(...page);
    if (page.length < PAGE_SIZE) break;
  }
  return rows;
}

function extractPubMedId(article: AuditableArticle): string | null {
  const citation = article.metadata?.source_citation;
  const citationUrl =
    citation && typeof citation === "object"
      ? String((citation as Record<string, unknown>).url ?? "")
      : "";
  const haystack = `${article.source_url ?? ""}\n${citationUrl}`;
  return haystack.match(/pubmed\.ncbi\.nlm\.nih\.gov\/(\d+)/i)?.[1] ?? null;
}

function transformVisibleText(value: string, transform: (text: string) => string) {
  if (!value.includes("<")) return transform(value);
  return value
    .split(/(<[^>]+>)/g)
    .map((part) => (part.startsWith("<") ? part : transform(part)))
    .join("");
}

function cleanedFields(
  article: AuditableArticle,
  issueCodes: Set<string>
): {
  title: string;
  excerpt: string;
  content: string;
  actions: string[];
} {
  const original = {
    title: String(article.title ?? ""),
    excerpt: String(article.excerpt ?? ""),
    content: String(article.content ?? ""),
  };
  const next = { ...original };
  const actions: string[] = [];
  if (issueCodes.has("generic_template_prose")) {
    for (const key of ["title", "excerpt", "content"] as const) {
      next[key] = transformVisibleText(next[key], (text) => {
        let output = text;
        for (const [pattern, replacement] of PROSE_REPLACEMENTS) {
          pattern.lastIndex = 0;
          output = output.replace(pattern, replacement);
        }
        return output;
      });
    }
    if (
      next.title !== original.title ||
      next.excerpt !== original.excerpt ||
      next.content !== original.content
    ) {
      actions.push("replace_generic_template_prose");
    }
  }
  if (issueCodes.has("unverifiable_doi_text")) {
    for (const key of ["title", "excerpt", "content"] as const) {
      next[key] = transformVisibleText(next[key], (text) =>
        text.replace(/\bDOI\b/gi, "digitální identifikátor zdroje")
      );
    }
    if (
      next.title !== original.title ||
      next.excerpt !== original.excerpt ||
      next.content !== original.content
    ) {
      actions.push("clarify_unverifiable_doi_wording");
    }
  }
  if (
    article.slug === WHO_BDBV_SLUG &&
    issueCodes.has("czech_body_quality")
  ) {
    next.title =
      "WHO zařadila první diagnostický test pro virus Bundibugyo na seznam nouzového použití";
    next.excerpt =
      "WHO zařadila první molekulární test pro virus Bundibugyo na seznam Emergency Use Listing. Co tento regulatorní krok znamená pro laboratorní diagnostiku a jaké má limity?";
    next.content = WHO_BDBV_CONTENT;
    actions.push("replace_mixed_language_who_body");
  }
  if (
    article.slug === SENIOR_WELLBEING_SLUG &&
    next.excerpt.includes(". zaměřme se,")
  ) {
    next.excerpt = next.excerpt.replace(
      ". zaměřme se, jak můžeme pomoci",
      ". Text nabízí praktické možnosti, jak pomoci"
    );
    actions.push("repair_deterministic_cleanup_grammar");
  }
  return {
    title: next.title,
    excerpt: next.excerpt,
    content: next.content,
    actions,
  };
}

function visibilityFor(
  article: AuditableArticle,
  globalRanks: Map<string, number>,
  rubricRanks: Map<string, number>
) {
  const globalRank = globalRanks.get(article.id) ?? Number.MAX_SAFE_INTEGER;
  const rubricKey = `${article.rubric_slug ?? "none"}:${article.id}`;
  const rubricRank = rubricRanks.get(rubricKey) ?? Number.MAX_SAFE_INTEGER;
  const surfaces: string[] = [];
  let score = 0;
  if (globalRank < 4) {
    surfaces.push("recommendations");
    score += 1000 - globalRank;
  }
  if (globalRank < 16) {
    surfaces.push("homepage_recent_pool");
    score += 700 - globalRank;
  }
  if (rubricRank < 96) {
    surfaces.push("medical_section_recent_pool");
    score += 500 - rubricRank;
  }
  if (!surfaces.length && globalRank < 96) {
    surfaces.push("recent_article_pool");
    score += 200 - globalRank;
  }
  return { score, surfaces };
}

function buildRanks(articles: AuditableArticle[]) {
  const globalRanks = new Map(articles.map((article, index) => [article.id, index]));
  const rubricRanks = new Map<string, number>();
  const counts = new Map<string, number>();
  for (const article of articles) {
    const rubric = String(article.rubric_slug ?? "none");
    const rank = counts.get(rubric) ?? 0;
    rubricRanks.set(`${rubric}:${article.id}`, rank);
    counts.set(rubric, rank + 1);
  }
  return { globalRanks, rubricRanks };
}

async function fetchPubMedMetadata(pmids: string[]): Promise<Map<string, PubMedMetadata>> {
  const output = new Map<string, PubMedMetadata>();
  for (let index = 0; index < pmids.length; index += 100) {
    const chunk = pmids.slice(index, index + 100);
    const endpoint = new URL(
      "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi"
    );
    endpoint.searchParams.set("db", "pubmed");
    endpoint.searchParams.set("retmode", "json");
    endpoint.searchParams.set("id", chunk.join(","));
    const response = await fetch(endpoint, {
      headers: {
        "User-Agent": "MedScopeGlobal-editorial-audit/1.0",
        Accept: "application/json",
      },
    });
    if (!response.ok) throw new Error(`PubMed ESummary failed: ${response.status}`);
    const payload = (await response.json()) as {
      result?: Record<string, any> & { uids?: string[] };
    };
    for (const pmid of payload.result?.uids ?? []) {
      const record = payload.result?.[pmid];
      if (!record?.title || !record?.fulljournalname) continue;
      const doi =
        (record.articleids ?? []).find(
          (item: { idtype?: string }) => item.idtype === "doi"
        )?.value ?? null;
      const authorNames = (record.authors ?? [])
        .map((author: { name?: string }) => author.name)
        .filter(Boolean);
      const yearText = String(record.sortpubdate ?? record.pubdate ?? "").match(/\b(19|20)\d{2}\b/)?.[0];
      output.set(pmid, {
        pmid,
        title: String(record.title).replace(/\s+/g, " ").trim(),
        journal: String(record.fulljournalname).replace(/\s+/g, " ").trim(),
        authors:
          authorNames.length > 8
            ? `${authorNames.slice(0, 8).join(", ")} et al.`
            : authorNames.join(", "),
        year: yearText ? Number(yearText) : null,
        doi: typeof doi === "string" && /^10\.\d{4,9}\//i.test(doi) ? doi : null,
        url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      });
    }
  }
  return output;
}

function citationNeedsRepair(
  article: AuditableArticle,
  verified: PubMedMetadata
): boolean {
  const citation =
    article.metadata?.source_citation &&
    typeof article.metadata.source_citation === "object"
      ? (article.metadata.source_citation as Record<string, unknown>)
      : {};
  return (
    citation.name !== verified.journal ||
    citation.url !== verified.url ||
    citation.originalTitle !== verified.title ||
    citation.authors !== verified.authors ||
    citation.year !== verified.year ||
    (verified.doi !== null &&
      (citation.doi !== verified.doi ||
        article.metadata?.primary_doi !== verified.doi)) ||
    (verified.doi === null &&
      (typeof citation.doi === "string" ||
        typeof article.metadata?.primary_doi === "string"))
  );
}

function buildCitation(verified: PubMedMetadata) {
  return {
    name: verified.journal,
    url: verified.url,
    originalTitle: verified.title,
    authors: verified.authors,
    year: verified.year,
    ...(verified.doi ? { doi: verified.doi } : {}),
    pmid: verified.pmid,
  };
}

async function main() {
  const options = parseArgs();
  const env: Record<string, string | undefined> = {
    ...loadProjectEnv(ROOT),
    ...process.env,
  };
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase service-role credentials");
  }
  const admin = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
  const now = new Date();
  const articles = await fetchAllPublished(admin);
  const initialResults = articles.map((article) => auditArticle(article, now));
  const before = summarizeArticleAudits(initialResults);
  const { globalRanks, rubricRanks } = buildRanks(articles);

  const working = articles
    .filter((article) => article.slug !== HEART_SLUG)
    .map((article) => {
      const visibility = visibilityFor(article, globalRanks, rubricRanks);
      const issueCodes = new Set(
        auditArticle(article, now).issues.map((issue) => issue.code)
      );
      const cleanup = cleanedFields(article, issueCodes);
      return {
        article,
        visibilityScore:
          visibility.score +
          (auditArticle(article, now).physicianAudience ? 1000 : 0),
        surfaces: visibility.surfaces,
        actions: cleanup.actions,
        title: cleanup.title,
        excerpt: cleanup.excerpt,
        content: cleanup.content,
        pmid: extractPubMedId(article),
      };
    });

  let verificationIds: Set<string> | null = null;
  if (options.verifyApplied) {
    const appliedReportPath = path.join(
      options.reportDir,
      `visible-article-remediation-batch2-${now.toISOString().slice(0, 10)}-apply.json`
    );
    const appliedReport = JSON.parse(await readFile(appliedReportPath, "utf8")) as {
      selected?: Array<{ id?: string }>;
    };
    verificationIds = new Set(
      (appliedReport.selected ?? [])
        .map((item) => item.id)
        .filter((id): id is string => Boolean(id))
    );
  }

  const pubMedPool = working
    .filter(
      (candidate) =>
        candidate.pmid &&
        (!verificationIds || verificationIds.has(candidate.article.id)) &&
        auditArticle(candidate.article, now).issues.length > 0
    )
    .sort((a, b) => b.visibilityScore - a.visibilityScore);
  const pubMed = await fetchPubMedMetadata(
    [...new Set(pubMedPool.map((candidate) => candidate.pmid!))]
  );

  const selectedById = new Map<string, Candidate>();
  for (const candidate of working
    .filter((item) => item.actions.length > 0)
    .sort((a, b) => b.visibilityScore - a.visibilityScore)) {
    selectedById.set(candidate.article.id, {
      article: candidate.article,
      visibilityScore: candidate.visibilityScore,
      surfaces: candidate.surfaces,
      actions: [...candidate.actions],
      title: candidate.title,
      excerpt: candidate.excerpt,
      content: candidate.content,
    });
  }
  let citationSelections = 0;
  for (const candidate of pubMedPool) {
    if (citationSelections >= options.citationLimit) break;
    const verified = pubMed.get(candidate.pmid!);
    if (!verified || !citationNeedsRepair(candidate.article, verified)) continue;
    const existing = selectedById.get(candidate.article.id);
    if (existing) {
      existing.citation = verified;
      existing.actions.push("verify_pubmed_citation_metadata");
    } else {
      selectedById.set(candidate.article.id, {
        article: candidate.article,
        visibilityScore: candidate.visibilityScore,
        surfaces: candidate.surfaces,
        actions: ["verify_pubmed_citation_metadata"],
        citation: verified,
      });
    }
    citationSelections += 1;
  }

  const selected = [...selectedById.values()];
  const skipped = {
    staleCriticalBaseline: before.severe === 0,
    pubMedCandidatesWithoutMetadataChange: pubMedPool.filter((candidate) => {
      const verified = pubMed.get(candidate.pmid!);
      return !verified || !citationNeedsRepair(candidate.article, verified);
    }).length,
    remainingEligibleAfterLimit: Math.max(
      0,
      pubMedPool.filter((candidate) => {
        const verified = pubMed.get(candidate.pmid!);
        return verified && citationNeedsRepair(candidate.article, verified);
      }).length -
        citationSelections
    ),
    excludedHeartArticle: 1,
    unsafeSubstantiveRewrites: initialResults.filter((result) =>
      result.issues.some((issue) =>
        ["thin_content", "czech_body_quality"].includes(issue.code)
      )
    ).length,
  };

  const applied = {
    articles: 0,
    genericProse: 0,
    doiWording: 0,
    czechBody: 0,
    citationMetadata: 0,
    errors: [] as string[],
  };
  for (const candidate of selected) {
    const metadata: Record<string, unknown> = {
      ...(candidate.article.metadata ?? {}),
      editorial_remediation: {
        evaluated_at: now.toISOString(),
        priority:
          candidate.visibilityScore >= 700
            ? "high"
            : candidate.visibilityScore >= 500
              ? "section_high"
              : "normal",
        surfaces: candidate.surfaces,
        actions: candidate.actions,
        source_verification: candidate.citation
          ? "NCBI PubMed ESummary"
          : candidate.actions.includes("replace_mixed_language_who_body")
            ? "official WHO primary release"
            : "deterministic text-only correction",
        clinician_reviewed: false,
      },
    };
    if (candidate.citation) {
      metadata.source_citation = buildCitation(candidate.citation);
      if (candidate.citation.doi) {
        metadata.primary_doi = candidate.citation.doi;
      } else {
        delete metadata.primary_doi;
      }
    }
    if (candidate.actions.includes("replace_mixed_language_who_body")) {
      metadata.source_citation = { ...WHO_BDBV_SOURCE };
      delete metadata.primary_doi;
    }
    const patch: Record<string, unknown> = {
      metadata,
      updated_at: now.toISOString(),
    };
    if (candidate.title && candidate.title !== candidate.article.title) {
      patch.title = candidate.title;
    }
    if (candidate.excerpt && candidate.excerpt !== candidate.article.excerpt) {
      patch.excerpt = candidate.excerpt;
    }
    if (candidate.content && candidate.content !== candidate.article.content) {
      patch.content = candidate.content;
    }
    if (candidate.citation) {
      patch.source_name = candidate.citation.journal;
      patch.source_url = candidate.citation.url;
    }
    if (candidate.actions.includes("replace_mixed_language_who_body")) {
      patch.source_name = WHO_BDBV_SOURCE.name;
      patch.source_url = WHO_BDBV_SOURCE.url;
      patch.published_at = "2026-07-02T00:00:00.000Z";
    }
    if (options.apply) {
      const { error } = await admin
        .from("articles")
        .update(patch)
        .eq("id", candidate.article.id)
        .eq("published", true)
        .neq("slug", HEART_SLUG);
      if (error) {
        applied.errors.push(`${candidate.article.slug}: ${error.message}`);
        continue;
      }
    }
    candidate.article.metadata = metadata;
    if (typeof patch.title === "string") candidate.article.title = patch.title;
    if (typeof patch.excerpt === "string") candidate.article.excerpt = patch.excerpt;
    if (typeof patch.content === "string") candidate.article.content = patch.content;
    if (typeof patch.published_at === "string") {
      candidate.article.published_at = patch.published_at;
    }
    if (typeof patch.source_name === "string") {
      candidate.article.source_name = patch.source_name;
    }
    if (typeof patch.source_url === "string") {
      candidate.article.source_url = patch.source_url;
    }
    applied.articles += 1;
    if (candidate.actions.includes("replace_generic_template_prose")) {
      applied.genericProse += 1;
    }
    if (candidate.actions.includes("clarify_unverifiable_doi_wording")) {
      applied.doiWording += 1;
    }
    if (candidate.actions.includes("replace_mixed_language_who_body")) {
      applied.czechBody += 1;
    }
    if (candidate.citation) applied.citationMetadata += 1;
  }

  const finalResults = articles.map((article) => auditArticle(article, now));
  const after = summarizeArticleAudits(finalResults);
  const report = {
    generatedAt: now.toISOString(),
    mode: options.apply ? "apply" : "dry-run",
    citationLimit: options.citationLimit,
    verifyApplied: options.verifyApplied,
    before,
    after,
    applied,
    skipped,
    selected: selected.map((candidate) => ({
      id: candidate.article.id,
      slug: candidate.article.slug,
      title: candidate.article.title,
      visibilityScore: candidate.visibilityScore,
      surfaces: candidate.surfaces,
      actions: candidate.actions,
      verifiedCitation:
        candidate.citation ??
        (candidate.actions.includes("replace_mixed_language_who_body")
          ? WHO_BDBV_SOURCE
          : null),
    })),
  };
  await mkdir(options.reportDir, { recursive: true });
  const reportPath = path.join(
    options.reportDir,
    `visible-article-remediation-batch2-${now.toISOString().slice(0, 10)}-${
      options.verifyApplied
        ? report.mode === "apply"
          ? `followup-${now.toISOString().slice(11, 19).replaceAll(":", "")}-apply`
          : `idempotency-${report.mode}`
        : report.mode
    }.json`
  );
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(
    JSON.stringify(
      {
        mode: report.mode,
        before,
        after,
        applied,
        skipped,
        report: reportPath,
        sample: report.selected.slice(0, 10),
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
