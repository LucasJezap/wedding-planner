import { expect, test } from "@playwright/test";

test("planner can log out from the account section", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Wejdź do planera" }).click();
  await expect(page).toHaveURL(/dashboard/);
  await page.getByRole("button", { name: "Wyloguj" }).click();
  await expect(page).toHaveURL(/login/);
  await expect(page.getByText("Zaloguj się")).toBeVisible();
});
