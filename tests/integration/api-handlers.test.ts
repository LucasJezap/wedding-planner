import { getDashboardHandler } from "@/server/api/dashboard-handler";
import {
  createGuestHandler,
  deleteGuestHandler,
  getGuestsHandler,
} from "@/server/api/guest-handler";
import {
  getBudgetHandler,
  updateBudgetCategoryHandler,
} from "@/server/api/budget-handler";
import { submitPublicRsvpHandler } from "@/server/api/public-handler";

describe("API handlers", () => {
  it("returns dashboard data", async () => {
    const data = await getDashboardHandler();
    expect(data.taskStats.total).toBe(3);
  });

  it("manages guests through the handler layer", async () => {
    const created = await createGuestHandler({
      firstName: "Luna",
      lastName: "West",
      side: "FRIENDS",
      rsvpStatus: "PENDING",
      dietaryRestrictions: [],
      paymentCoverage: "FULL",
      transportToVenue: false,
      transportFromVenue: false,
      email: "luna@example.com",
      phone: "+48 777 777 777",
      notes: "Integration guest",
    });

    expect(created.fullName).toBe("Luna West");
    expect((await getGuestsHandler()).length).toBe(7);

    await deleteGuestHandler(created.id);
    expect((await getGuestsHandler()).length).toBe(6);
  });

  it("updates budget categories through the handler layer", async () => {
    const budget = await getBudgetHandler();
    const category = budget.categories[0]!;
    const updated = await updateBudgetCategoryHandler(category.id, {
      name: category.name,
      plannedAmount: category.plannedAmount + 300,
      color: category.color,
      notes: category.notes,
    });
    expect(updated.plannedAmount).toBe(category.plannedAmount + 300);
  });

  it("submits a public RSVP through the handler layer", async () => {
    const guests = await getGuestsHandler();
    const guest = guests[0]!;
    const updated = await submitPublicRsvpHandler({
      token: guest.rsvpToken,
      status: "ATTENDING",
      guestCount: 1,
    });
    expect(updated.guest.status).toBeDefined();
  });
});
