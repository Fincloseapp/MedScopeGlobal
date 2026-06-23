import { fetchPubMedItems } from "@/lib/ingestion/pubmed";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { extractWithAi, placeholderImageUrl, slugifyV4c } from "@/lib/v4c/ai-extract";
import { CZ_UNIVERSITIES, LEGISLATION_SOURCES } from "@/lib/v4c/sources";
import { V22_DIGITAL_HEALTH_SOURCES } from "@/lib/v22/digital-health/sources";

export async function runV4cDailyIngest() {
  const admin = createServiceRoleClient();
  const results: Record<string, number> = {};

  // Studie — PubMed rheumatology trials
  let studiesAdded = 0;
  try {
    const items = await fetchPubMedItems(
      "rheumatology[MeSH] AND (randomized controlled trial[pt] OR clinical trial[pt])",
      "Rheumatology",
      8
    );
    for (const item of items) {
      const slug = slugifyV4c(item.title);
      const { data: existing } = await admin.from("studies").select("id").eq("slug", slug).maybeSingle();
      if (existing) continue;

      const ai = await extractWithAi("studie", {
        title: item.title,
        raw: item.description,
        sourceUrl: item.link,
        sourceName: item.sourceName,
      });

      const { error } = await admin.from("studies").insert({
        title: (ai.title as string) ?? item.title,
        slug,
        abstract: (ai.summary as string) ?? item.description,
        summary: (ai.summary as string) ?? item.description,
        pubmed_id: item.link.split("/").pop(),
        journal: item.sourceName,
        published_date: new Date().toISOString().slice(0, 10),
        source_url: item.link,
        source_name: item.sourceName,
        region: "world",
        specialty: "rheumatology",
        image_url: placeholderImageUrl(item.title),
        ai_metadata: ai,
        published: true,
      });
      if (!error) studiesAdded++;
    }
  } catch (e) {
    console.error("v4c studies ingest", e);
  }
  results.studies = studiesAdded;

  // Drug news — SÚKL / EMA / FDA živé feedy
  let drugsAdded = 0;
  try {
    const { runDrugFeedIngest } = await import("@/lib/v4c/drug-feed-ingest");
    const drugResult = await runDrugFeedIngest({ maxItems: 36 });
    drugsAdded = drugResult.inserted;
    if (drugResult.errors.length) {
      console.error("v4c drug feed ingest", drugResult.errors.slice(0, 5));
    }
  } catch (e) {
    console.error("v4c drug feed ingest", e);
  }
  results.drug_news = drugsAdded;

  // Legislativa
  let legAdded = 0;
  for (const src of LEGISLATION_SOURCES) {
    const title = `${src.name} — legislativní novinka`;
    const slug = slugifyV4c(`leg-${src.source}-${Date.now()}`);
    const ai = await extractWithAi("legislativa", {
      title,
      raw: src.url,
      sourceUrl: src.url,
      sourceName: src.name,
    });
    const { error } = await admin.from("legislation_items").insert({
      title: (ai.title as string) ?? title,
      slug,
      category: "novinky",
      source: src.source,
      summary: (ai.summary as string) ?? `Přehled z ${src.name}`,
      source_url: src.url,
      published_date: new Date().toISOString().slice(0, 10),
      image_url: placeholderImageUrl(src.source),
      ai_metadata: ai,
      published: true,
    });
    if (!error) legAdded++;
  }
  results.legislation = legAdded;

  // Digital health — multi-source AI articles (CZ priority)
  let dhAdded = 0;
  const dhSources = V22_DIGITAL_HEALTH_SOURCES.filter((s) => s.tier === "cz").slice(0, 4);
  for (const src of dhSources) {
    const topic = src.topics[0] ?? "eHealth";
    const dhTitle = `${src.name} — ${topic}`;
    const slug = slugifyV4c(`dh-${src.id}-${topic}`);
    const { data: ex } = await admin.from("digital_health_items").select("id").eq("slug", slug).maybeSingle();
    if (ex) continue;

    const dhAi = await extractWithAi("digital-health", {
      title: dhTitle,
      raw: `Téma: ${topic}. Zdroje: ${src.name} ${src.url}. Kontext: telemedicína, NZIS, AI, eZdraví, regulace SÚKL.`,
      sourceUrl: src.url,
      sourceName: src.name,
    });
    const { error: dhErr } = await admin.from("digital_health_items").insert({
      title: (dhAi.title as string) ?? dhTitle,
      slug,
      topic: (dhAi.topic as string) ?? topic,
      summary: (dhAi.summary as string) ?? `Odborný přehled: ${topic}`,
      body: [
        dhAi.whatIsCs,
        dhAi.trendsCs,
        dhAi.clinicalImpactCs,
      ]
        .filter(Boolean)
        .join("\n\n"),
      source_url: src.url,
      source_name: src.name,
      image_url: placeholderImageUrl(`dh-${src.id}`),
      ai_metadata: { ...dhAi, sources: dhAi.sources ?? [{ name: src.name, url: src.url, tier: src.tier }] },
      published: true,
      published_date: new Date().toISOString().slice(0, 10),
    });
    if (!dhErr) dhAdded++;
  }
  results.digital_health = dhAdded;

  // University news
  let uniAdded = 0;
  for (const uni of CZ_UNIVERSITIES.slice(0, 4)) {
    const title = `${uni.name} — výzkumná novinka`;
    const slug = slugifyV4c(`${uni.name}-${title}`);
    const ai = await extractWithAi("novinky", {
      title,
      raw: uni.url,
      sourceUrl: uni.url,
      sourceName: uni.name,
    });
    const { error } = await admin.from("university_news").insert({
      title: (ai.title as string) ?? title,
      slug,
      tag: "univerzity",
      region: "cz",
      university: uni.name,
      summary: (ai.summary as string) ?? `Novinka z ${uni.name}`,
      source_url: uni.url,
      source_name: uni.name,
      image_url: placeholderImageUrl(uni.name),
      ai_metadata: ai,
      published: true,
      published_date: new Date().toISOString().slice(0, 10),
    });
    if (!error) uniAdded++;
  }
  results.university_news = uniAdded;

  await admin.from("v4c_ingestion_runs").insert({
    module: "daily_all",
    status: "ok",
    items_added: Object.values(results).reduce((a, b) => a + b, 0),
    details: results,
  });

  await refreshHomepageCurated(admin);

  return results;
}

async function refreshHomepageCurated(admin: ReturnType<typeof createServiceRoleClient>) {
  await admin.from("homepage_curated").delete().eq("active", true);

  const picks: { slot: string; table: string; hrefPrefix: string; type: string }[] = [
    { slot: "slider", table: "studies", hrefPrefix: "/studie", type: "study" },
    { slot: "studie", table: "studies", hrefPrefix: "/studie", type: "study" },
    { slot: "leky", table: "drug_news", hrefPrefix: "/leky/novinky", type: "drug_news" },
    { slot: "legislativa", table: "legislation_items", hrefPrefix: "/legislativa", type: "legislation" },
    { slot: "digital_health", table: "digital_health_items", hrefPrefix: "/digital-health", type: "digital_health" },
    { slot: "novinky", table: "university_news", hrefPrefix: "/novinky", type: "university_news" },
  ];

  let order = 0;
  for (const pick of picks) {
    const { data } = await admin
      .from(pick.table)
      .select("id, title, summary, image_url, slug")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(pick.slot === "slider" ? 5 : 3);

    for (const row of data ?? []) {
      const r = row as { id: string; title: string; summary?: string; image_url?: string; slug?: string };
      const href =
        pick.table === "studies"
          ? `${pick.hrefPrefix}/${r.slug ?? r.id}`
          : pick.table === "legislation_items"
            ? `/legislativa/${r.slug ?? r.id}`
            : pick.table === "digital_health_items"
              ? `/digital-health/${r.slug ?? r.id}`
              : pick.table === "university_news"
                ? `/novinky/univerzity/${r.slug ?? r.id}`
                : pick.table === "drug_news"
                  ? `/leky/novinky/${r.slug ?? r.id}`
                  : `${pick.hrefPrefix}/${r.slug ?? r.id}`;
      await admin.from("homepage_curated").insert({
        slot: pick.slot,
        entity_type: pick.type,
        entity_id: r.id,
        title: r.title,
        href,
        image_url: r.image_url,
        excerpt: r.summary?.slice(0, 160),
        sort_order: order++,
        active: true,
      });
    }
  }
}
