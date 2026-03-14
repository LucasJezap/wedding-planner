import { expect, test } from "@playwright/test";
import * as XLSX from "xlsx";

test("planner can upload a guest workbook", async ({ page }) => {
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.json_to_sheet([
    {
      FirstName: "Playwright",
      LastName: "Import",
      Side: "FRIENDS",
      Email: "import@example.com",
      Phone: "123456",
      DietaryRestrictions: "",
      Notes: "Imported by e2e",
      InvitationReceived: "true",
      PaymentCoverage: "FULL",
      TransportToVenue: "false",
      TransportFromVenue: "false",
    },
  ]);
  XLSX.utils.book_append_sheet(workbook, sheet, "Guests");
  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

  await page.goto("/login");
  await page.getByRole("button", { name: "Wejdź do planera" }).click();
  await expect(page).toHaveURL(/dashboard/);
  await page.goto("/import");
  await expect(page.getByText("Wczytaj gości z Excela")).toBeVisible();
  await page.locator('input[type="file"]').setInputFiles({
    name: "guests.xlsx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    buffer,
  });

  await expect(page.getByText("Mapowanie kolumn")).toBeVisible();
});
