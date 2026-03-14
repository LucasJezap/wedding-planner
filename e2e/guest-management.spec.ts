import { expect, test } from "@playwright/test";

test("planner can create a guest", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Wejdź do planera" }).click();
  await expect(page).toHaveURL(/dashboard/);
  await page.goto("/guests");
  await expect(
    page.getByRole("heading", { name: "Zadbaj o doświadczenie gości" }),
  ).toBeVisible();
  await page.getByPlaceholder("Imię").fill("Playwright");
  await page.getByPlaceholder("Nazwisko").fill("Guest");
  await page.getByPlaceholder("Email").fill("playwright@example.com");
  await page.getByPlaceholder("Telefon").fill("+48 500 123 123");
  await page.getByRole("button", { name: "Utwórz gościa" }).click();
  await expect(page.getByText("Playwright Guest")).toBeVisible();
});
