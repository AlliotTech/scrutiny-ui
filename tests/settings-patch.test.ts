import { describe, expect, it } from "vitest";

import { buildSettingsPatch } from "@/lib/settings";
import { AppConfig, MetricsNotifyLevel, MetricsStatusFilterAttributes, MetricsStatusThreshold } from "@/lib/types";

const base: AppConfig = {
  theme: "light",
  layout: "default",
  dashboard_display: "name",
  dashboard_sort: "status",
  temperature_unit: "celsius",
  file_size_si_units: true,
  powered_on_hours_unit: "humanize",
  line_stroke: "smooth",
  collector: {
    discard_sct_temp_history: false,
  },
  metrics: {
    notify_level: MetricsNotifyLevel.Fail,
    status_filter_attributes: MetricsStatusFilterAttributes.All,
    status_threshold: MetricsStatusThreshold.Both,
    repeat_notifications: false,
  },
};

describe("buildSettingsPatch", () => {
  it("returns empty patch when no changes", () => {
    const patch = buildSettingsPatch(base, { ...base });
    expect(patch).toEqual({});
  });

  it("includes only changed top-level fields", () => {
    const patch = buildSettingsPatch(base, {
      ...base,
      temperature_unit: "fahrenheit",
    });
    expect(patch).toEqual({ temperature_unit: "fahrenheit" });
  });

  it("includes only changed nested fields", () => {
    const patch = buildSettingsPatch(base, {
      ...base,
      collector: { discard_sct_temp_history: true },
      metrics: { ...base.metrics, status_threshold: MetricsStatusThreshold.Smart },
    });
    expect(patch).toEqual({
      collector: { discard_sct_temp_history: true },
      metrics: { status_threshold: MetricsStatusThreshold.Smart },
    });
  });
});
