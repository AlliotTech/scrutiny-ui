import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";

import { AttributeTable } from "@/components/device/attribute-table";
import deviceDetails from "@/mocks/data/device-details.json";
import { renderWithProviders } from "@/tests/render";

vi.mock("recharts", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("recharts");
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 240, height: 80 }}>{children}</div>
    ),
  };
});

describe("AttributeTable expand", () => {
  it("expands row to show details", async () => {
    const latestSmart = deviceDetails.data.smart_results[0];

    const { findByText, getAllByText } = renderWithProviders(
      <AttributeTable
        attrs={latestSmart.attrs}
        metadata={deviceDetails.metadata}
        deviceProtocol={deviceDetails.data.device.device_protocol}
        smartResults={deviceDetails.data.smart_results}
      />
    );

    const more = getAllByText("Click for more details")[0];
    const user = userEvent.setup();
    await user.click(more);

    expect(await findByText("Description")).toBeInTheDocument();
    expect(await findByText("Type")).toBeInTheDocument();
  });
});
