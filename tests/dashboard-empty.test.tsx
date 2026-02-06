import { describe, expect, it, vi } from "vitest";
import { HttpResponse, http } from "msw";

import DashboardPage from "@/app/(dashboard)/page";
import { renderWithProviders } from "@/tests/render";
import { server } from "@/mocks/server";

vi.mock("next/dynamic", () => ({
  default: () => () => null,
}));

describe("Dashboard empty state", () => {
  it("shows empty state content when no devices are present", async () => {
    server.use(
      http.get("/api/summary", () =>
        HttpResponse.json({ success: true, data: { summary: {} } })
      )
    );

    const { findByText } = renderWithProviders(<DashboardPage />);

    expect(await findByText("No Devices Detected")).toBeInTheDocument();
    expect(await findByText("scrutiny-collector-metrics run")).toBeInTheDocument();
  });
});
