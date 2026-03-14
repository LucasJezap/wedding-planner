import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import userEvent from "@testing-library/user-event";

import { AppShell } from "@/components/app-shell";
import { PageShell } from "@/components/page-shell";
import { SummaryCard } from "@/components/summary-card";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

vi.mock("next-auth/react", () => ({
  signOut: vi.fn(),
}));

describe("shared components", () => {
  it("renders the app shell", async () => {
    render(
      <AppShell userName="Łukasz" userRole="ADMIN">
        workspace
      </AppShell>,
    );
    expect(screen.getByText("Kasia i Łukasz")).toBeInTheDocument();
    expect(screen.getByText("workspace")).toBeInTheDocument();
    expect(screen.getAllByText("Wyloguj")).toHaveLength(2);

    const user = userEvent.setup();
    await user.click(
      screen.getAllByRole("button", { name: "Przełącz język PL" })[0]!,
    );
    expect(
      screen.getAllByRole("button", { name: "Przełącz język EN" }),
    ).toHaveLength(2);
  });

  it("renders the page shell", () => {
    render(
      <PageShell eyebrow="Demo" title="Hello" description="World">
        body
      </PageShell>,
    );
    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByText("body")).toBeInTheDocument();
  });

  it("renders the summary card", () => {
    render(
      <SummaryCard
        label="Goście"
        value="120"
        detail="40 oczekuje"
        accent="#000"
        icon={<span>i</span>}
      />,
    );
    expect(screen.getByText("120")).toBeInTheDocument();
  });
});
