import { expect, test } from "@playwright/test";

test("planner can create a task", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Wejdź do planera" }).click();
  await expect(page).toHaveURL(/dashboard/);
  await page.goto("/tasks");
  await expect(page.getByText("Prowadź plan do przodu")).toBeVisible();
  await page.getByPlaceholder("Tytuł zadania").fill("Playwright task");
  await page.getByPlaceholder("Opis").fill("Automated follow-up");
  await page.getByRole("button", { name: "Utwórz zadanie" }).click();
  await expect(page.getByText("Playwright task")).toBeVisible();
});
