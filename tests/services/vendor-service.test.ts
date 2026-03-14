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
      contactEmail: "hello@velvetstrings.com",
      contactPhone: "+48 600 333 333",
      notes: "Ceremony quartet",
    });

    expect(created.name).toBe("Velvet Strings");

    const updated = await updateVendor(created.id, {
      cost: 2200,
    });

    expect(updated.cost).toBe(2200);

    await deleteVendor(created.id);
    await expect(listVendors()).resolves.toHaveLength(3);
  });

  it("throws when updating a missing vendor", async () => {
    await expect(updateVendor("missing", { name: "Ghost" })).rejects.toThrow(
      "Vendor not found",
    );
  });
});
