import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ArticleAccessDisclosure } from "@/components/article-access-disclosure";

describe("ArticleAccessDisclosure", () => {
  it("links public/student access message directly to the monitored source article", () => {
    render(
      <ArticleAccessDisclosure
        accessLabel="Volně dostupné"
        audienceLabel="Laik a student"
        message="Článek je dostupný všem návštěvníkům v úrovni veřejnost / student."
        hasFullAccess
        requiresSubscription={false}
        articleTargetId="full-article"
        source="MedScopeGlobal source"
        sourceUrl="https://source.example/article"
      />
    );

    const link = screen.getByRole("link", { name: /Článek je dostupný všem návštěvníkům/ });
    expect(link).toHaveAttribute("href", "https://source.example/article");
    expect(link).toHaveAttribute("target", "_blank");
    expect(screen.getByRole("link", { name: "MedScopeGlobal source" })).toHaveAttribute(
      "href",
      "https://source.example/article"
    );
    expect(screen.getByText(/Tento článek je otevřený bez přihlášení/)).toBeInTheDocument();
  });
});
