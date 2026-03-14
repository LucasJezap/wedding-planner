import { expect, test } from "@playwright/test";

test("planner can switch the interface language", async ({ page }) => {
  await page.goto("/login");
  await expect(
    page.getByRole("heading", { name: "Zaloguj się" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Przełącz język EN" }).click();
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
});
