import { describe, expect, it } from "vitest";

import SettingsPage from "@/app/settings/page";
import { renderWithProviders } from "@/tests/render";

describe("SettingsPage", () => {
  it("shows health status and settings sections", async () => {
    const { findByText } = renderWithProviders(<SettingsPage />);

    expect(await findByText("System Health")).toBeInTheDocument();
    expect(await findByText("Healthy")).toBeInTheDocument();
    expect(await findByText("Metrics")).toBeInTheDocument();
    expect(await findByText("Display")).toBeInTheDocument();
  });
});
