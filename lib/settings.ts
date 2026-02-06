import { AppConfig } from "@/lib/types";

// Keep keys in sync with AppConfig when adding new settings fields.
export function buildSettingsPatch(original: AppConfig, next: AppConfig): Partial<AppConfig> {
  const rootKeys = [
    "theme",
    "layout",
    "dashboard_display",
    "dashboard_sort",
    "temperature_unit",
    "file_size_si_units",
    "powered_on_hours_unit",
    "line_stroke",
  ] as const;
  type RootKey = (typeof rootKeys)[number];
  const patch: Partial<AppConfig> = {};
  rootKeys.forEach((key) => {
    const nextValue = next[key];
    if (nextValue !== undefined && nextValue !== original[key]) {
      (patch as Record<RootKey, AppConfig[RootKey]>)[key] = nextValue;
    }
  });

  const metricsKeys = [
    "notify_level",
    "status_filter_attributes",
    "status_threshold",
    "repeat_notifications",
  ] as const;
  type MetricsKey = (typeof metricsKeys)[number];
  const metricsPatch: Partial<NonNullable<AppConfig["metrics"]>> = {};
  metricsKeys.forEach((key) => {
    const nextValue = next.metrics?.[key];
    const originalValue = original.metrics?.[key];
    if (nextValue !== undefined && nextValue !== originalValue) {
      (metricsPatch as Record<MetricsKey, NonNullable<AppConfig["metrics"]>[MetricsKey]>)[key] =
        nextValue;
    }
  });
  if (Object.keys(metricsPatch).length > 0) {
    patch.metrics = metricsPatch;
  }

  const collectorKeys = ["discard_sct_temp_history"] as const;
  type CollectorKey = (typeof collectorKeys)[number];
  const collectorPatch: Partial<NonNullable<AppConfig["collector"]>> = {};
  collectorKeys.forEach((key) => {
    const nextValue = next.collector?.[key];
    const originalValue = original.collector?.[key];
    if (nextValue !== undefined && nextValue !== originalValue) {
      (collectorPatch as Record<CollectorKey, NonNullable<AppConfig["collector"]>[CollectorKey]>)[
        key
      ] = nextValue;
    }
  });
  if (Object.keys(collectorPatch).length > 0) {
    patch.collector = collectorPatch;
  }

  return patch;
}
