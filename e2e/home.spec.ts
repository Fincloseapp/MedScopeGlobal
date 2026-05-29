import { expect, test } from "@playwright/test";
test("homepage has hero CTA and mobile-safe navigation", async ({ page }) => { await page.goto("/"); await expect(page.getByText("Globální platforma pro sdílení medicínských poznatků")).toBeVisible(); await expect(page.getByRole("link", { name: /Články/ })).toBeVisible(); });
test("articles filter empty state is explicit", async ({ page }) => { await page.goto("/articles?q=not-present"); await expect(page.getByText("Žádné články neodpovídají filtru.")).toBeVisible(); });
