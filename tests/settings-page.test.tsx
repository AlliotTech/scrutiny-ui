import { describe, expect, it } from "vitest";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import SettingsPage from "@/app/settings/page";
import { renderWithProviders } from "@/tests/render";
import { saveSettings } from "@/lib/api";

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return {
    ...actual,
    saveSettings: vi.fn(),
  };
});

describe("SettingsPage", () => {
  it("shows health status and settings sections", async () => {
    const { findByText } = renderWithProviders(<SettingsPage />);

    expect(await findByText("System Health")).toBeInTheDocument();
    expect(await findByText("Healthy")).toBeInTheDocument();
    expect(await findByText("Metrics")).toBeInTheDocument();
    expect(await findByText("Display")).toBeInTheDocument();
    expect(await findByText("Collector")).toBeInTheDocument();
  });

  it("saves collector discard flag", async () => {
    const user = userEvent.setup();
    vi.mocked(saveSettings).mockResolvedValue({
      theme: "light",
      layout: "default",
      dashboard_display: "name",
      dashboard_sort: "status",
      temperature_unit: "celsius",
      file_size_si_units: true,
      powered_on_hours_unit: "humanize",
      line_stroke: "smooth",
      collector: {
        discard_sct_temp_history: true,
      },
      metrics: {
        notify_level: 2,
        status_filter_attributes: 0,
        status_threshold: 3,
        repeat_notifications: false,
      },
    });

    const { findByRole, getByText } = renderWithProviders(<SettingsPage />);

    const toggle = await findByRole("switch", { name: "Discard SCT Temperature History" });
    await user.click(toggle);
    await user.click(getByText("Save Settings"));

    expect(saveSettings).toHaveBeenCalled();
    const payload = vi.mocked(saveSettings).mock.calls[0]?.[0];
    expect(payload?.collector?.discard_sct_temp_history).toBe(true);
  });

  it("enables save when settings change", async () => {
    const user = userEvent.setup();
    const { findByRole, findByText } = renderWithProviders(<SettingsPage />);

    const saveButton = await findByRole("button", { name: "Save Settings" });
    expect(saveButton).toBeDisabled();

    const toggle = await findByRole("switch", { name: "Discard SCT Temperature History" });
    await user.click(toggle);

    expect(saveButton).toBeEnabled();
    expect(await findByText("You have unsaved changes.")).toBeInTheDocument();
  });
});
