import { readFileSync } from "node:fs";
import { join } from "node:path";

import { buildSeedFromRealPlanDocument } from "@/lib/real-plan-seed";
import { DEMO_CREDENTIALS } from "@/lib/planner-seed";

describe("real-plan-seed", () => {
  it("builds the Docker seed only from real-plan.md data", () => {
    const document = readFileSync(
      join(process.cwd(), "docs", "real-plan.md"),
      "utf8",
    );
    const state = buildSeedFromRealPlanDocument(document);

    expect(state.users[0]?.email).toBe(DEMO_CREDENTIALS.email);
    expect(state.wedding.title).toBe(
      `${state.wedding.coupleOneName} & ${state.wedding.coupleTwoName}`,
    );
    expect(state.budgetCategories.length).toBeGreaterThanOrEqual(18);
    expect(state.tasks.length).toBeGreaterThanOrEqual(40);
    expect(state.weddingTables.length).toBe(11);
    expect(state.seats.length).toBeGreaterThanOrEqual(60);
    expect(state.guests.length).toBeGreaterThanOrEqual(80);
    expect(
      state.guests.some(
        (guest, index) =>
          index === 0 && guest.side === "BRIDE" && guest.lastName.length > 0,
      ),
    ).toBe(true);
    expect(
      state.guests.some(
        (guest, index) =>
          index === 1 && guest.side === "GROOM" && guest.lastName.length > 0,
      ),
    ).toBe(true);
    expect(state.guests.some((guest) => guest.side === "FAMILY")).toBe(true);
    expect(state.guests.some((guest) => guest.side === "FRIENDS")).toBe(true);
    expect(
      state.guests.some(
        (guest) => guest.firstName.includes(" - OT") && guest.lastName === "",
      ),
    ).toBe(true);
  });
});
