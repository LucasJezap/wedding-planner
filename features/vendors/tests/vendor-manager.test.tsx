import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { VendorManager } from "@/features/vendors/components/vendor-manager";
import { apiClient } from "@/lib/api-client";
import { listVendorCategories, listVendors } from "@/services/vendor-service";

vi.mock("@/lib/api-client", () => ({
  apiClient: vi.fn(),
}));

describe("VendorManager", () => {
  it("creates a vendor", async () => {
    const categories = await listVendorCategories();
    const vendors = await listVendors();
    vi.mocked(apiClient).mockResolvedValueOnce({
      ...vendors[0]!,
      id: "vendor-new",
      name: "Velvet Studio",
      status: "CONTACTED",
      depositAmount: 500,
      followUpDate: "2026-04-12T10:00:00.000Z",
      offerUrl: "https://example.com/offer",
      websiteUrl: "https://example.com",
      instagramUrl: "https://instagram.com/example",
    });

    render(
      <VendorManager
        initialVendors={vendors}
        categories={categories}
        canViewPricing
        viewerRole="ADMIN"
      />,
    );

    const user = userEvent.setup();
    await user.type(
      screen.getByPlaceholderText("Nazwa usługodawcy"),
      "Velvet Studio",
    );
    await user.type(
      screen.getByPlaceholderText("Email kontaktowy"),
      "velvet@example.com",
    );
    await user.type(
      screen.getByPlaceholderText("Telefon kontaktowy"),
      "555-123",
    );
    await user.click(
      screen.getByRole("button", { name: "Utwórz usługodawcę" }),
    );

    await waitFor(() => expect(apiClient).toHaveBeenCalled());
    expect(screen.getByText("Velvet Studio")).toBeInTheDocument();
  });

  it("renders vendor list without edit controls for witness accounts", async () => {
    render(
      <VendorManager
        initialVendors={await listVendors()}
        categories={await listVendorCategories()}
        canViewPricing={false}
        viewerRole="WITNESS"
      />,
    );

    expect(
      screen.queryByRole("button", { name: "Utwórz usługodawcę" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Edytuj" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("5 000,00 zł")).not.toBeInTheDocument();
  });
});
