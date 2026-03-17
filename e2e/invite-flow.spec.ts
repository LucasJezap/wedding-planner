import { expect, test } from "@playwright/test";

const ADMIN_EMAIL = "admin@example.com";
const DEMO_PASSWORD = "Avatar3232!";

test("admin can invite and activate a new planner account", async ({
  page,
}) => {
  const email = `invite-${Date.now()}@example.com`;

  await page.goto("/login");
  await page.getByPlaceholder("Adres email").fill(ADMIN_EMAIL);
  await page.getByPlaceholder("Hasło").fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "Wejdź do planera" }).click();
  await expect(page).toHaveURL(/dashboard/);
  await page.goto("/access");
  await expect(page).toHaveURL(/access/);

  await page.getByPlaceholder("Email").fill(email);
  await page.locator('form button[type="submit"]').first().click();

  const activationUrl = await page
    .locator("text=/activate\\?token=/")
    .textContent();
  expect(activationUrl).toBeTruthy();

  await page.goto(activationUrl!);
  await page.getByPlaceholder("Imię i nazwisko").fill("Nowy Świadek");
  await page.getByPlaceholder("Hasło", { exact: true }).fill(DEMO_PASSWORD);
  await page.getByPlaceholder("Powtórz hasło").fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "Aktywuj konto" }).click();

  await expect(page).toHaveURL(/login/);
  await page.getByPlaceholder("Adres email").fill(email);
  await page.getByPlaceholder("Hasło").fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "Wejdź do planera" }).click();

  await expect(page).toHaveURL(/dashboard/);
});
