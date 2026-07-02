import { loadSectionPageData } from "../lib/content-engine/ai-content";

const checks = [
  {
    slug: "digital-health/ai",
    expectedTitle: "AI in medicine",
    expectedHref: "/digital-health/ai",
  },
  {
    slug: "digital-health/systems",
    expectedTitle: "Systems & data",
    expectedHref: "/digital-health/systems",
  },
  {
    slug: "digital-health/ai-in-medicine",
    expectedTitle: "AI in medicine",
    expectedHref: "/digital-health/ai-in-medicine",
  },
  {
    slug: "digital-health/systems-and-data",
    expectedTitle: "Systems & data",
    expectedHref: "/digital-health/systems-and-data",
  },
  {
    slug: "research/articles",
    expectedTitle: "Research articles",
    expectedHref: "/research/articles",
  },
  {
    slug: "professional/clinical-insights",
    expectedTitle: "Clinical insights",
    expectedHref: "/professional/clinical-insights",
  },
];

const failures: string[] = [];

async function main() {
  for (const check of checks) {
    const data = await loadSectionPageData(check.slug);

    if (!data) {
      failures.push(`${check.slug}: missing section metadata`);
      continue;
    }

    if (data.title !== check.expectedTitle) {
      failures.push(`${check.slug}: title ${JSON.stringify(data.title)} != ${JSON.stringify(check.expectedTitle)}`);
    }

    if (data.cta.href !== check.expectedHref) {
      failures.push(`${check.slug}: cta href ${data.cta.href} != ${check.expectedHref}`);
    }

    if (!Array.isArray(data.items) || data.items.length === 0) {
      failures.push(`${check.slug}: no fallback/content items returned`);
      continue;
    }

    console.log(`✓ ${check.slug}: ${data.title} -> ${data.cta.href} (${data.items.length} items)`);
  }

  if (failures.length > 0) {
    console.error("\nRoute validation failed:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log(`\n✅ ${checks.length} route checks passed`);
}

void main();
