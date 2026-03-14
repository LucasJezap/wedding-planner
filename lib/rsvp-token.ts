import { createHash } from "node:crypto";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export const createRsvpToken = (seed: string): string => {
  const digest = createHash("sha256").update(seed).digest();

  return Array.from(
    { length: 4 },
    (_, index) => LETTERS[digest[index]! % LETTERS.length],
  ).join("");
};
