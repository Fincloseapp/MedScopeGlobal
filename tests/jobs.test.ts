import { describe, expect, it } from "vitest";
import { filterJobs, getJobBySlug, jobListings } from "@/lib/jobs";

describe("jobs", () => {
  it("returns featured jobs and filters by specialization", () => {
    const cardiology = filterJobs({ specialization: "Kardiologie" });
    expect(cardiology.length).toBeGreaterThan(0);
    expect(cardiology.every((job) => job.specialization === "Kardiologie")).toBe(true);
  });

  it("resolves job by slug", () => {
    const job = getJobBySlug(jobListings[0].slug);
    expect(job?.title).toBeTruthy();
  });

  it("filters by query", () => {
    const results = filterJobs({ query: "internista" });
    expect(results.some((job) => job.title.toLowerCase().includes("internist"))).toBe(true);
  });
});
