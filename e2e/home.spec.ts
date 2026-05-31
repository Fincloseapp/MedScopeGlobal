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

  await expect(page.getByRole("heading", { name: "Celý článek" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Proč je téma důležité" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Praktické využití pro čtenáře" })).toBeVisible();

  const trigger = page.getByRole("link", { name: /Článek je dostupný všem návštěvníkům/ });
  await expect(trigger).toHaveAttribute("href", /#full-article$/);
  await trigger.click();
  await expect(page).toHaveURL(/#full-article$/);
  await expect(page.getByText("Tento článek je otevřený bez přihlášení.")).toBeVisible();
});

for (const article of [
  {
    title: "Kardiologie veřejnost/student",
    slug: "kardiologie-prevence-cesko-001",
    expectedTag: "prevence"
  },
  {
    title: "Digitální zdraví veřejnost/student",
    slug: "digitalni-zdravi-ai-cesko-005",
    expectedTag: "AI"
  },
  {
    title: "Neurologie veřejnost/student",
    slug: "neurologie-diagnostika-cesko-009",
    expectedTag: "diagnostika"
  }
]) {
  test(`lay reader can expand full article from access message: ${article.title}`, async ({ page }) => {
    await page.goto(`/articles/${article.slug}`);

    const trigger = page.getByRole("link", { name: /Článek je dostupný všem návštěvníkům/ });
    await expect(trigger).toHaveAttribute("href", /#full-article$/);
    await trigger.click();

    await expect(page).toHaveURL(new RegExp(`${article.slug}#full-article$`));
    await expect(page.locator("#full-article").getByRole("heading", { name: "Celý článek" })).toBeVisible();
    await expect(page.locator("#full-article").getByText(new RegExp(article.expectedTag, "i")).first()).toBeVisible();
  });
}

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
