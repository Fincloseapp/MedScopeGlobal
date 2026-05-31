import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ArticleBodyExpander } from "@/components/article-body-expander";

describe("ArticleBodyExpander", () => {
  it("shows the full public article body after clicking expand", () => {
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

    const trigger = screen.getByRole("button", { name: "Rozbalit celý článek" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Proč je téma důležité")).not.toBeInTheDocument();

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Proč je téma důležité")).toBeInTheDocument();
    expect(screen.getByText("Praktické využití pro čtenáře")).toBeInTheDocument();
    expect(screen.getByText(/Druhá věta s dalším kontextem/)).toBeInTheDocument();
  });
});
