import {
  DeviceModel,
  DashboardDisplay,
  MetricsStatusThreshold,
  SmartAttributeModel,
  AttributeMetadataModel,
  SmartSummary,
  TemperatureUnit,
} from "@/lib/types";

const DEVICE_STATUS_NAMES: Record<number, string> = {
  0: "passed",
  1: "failed",
  2: "failed",
  3: "failed",
};

const DEVICE_STATUS_NAMES_WITH_REASON: Record<number, string> = {
  0: "passed",
  1: "failed: smart",
  2: "failed: scrutiny",
  3: "failed: both",
};

export function deviceStatusForModelWithThreshold(
  deviceModel: DeviceModel,
  hasSmartResults = true,
  threshold: MetricsStatusThreshold = MetricsStatusThreshold.Both,
  includeReason = false
): string {
  if (!hasSmartResults) {
    return "unknown";
  }
  const statusNameLookup = includeReason ? DEVICE_STATUS_NAMES_WITH_REASON : DEVICE_STATUS_NAMES;
  const deviceStatus = deviceModel.device_status & threshold;
  return statusNameLookup[deviceStatus] ?? "unknown";
}

export function formatTemperature(value: number | undefined, unit: TemperatureUnit = "celsius") {
  if (value === undefined || value === null) {
    return "--";
  }
  const temp = unit === "fahrenheit" ? (value * 9) / 5 + 32 : value;
  const suffix = unit === "fahrenheit" ? "°F" : "°C";
  return `${Math.round(temp)}${suffix}`;
}

export function formatBytes(value: number | undefined, siUnits = false) {
  if (!value && value !== 0) return "--";
  const base = siUnits ? 1000 : 1024;
  const units = siUnits ? ["B", "KB", "MB", "GB", "TB", "PB"] : ["B", "KiB", "MiB", "GiB", "TiB", "PiB"];
  let i = 0;
  let num = value;
  while (num >= base && i < units.length - 1) {
    num /= base;
    i += 1;
  }
  return `${num.toFixed(num < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

export function formatPowerOnHours(value?: number, unit: "humanize" | "device_hours" = "humanize") {
  if (!value && value !== 0) return "--";
  if (unit === "device_hours") return `${Math.floor(value)}h`;
  const hours = Math.floor(value);
  const days = Math.floor(hours / 24);
  const years = Math.floor(days / 365);
  const remainingDays = days % 365;
  const remainingHours = hours % 24;

  const parts = [] as string[];
  if (years > 0) parts.push(`${years}y`);
  if (remainingDays > 0) parts.push(`${remainingDays}d`);
  if (remainingHours > 0 || parts.length === 0) parts.push(`${remainingHours}h`);
  return parts.join(" ");
}

export function formatDateTime(value?: string) {
  if (!value) return "--";
  const date = new Date(value);
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function summaryAgeClass(summary?: SmartSummary) {
  if (!summary?.collector_date) return "text-muted-foreground";
  const date = new Date(summary.collector_date).getTime();
  const now = Date.now();
  const hours = (now - date) / (1000 * 60 * 60);
  if (hours <= 24) return "text-emerald-600";
  if (hours <= 168) return "text-amber-600";
  return "text-rose-600";
}

const ATTRIBUTE_STATUS_PASSED = 0;
const ATTRIBUTE_STATUS_FAILED_SMART = 1;
const ATTRIBUTE_STATUS_WARN_SCRUTINY = 2;
const ATTRIBUTE_STATUS_FAILED_SCRUTINY = 4;

export function attributeStatusName(status: number): "passed" | "warn" | "failed" | "unknown" {
  if (status === ATTRIBUTE_STATUS_PASSED) return "passed";
  if ((status & ATTRIBUTE_STATUS_FAILED_SCRUTINY) !== 0 || (status & ATTRIBUTE_STATUS_FAILED_SMART) !== 0) {
    return "failed";
  }
  if ((status & ATTRIBUTE_STATUS_WARN_SCRUTINY) !== 0) return "warn";
  return "unknown";
}

export function attributeStatusKind(status: number) {
  return attributeStatusName(status);
}

export function attributeScrutinyStatus(status: number): "passed" | "warn" | "failed" {
  if ((status & ATTRIBUTE_STATUS_FAILED_SCRUTINY) !== 0) return "failed";
  if ((status & ATTRIBUTE_STATUS_WARN_SCRUTINY) !== 0) return "warn";
  return "passed";
}

export function attributeSmartStatus(status: number): "passed" | "failed" {
  if ((status & ATTRIBUTE_STATUS_FAILED_SMART) !== 0) return "failed";
  return "passed";
}

export function attributeStatusColor(status: number) {
  const kind = attributeStatusName(status);
  if (kind === "failed") return "hsl(var(--destructive))";
  if (kind === "warn") return "hsl(var(--chart-4))";
  if (kind === "passed") return "hsl(var(--chart-2))";
  return "hsl(var(--muted-foreground))";
}

export function isAtaProtocol(protocol?: string) {
  return protocol?.toUpperCase() === "ATA";
}

export function formatAttributeValue(
  attr: SmartAttributeModel,
  meta?: AttributeMetadataModel,
  isAta = false
) {
  if (!attr) return undefined;
  if (!isAta) return attr.value;
  if (!meta) return attr.value;
  if (meta.display_type === "raw") return attr.raw_value ?? attr.value;
  if (meta.display_type === "transformed" && attr.transformed_value !== undefined) return attr.transformed_value;
  return attr.value;
}

export function formatAttributeWorst(attr: SmartAttributeModel, meta?: AttributeMetadataModel) {
  if (!attr) return undefined;
  if (!meta) return attr.worst;
  return meta.display_type === "normalized" ? attr.worst : undefined;
}

export function formatAttributeThreshold(attr: SmartAttributeModel, meta?: AttributeMetadataModel, isAta = false) {
  if (!attr) return undefined;
  if (isAta) return attr.thresh;
  return attr.thresh === -1 ? undefined : attr.thresh;
}

export function formatAttributeIdeal(meta?: AttributeMetadataModel, isAta = false) {
  if (!meta) return undefined;
  if (isAta) return meta.display_type === "raw" ? meta.ideal : undefined;
  return meta.ideal;
}

export function formatPercent(value?: number) {
  if (value === undefined || value === null || Number.isNaN(value)) return "--";
  return `${Math.round(value * 100)}%`;
}

export function toHexId(value: number | string) {
  if (value === undefined || value === null) return "";
  return `0x${Number(value).toString(16).padStart(2, "0").toUpperCase()}`;
}

function deviceTitleForType(device: DeviceModel, titleType: DashboardDisplay = "name") {
  const titleParts: string[] = [];
  switch (titleType) {
    case "name":
      if (device.device_name) titleParts.push(`/dev/${device.device_name}`);
      if (device.device_type && device.device_type !== "scsi" && device.device_type !== "ata") {
        titleParts.push(device.device_type);
      }
      if (device.model_name) titleParts.push(device.model_name);
      break;
    case "serial_id":
      if (device.device_serial_id) titleParts.push(`/by-id/${device.device_serial_id}`);
      break;
    case "uuid":
      if (device.device_uuid) titleParts.push(`/by-uuid/${device.device_uuid}`);
      break;
    case "label":
      if (device.label) titleParts.push(device.label);
      else if (device.device_label) titleParts.push(`/by-label/${device.device_label}`);
      break;
    default:
      break;
  }
  return titleParts.join(" - ");
}

export function deviceTitleWithFallback(device: DeviceModel, titleType: DashboardDisplay = "name") {
  const titleParts: string[] = [];
  if (device.host_id) titleParts.push(device.host_id);
  const preferred = deviceTitleForType(device, titleType) || deviceTitleForType(device, "name");
  if (preferred) titleParts.push(preferred);
  return titleParts.join(" - ");
}

export function statusBarClass(status: string) {
  if (status === "passed") return "bg-emerald-500";
  if (status.startsWith("failed")) return "bg-rose-500";
  return "bg-amber-500";
}
