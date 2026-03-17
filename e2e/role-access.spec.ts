import { expect, test } from "@playwright/test";

const WITNESS_EMAIL = "witness@example.com";
const DEMO_PASSWORD = "Avatar3232!";

test("witness account sees limited navigation and read-only vendor area", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByPlaceholder("Adres email").fill(WITNESS_EMAIL);
  await page.getByPlaceholder("Hasło").fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "Wejdź do planera" }).click();

  await expect(page).toHaveURL(/dashboard/);
  await expect(page.getByRole("link", { name: "Budżet" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Import" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Panel Admina" })).toHaveCount(0);

  await page.goto("/vendors");
  await expect(
    page.getByRole("button", { name: "Utwórz usługodawcę" }),
  ).toHaveCount(0);
  await expect(page.locator("text=/zł/")).toHaveCount(0);

  await page.goto("/tasks");
  await expect(
    page.getByRole("button", { name: "Utwórz zadanie" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Edytuj" })).toHaveCount(0);
});
