import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ArticleBodyExpander } from "@/components/article-body-expander";

describe("ArticleBodyExpander", () => {
  it("shows the full public article body immediately without requiring client expansion", () => {
    render(
      <ArticleBodyExpander
        content="První věta veřejného článku. Druhá věta s dalším kontextem."
        summary="Stručné shrnutí pro veřejnost a studenty."
        specialization="Kardiologie"
        source="MedScopeGlobal"
        sourceUrl="https://medscopeglobal.com"
        tags={["prevence", "student"]}
        hasFullAccess
      />
    );

    expect(screen.queryByRole("button", { name: /celý článek/ })).not.toBeInTheDocument();
    expect(screen.getByText("Proč je téma důležité")).toBeInTheDocument();
    expect(screen.getByText("Praktické využití pro čtenáře")).toBeInTheDocument();
    expect(screen.getByText(/Druhá věta s dalším kontextem/)).toBeInTheDocument();
  });
});
