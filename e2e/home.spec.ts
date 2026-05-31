import { expect, test } from "@playwright/test";

test("homepage has value proposition and trust strip", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".hero .eyebrow")).toContainText("Prémiová medicínská");
  await expect(page.locator(".trust-strip")).toBeVisible();
  await expect(page.locator(".hero-actions").getByRole("link", { name: "Premium", exact: true })).toBeVisible();
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

test("public student article access panel expands on click", async ({ page }) => {
  await page.goto("/articles?audience=laik-student");
  await page.getByRole("link", { name: "Číst více / Read more" }).first().click();

  const articleTrigger = page.getByRole("button", { name: "Rozbalit celý článek" });
  await expect(articleTrigger).toHaveAttribute("aria-expanded", "false");
  await articleTrigger.click();
  await expect(page.getByRole("button", { name: "Sbalit celý článek" })).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("heading", { name: "Proč je téma důležité" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Praktické využití pro čtenáře" })).toBeVisible();

  const trigger = page.getByRole("button", { name: /Volně dostupné/ });
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await trigger.click();

  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByText("Tento článek je otevřený bez přihlášení.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Další veřejné a studentské články" })).toBeVisible();
});

test("news route aliases resolve instead of 404", async ({ page }) => {
  await page.goto("/news");
  await expect(page.getByRole("heading", { name: "Medicínské poznatky podle specializace." })).toBeVisible();
});

test("jobs index and detail work", async ({ page }) => {
  await page.goto("/jobs");
  await expect(page.getByRole("heading", { name: "Pracovní příležitosti ve zdravotnictví a výzkumu" })).toBeVisible();
  await page.getByRole("link", { name: "Detail pozice" }).first().click();
  await expect(page.locator("article h1")).toBeVisible();
  await expect(page.getByRole("link", { name: "Odpovědět na pozici" })).toBeVisible();
});

test("institutions and premium pages load", async ({ page }) => {
  await page.goto("/institutions");
  await expect(page.getByRole("heading", { name: "Enterprise přístup pro zdravotnické a vzdělávací organizace" })).toBeVisible();
  await page.goto("/premium");
  await expect(page.getByRole("heading", { name: "Premium vrstva pro klinickou praxi a rozhodování" })).toBeVisible();
});

test("footer platform links resolve", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Kariéra / nábor" }).click();
  await expect(page).toHaveURL(/\/jobs/);
});
