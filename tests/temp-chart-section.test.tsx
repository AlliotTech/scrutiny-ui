import { describe, expect, it, vi } from "vitest";

import { TempChartSection } from "@/components/dashboard/temp-chart-section";
import summary from "@/mocks/data/summary.json";
import tempHistory from "@/mocks/data/summary-temp.json";
import { renderWithProviders } from "@/tests/render";

vi.mock("next/dynamic", () => ({
  default: () => () => <div data-testid="temp-chart" />,
}));

describe("TempChartSection", () => {
  it("renders skeleton state before layout is known", () => {
    const { getByText, queryByText } = renderWithProviders(
      <TempChartSection
        isDesktop={null}
        durationKey="month"
        onDurationChange={() => {}}
        tempData={tempHistory.data.temp_history}
        unit="celsius"
        summary={summary.data.summary}
        dashboardDisplay="name"
        tempOpen=""
        onTempOpenChange={() => {}}
      />
    );

    expect(getByText("Temperature Trends")).toBeInTheDocument();
    expect(queryByText("Duration")).not.toBeInTheDocument();
  });

  it("renders chart on desktop", () => {
    const { getByRole, getByTestId } = renderWithProviders(
      <TempChartSection
        isDesktop={true}
        durationKey="month"
        onDurationChange={() => {}}
        tempData={tempHistory.data.temp_history}
        unit="celsius"
        summary={summary.data.summary}
        dashboardDisplay="name"
        tempOpen=""
        onTempOpenChange={() => {}}
      />
    );

    expect(getByRole("combobox")).toBeInTheDocument();
    expect(getByTestId("temp-chart")).toBeInTheDocument();
  });

  it("renders chart in mobile accordion when open", () => {
    const { queryByTestId, rerender } = renderWithProviders(
      <TempChartSection
        isDesktop={false}
        durationKey="month"
        onDurationChange={() => {}}
        tempData={tempHistory.data.temp_history}
        unit="celsius"
        summary={summary.data.summary}
        dashboardDisplay="name"
        tempOpen=""
        onTempOpenChange={() => {}}
      />
    );

    expect(queryByTestId("temp-chart")).not.toBeInTheDocument();

    rerender(
      <TempChartSection
        isDesktop={false}
        durationKey="month"
        onDurationChange={() => {}}
        tempData={tempHistory.data.temp_history}
        unit="celsius"
        summary={summary.data.summary}
        dashboardDisplay="name"
        tempOpen="temp"
        onTempOpenChange={() => {}}
      />
    );

    expect(queryByTestId("temp-chart")).toBeInTheDocument();
  });
});
