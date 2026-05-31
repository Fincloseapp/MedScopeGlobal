import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ArticleBodyExpander } from "@/components/article-body-expander";

describe("ArticleBodyExpander", () => {
  it("shows the full public article body immediately and can collapse and expand", () => {
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

    const collapseTrigger = screen.getByRole("button", { name: "Sbalit celý článek" });
    expect(collapseTrigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Proč je téma důležité")).toBeInTheDocument();
    expect(screen.getByText("Praktické využití pro čtenáře")).toBeInTheDocument();
    expect(screen.getByText(/Druhá věta s dalším kontextem/)).toBeInTheDocument();

    fireEvent.click(collapseTrigger);

    const expandTrigger = screen.getByRole("button", { name: "Rozbalit celý článek" });
    expect(expandTrigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Proč je téma důležité")).not.toBeInTheDocument();

    fireEvent.click(expandTrigger);

    expect(screen.getByRole("button", { name: "Sbalit celý článek" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Proč je téma důležité")).toBeInTheDocument();
  });
});
