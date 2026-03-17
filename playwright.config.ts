import { defineConfig, devices } from "@playwright/test";

const port = 3100;

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  workers: 1,
  use: {
    baseURL: `http://localhost:${port}`,
    trace: "on-first-retry",
  },
  webServer: {
    command: `sh -c 'npm run build && APP_DATA_MODE=memory INVITATION_EMAIL_MODE=skip NEXTAUTH_URL=http://localhost:${port} npx next start --hostname 127.0.0.1 --port ${port}'`,
    port,
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
