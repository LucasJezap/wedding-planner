import { expect, test } from "@playwright/test";

test("seating planner loads tables", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Wejdź do planera" }).click();
  await expect(page).toHaveURL(/dashboard/);
  await page.goto("/seating");
  await expect(page.getByText("Rozplanuj salę")).toBeVisible();
  await expect(page.getByText("Garden Table")).toBeVisible();
  await expect(page.getByText("Goście bez stołu").first()).toBeVisible();
});
