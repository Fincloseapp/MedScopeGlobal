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

test("read more opens a corresponding article detail", async ({ page }) => {
  await page.goto("/articles?audience=laik-student");
  await page.getByRole("link", { name: "Číst více / Read more" }).first().click();
  await expect(page.locator("article h1")).toBeVisible();
  await expect(page.getByText("Volně dostupné")).toBeVisible();
});

test("news route aliases resolve instead of 404", async ({ page }) => {
  await page.goto("/news");
  await expect(page.getByRole("heading", { name: "Medicínské poznatky podle specializace." })).toBeVisible();
});
