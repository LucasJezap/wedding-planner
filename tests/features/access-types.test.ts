import {
  accountActivationSchema,
  accountInputSchema,
  accountRoleUpdateSchema,
} from "@/features/access/types/access";

describe("access schemas", () => {
  it("accepts valid account payloads", () => {
    expect(
      accountInputSchema.parse({
        email: "witness@example.com",
        role: "WITNESS",
      }).role,
    ).toBe("WITNESS");

    expect(accountRoleUpdateSchema.parse({ role: "READ_ONLY" }).role).toBe(
      "READ_ONLY",
    );
    expect(
      accountActivationSchema.parse({
        token: "abc",
        name: "Witness Demo",
        password: "Avatar3232!",
        confirmPassword: "Avatar3232!",
      }).token,
    ).toBe("abc");
  });

  it("rejects invalid account payloads", () => {
    expect(() =>
      accountInputSchema.parse({
        email: "invalid-email",
        role: "ADMIN",
      }),
    ).toThrow();

    expect(() => accountRoleUpdateSchema.parse({ role: "OWNER" })).toThrow();
    expect(() =>
      accountActivationSchema.parse({
        token: "abc",
        name: "Witness Demo",
        password: "Avatar3232!",
        confirmPassword: "wrong",
      }),
    ).toThrow();
  });
});
