import {
  createVendor,
  deleteVendor,
  listVendorCategories,
  listVendors,
  updateVendor,
} from "@/services/vendor-service";

describe("vendor-service", () => {
  it("lists vendors and categories", async () => {
    await expect(listVendors()).resolves.toHaveLength(3);
    await expect(listVendorCategories()).resolves.toHaveLength(3);
  });

  it("creates, updates, and deletes a vendor", async () => {
    const categories = await listVendorCategories();
    const created = await createVendor({
      name: "Velvet Strings",
      categoryId: categories[0]!.id,
      cost: 1800,
      status: "CONTACTED",
      bookingDate: "",
      followUpDate: "2026-04-12T10:00",
      depositAmount: 300,
      offerUrl: "https://example.com/velvet-offer",
      websiteUrl: "https://velvetstrings.example.com",
      instagramUrl: "https://instagram.com/velvetstrings",
      contactEmail: "hello@velvetstrings.com",
      contactPhone: "+48 600 333 333",
      notes: "Ceremony quartet",
    });

    expect(created.name).toBe("Velvet Strings");
    expect(created.status).toBe("CONTACTED");
    expect(created.depositAmount).toBe(300);

    const updated = await updateVendor(created.id, {
      cost: 2200,
      status: "BOOKED",
    });

    expect(updated.cost).toBe(2200);
    expect(updated.status).toBe("BOOKED");

    await deleteVendor(created.id);
    await expect(listVendors()).resolves.toHaveLength(3);
  });

  it("throws when updating a missing vendor", async () => {
    await expect(updateVendor("missing", { name: "Ghost" })).rejects.toThrow(
      "Vendor not found",
    );
  });
});
