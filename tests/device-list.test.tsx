import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";

import { DeviceList } from "@/components/dashboard/device-list";
import summary from "@/mocks/data/summary.json";
import { renderWithProviders } from "@/tests/render";
import { performDeviceAction } from "@/lib/device-actions";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/lib/device-actions", () => ({
  performDeviceAction: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
  },
}));

describe("DeviceList", () => {
  it("groups devices by host", () => {
    const { getAllByText, getByText } = renderWithProviders(
      <DeviceList summary={summary.data.summary} showArchived={true} onAction={() => {}} />
    );

    expect(getAllByText("Host").length).toBeGreaterThan(0);
    expect(getByText("alpha-host")).toBeInTheDocument();
    expect(getByText("Unknown Host")).toBeInTheDocument();
  });

  it("confirms device action and calls onAction", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    vi.mocked(performDeviceAction).mockResolvedValue(undefined);

    const { getAllByLabelText, getByText } = renderWithProviders(
      <DeviceList summary={summary.data.summary} showArchived={true} onAction={onAction} />
    );

    await user.click(getAllByLabelText("Actions")[0]);
    await user.click(getByText("Archive"));
    await user.click(getByText("Confirm"));

    const calledWith = vi.mocked(performDeviceAction).mock.calls[0];
    expect(calledWith?.[0]).toBe("archive");
    expect(Object.keys(summary.data.summary)).toContain(calledWith?.[1] ?? "");
    expect(onAction).toHaveBeenCalled();
  });
});
