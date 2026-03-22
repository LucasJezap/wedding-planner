import { z } from "zod";

export const accountInputSchema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "WITNESS", "READ_ONLY"]),
});

export const accountRoleUpdateSchema = z.object({
  role: z.enum(["ADMIN", "WITNESS", "READ_ONLY"]),
});

export const accountUpdateSchema = z
  .object({
    name: z.string().min(1),
    email: z.string().email(),
    role: z.enum(["ADMIN", "WITNESS", "READ_ONLY"]),
    password: z.string().min(8).or(z.literal("")).default(""),
    confirmPassword: z.string().min(8).or(z.literal("")).default(""),
  })
  .refine(
    (value) =>
      (value.password.length === 0 && value.confirmPassword.length === 0) ||
      value.password === value.confirmPassword,
    {
      message: "Passwords must match",
      path: ["confirmPassword"],
    },
  );

export const accountActivationSchema = z
  .object({
    token: z.string().min(1),
    name: z.string().min(1),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export type AccountInput = z.infer<typeof accountInputSchema>;
export type AccountRoleUpdateInput = z.infer<typeof accountRoleUpdateSchema>;
export type AccountUpdateInput = z.infer<typeof accountUpdateSchema>;
export type AccountActivationInput = z.infer<typeof accountActivationSchema>;
