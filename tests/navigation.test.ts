import { describe, expect, it } from "vitest";
import { footerSections, navItems } from "@/lib/site";
import { jobListings } from "@/lib/jobs";
import { knowledgeProducts } from "@/lib/knowledge-products";
import { medicalNavGroups, medicalSections } from "@/lib/medical-sections";

const internalPaths = [
  ...navItems.map((item) => item.href),
  ...footerSections.flatMap((section) => section.links.map((link) => link.href)),
  ...jobListings.map((job) => `/jobs/${job.slug}`),
  ...knowledgeProducts.map((product) => product.href)
];

describe("navigation integrity", () => {
  it("nav and footer links use internal paths without placeholders", () => {
    for (const path of internalPaths) {
      expect(path.startsWith("http")).toBe(false);
      expect(path).not.toContain("[");
      expect(path.length).toBeGreaterThan(0);
    }
  });

  it("includes new platform sections in navigation", () => {
    const labels = navItems.map((item) => item.href);
    expect(labels).toContain("/premium");
    expect(labels).toContain("/jobs");
    expect(labels).toContain("/institutions");
    expect(labels).toContain("/education");
  });

  it("includes required professional medical dropdown routes", () => {
    const paths = medicalSections.map((section) => section.href);
    expect(paths).toEqual(
      expect.arrayContaining([
        "/professional/clinical-insights",
        "/professional/case-reports",
        "/professional/guidelines",
        "/research/articles",
        "/research/clinical-studies",
        "/research/preprints",
        "/research/student-research",
        "/economics/costs-drg",
        "/economics/insurance",
        "/economics/market-analysis",
        "/digital-health/ehealth",
        "/digital-health/ai",
        "/digital-health/systems",
        "/policy/legislation",
        "/policy/compliance",
        "/policy/healthcare-law",
        "/pharma/new-drugs",
        "/pharma/drug-reviews",
        "/pharma/clinical-trials",
        "/news/daily",
        "/news/key-updates",
        "/events/conferences",
        "/events/webinars",
        "/events/reports"
      ])
    );
    expect(medicalNavGroups.map((group) => group.label)).toEqual(
      expect.arrayContaining(["HOME", "PROFESSIONAL", "RESEARCH", "CAREERS", "SUBSCRIBE"])
    );
  });
});
