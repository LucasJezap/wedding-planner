import { expect, test } from "@playwright/test";

test("public site stays open without login and admin routes stay protected", async ({
  page,
}) => {
  await page.goto("/public");
  await expect(page.getByRole("heading", { name: "Plan dnia" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Panel admina" })).toBeVisible();

  await page.goto("/dashboard");
  await expect(page).toHaveURL(/login/);
});

test("logged-in admin can return from the public site to the dashboard", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Wejdź do planera" }).click();
  await expect(page).toHaveURL(/dashboard/);

  await page.goto("/public");
  await expect(
    page.getByRole("link", { name: "Wróć do panelu" }),
  ).toBeVisible();
});
