import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ArticleAccessDisclosure } from "@/components/article-access-disclosure";

describe("ArticleAccessDisclosure", () => {
  it("expands and collapses the public/student access explanation on click", () => {
    render(
      <ArticleAccessDisclosure
        accessLabel="Volně dostupné"
        audienceLabel="Laik a student"
        message="Článek je dostupný všem návštěvníkům v úrovni veřejnost / student."
        hasFullAccess
        requiresSubscription={false}
      />
    );

    const trigger = screen.getByRole("button", { name: /Volně dostupné/ });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText(/Tento článek je otevřený bez přihlášení/)).not.toBeInTheDocument();

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(/Tento článek je otevřený bez přihlášení/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Další veřejné a studentské články" })).toHaveAttribute(
      "href",
      "/articles?audience=laik-student"
    );

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText(/Tento článek je otevřený bez přihlášení/)).not.toBeInTheDocument();
  });
});
