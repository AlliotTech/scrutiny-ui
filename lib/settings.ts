import { AppConfig } from "@/lib/types";

// Keep keys in sync with AppConfig when adding new settings fields.
export function buildSettingsPatch(original: AppConfig, next: AppConfig): Partial<AppConfig> {
  const patch: Partial<AppConfig> = {};
  const keys: Array<keyof AppConfig> = [
    "theme",
    "layout",
    "dashboard_display",
    "dashboard_sort",
    "temperature_unit",
    "file_size_si_units",
    "powered_on_hours_unit",
    "line_stroke",
  ];
  keys.forEach((key) => {
    const nextValue = next[key];
    if (nextValue !== undefined && nextValue !== original[key]) {
      patch[key] = nextValue;
    }
  });

  const metricsKeys: Array<keyof NonNullable<AppConfig["metrics"]>> = [
    "notify_level",
    "status_filter_attributes",
    "status_threshold",
    "repeat_notifications",
  ];
  const metricsPatch: Partial<NonNullable<AppConfig["metrics"]>> = {};
  metricsKeys.forEach((key) => {
    const nextValue = next.metrics?.[key];
    const originalValue = original.metrics?.[key];
    if (nextValue !== undefined && nextValue !== originalValue) {
      metricsPatch[key] = nextValue;
    }
  });
  if (Object.keys(metricsPatch).length > 0) {
    patch.metrics = metricsPatch;
  }

  const collectorKeys: Array<keyof NonNullable<AppConfig["collector"]>> = [
    "discard_sct_temp_history",
  ];
  const collectorPatch: Partial<NonNullable<AppConfig["collector"]>> = {};
  collectorKeys.forEach((key) => {
    const nextValue = next.collector?.[key];
    const originalValue = original.collector?.[key];
    if (nextValue !== undefined && nextValue !== originalValue) {
      collectorPatch[key] = nextValue;
    }
  });
  if (Object.keys(collectorPatch).length > 0) {
    patch.collector = collectorPatch;
  }

  return patch;
}
