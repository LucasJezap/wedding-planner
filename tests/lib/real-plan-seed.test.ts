import { readFileSync } from "node:fs";
import { join } from "node:path";

import { buildSeedFromRealPlanDocument } from "@/lib/real-plan-seed";

describe("real-plan-seed", () => {
  it("builds the Docker seed only from real-plan.md data", () => {
    const document = readFileSync(
      join(process.cwd(), "docs", "real-plan.md"),
      "utf8",
    );
    const state = buildSeedFromRealPlanDocument(document);

    expect(state.users[0]?.email).toBe("lucasjezap@gmail.com");
    expect(state.wedding.title).toBe("Katarzyna & Łukasz");
    expect(
      state.vendors.some((vendor) => vendor.name.includes("Marcin Średziński")),
    ).toBe(true);
    expect(
      state.vendors.some((vendor) => /avery|ivory/i.test(vendor.name)),
    ).toBe(false);
    expect(state.budgetCategories.length).toBeGreaterThanOrEqual(18);
    expect(state.tasks.length).toBeGreaterThanOrEqual(40);
    expect(state.weddingTables.length).toBe(11);
    expect(state.seats.length).toBeGreaterThanOrEqual(60);
    expect(state.guests.length).toBeGreaterThanOrEqual(80);
  });
});
