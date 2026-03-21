import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { TimelineManager } from "@/features/timeline/components/timeline-manager";
import { apiClient } from "@/lib/api-client";
import { listTimelineEvents } from "@/services/timeline-service";

vi.mock("@/lib/api-client", () => ({
  apiClient: vi.fn(),
}));

describe("TimelineManager", () => {
  it("renders events and deletes one", async () => {
    const events = await listTimelineEvents();
    vi.mocked(apiClient).mockResolvedValueOnce({ eventId: events[0]!.id });

    render(<TimelineManager initialEvents={events} viewerRole="ADMIN" />);
    expect(
      screen.getByRole("link", { name: "Eksportuj kalendarz" }),
    ).toBeInTheDocument();
    const user = userEvent.setup();
    await user.click(screen.getAllByRole("button", { name: "Usuń" })[0]!);

    await waitFor(() => expect(apiClient).toHaveBeenCalled());
  });

  it("hides timeline form for witness accounts", async () => {
    render(
      <TimelineManager
        initialEvents={await listTimelineEvents()}
        viewerRole="WITNESS"
      />,
    );

    expect(
      screen.queryByRole("button", { name: "Utwórz wydarzenie" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Edytuj" }),
    ).not.toBeInTheDocument();
  });
});
