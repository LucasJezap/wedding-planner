if (process.env.CI === "true" || process.env.CI === "1" || process.env.VERCEL === "1") {
  process.exit(0);
}

const husky = (await import("husky")).default;

husky();
