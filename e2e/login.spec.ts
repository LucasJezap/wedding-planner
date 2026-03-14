import { expect, test } from "@playwright/test";

test("planner can sign in", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Wejdź do planera" }).click();
  await expect(page).toHaveURL(/dashboard/);
  await expect(page.getByText("Centrum dowodzenia ślubem")).toBeVisible();
});
