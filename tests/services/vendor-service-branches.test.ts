import { vi } from "vitest";

import * as repositoryModule from "@/db/repositories";
import { listVendors } from "@/services/vendor-service";

describe("vendor-service branch coverage", () => {
  it("uses fallback labels when optional relations are missing", async () => {
    const spy = vi.spyOn(repositoryModule, "getRepository").mockReturnValue({
      getState: vi.fn(),
      getUserByEmail: vi.fn(),
      getWedding: vi.fn(),
      listGuests: vi.fn(),
      listContacts: vi.fn().mockResolvedValue([]),
      listNotes: vi.fn().mockResolvedValue([]),
      listTables: vi.fn(),
      listSeats: vi.fn(),
      listVendors: vi.fn().mockResolvedValue([
        {
          id: "vendor-loose",
          weddingId: "wedding",
          categoryId: "missing-category",
          name: "Loose Vendor",
          cost: 500,
          createdAt: "2026-01-01",
          updatedAt: "2026-01-01",
        },
      ]),
      listVendorCategories: vi.fn().mockResolvedValue([]),
      listBudgetCategories: vi.fn(),
      listExpenses: vi.fn(),
      listTasks: vi.fn(),
      listTimelineEvents: vi.fn(),
      listRsvps: vi.fn(),
      createGuest: vi.fn(),
      updateGuest: vi.fn(),
      deleteGuest: vi.fn(),
      createVendor: vi.fn(),
      updateVendor: vi.fn(),
      deleteVendor: vi.fn(),
      createTask: vi.fn(),
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
      updateBudgetCategory: vi.fn(),
      createExpense: vi.fn(),
      updateExpense: vi.fn(),
      deleteExpense: vi.fn(),
      createTimelineEvent: vi.fn(),
      updateTimelineEvent: vi.fn(),
      deleteTimelineEvent: vi.fn(),
      assignGuestToSeat: vi.fn(),
      upsertRsvp: vi.fn(),
    } as never);

    const vendors = await listVendors();
    expect(vendors[0]).toMatchObject({
      categoryName: "Uncategorized",
      contactEmail: "",
      contactPhone: "",
      notes: "",
    });

    spy.mockRestore();
  });
});
