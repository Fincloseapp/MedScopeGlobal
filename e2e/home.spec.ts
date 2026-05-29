import { expect, test } from "@playwright/test";

test("homepage has hero CTA and mobile-safe navigation", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".hero .eyebrow")).toHaveText("Globální platforma pro sdílení medicínských poznatků");
  await expect(page.getByLabel("Hlavní navigace").getByRole("link", { name: "Články" })).toBeVisible();
});

test("articles filter empty state is explicit", async ({ page }) => {
  await page.goto("/articles?q=not-present");
  await expect(page.getByText("Žádné články neodpovídají filtru.")).toBeVisible();
});
