import { describe, expect, it } from "vitest";
import { medicalSources, getSourcesBySpecialization } from "@/lib/portal/sources";
import { medicalSpecializations } from "@/lib/portal/specializations";

describe("medical sources", () => {
  it("includes required Czech sources", () => {
    const names = medicalSources.map((s) => s.name);
    expect(names.some((n) => n.includes("Purkyně") || n.includes("JEP"))).toBe(true);
    expect(names.some((n) => n.includes("Karlovy"))).toBe(true);
    expect(names.some((n) => n.includes("Masaryk"))).toBe(true);
    expect(names.some((n) => n.includes("Palackého"))).toBe(true);
    expect(names.some((n) => n.includes("SÚKL"))).toBe(true);
    expect(names.some((n) => n.includes("ÚZIS"))).toBe(true);
  });

  it("includes required international sources", () => {
    const ids = medicalSources.map((s) => s.id);
    expect(ids).toContain("pubmed");
    expect(ids).toContain("who");
    expect(ids).toContain("esc");
    expect(ids).toContain("eular");
    expect(ids).toContain("nejm");
    expect(ids).toContain("lancet");
    expect(ids).toContain("bmj");
  });

  it("maps sources to medical specializations", () => {
    expect(getSourcesBySpecialization("Kardiologie").some((s) => s.id === "esc")).toBe(true);
    expect(getSourcesBySpecialization("Revmatologie").some((s) => s.id === "eular")).toBe(true);
  });

  it("covers all required medical fields", () => {
    const required = [
      "Všeobecné lékařství",
      "Praktický lékař",
      "Revmatologie",
      "Kardiologie",
      "Klinický výzkum",
      "Interní medicína",
      "Neurologie",
      "Diabetologie",
      "Onkologie",
      "Gastroenterologie"
    ];
    expect(medicalSpecializations).toEqual(required);
  });
});
