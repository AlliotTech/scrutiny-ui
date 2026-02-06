import { describe, expect, it, vi } from "vitest";

import { DeviceListMobile } from "@/components/dashboard/device-list-mobile";
import summary from "@/mocks/data/summary.json";
import { renderWithProviders } from "@/tests/render";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("DeviceListMobile", () => {
  it("groups devices by host", () => {
    const { getAllByText, getByText } = renderWithProviders(
      <DeviceListMobile summary={summary.data.summary} showArchived={true} onAction={() => {}} />
    );

    expect(getAllByText("Host").length).toBeGreaterThan(0);
    expect(getByText("alpha-host")).toBeInTheDocument();
    expect(getByText("Unknown Host")).toBeInTheDocument();
  });
});
