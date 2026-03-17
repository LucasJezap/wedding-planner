import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { SeatingPlanner } from "@/features/seating/components/seating-planner";
import { getSeatingBoard } from "@/services/seating-service";

vi.mock("react-konva", () => {
  const createNode = (name: string) => {
    const MockNode = ({
      children,
      text,
      onClick,
      onTap,
      ...props
    }: Record<string, unknown>) => (
      <div
        data-konva-node={name}
        data-text={typeof text === "string" ? text : undefined}
        onClick={() => {
          const handler =
            typeof onClick === "function"
              ? onClick
              : typeof onTap === "function"
                ? onTap
                : undefined;
          handler?.({
            target: {
              absolutePosition: () => ({
                x: Number(props.x ?? 0),
                y: Number(props.y ?? 0),
              }),
              x: () => Number(props.x ?? 0),
              y: () => Number(props.y ?? 0),
            },
          });
        }}
      >
        {text as string | undefined}
        {children as React.ReactNode}
      </div>
    );
    MockNode.displayName = `${name}Mock`;

    return MockNode;
  };

  return {
    Stage: createNode("Stage"),
    Layer: createNode("Layer"),
    Rect: createNode("Rect"),
    Group: createNode("Group"),
    Circle: createNode("Circle"),
    Text: createNode("Text"),
  };
});

describe("SeatingPlanner", () => {
  it("renders seating summary, guest pool and canvas tables", async () => {
    render(
      <SeatingPlanner
        initialBoard={await getSeatingBoard()}
        viewerRole="ADMIN"
      />,
    );

    expect(screen.getAllByText("Goście bez stołu")).toHaveLength(2);
    expect(screen.getByText("Garden Table")).toBeInTheDocument();
    expect(screen.getByText("Conservatory Table")).toBeInTheDocument();
    expect(screen.getByText("Emma Hart")).toBeInTheDocument();
    expect(screen.getByText("Liam Hart")).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Stoły prostokątne" }),
    ).toBeInTheDocument();
  });

  it("opens a seat editor overlay after chair click", async () => {
    const { container } = render(
      <SeatingPlanner
        initialBoard={await getSeatingBoard()}
        viewerRole="ADMIN"
      />,
    );

    const circles = container.querySelectorAll('[data-konva-node="Circle"]');
    fireEvent.click(circles[1]!);

    expect(
      screen.getByPlaceholderText("Upuść gościa tutaj"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Zapisz" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Usuń" })).toBeInTheDocument();
  });
});
