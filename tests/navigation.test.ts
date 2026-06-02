import { describe, expect, it } from "vitest";
import { footerSections, navItems } from "@/lib/site";
import { jobListings } from "@/lib/jobs";
import { knowledgeProducts } from "@/lib/knowledge-products";

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

  it("includes reader-focused sections in navigation", () => {
    const hrefs = navItems.map((item) => item.href);
    expect(hrefs).toContain("/articles");
    expect(hrefs).toContain("/pro-koho");
    expect(hrefs).toContain("/medicina");
    expect(hrefs).toContain("/premium");
    expect(hrefs).toContain("/education");
  });
});
