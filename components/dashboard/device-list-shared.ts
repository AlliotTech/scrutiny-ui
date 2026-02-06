import { Cpu, HardDrive, HelpCircle, Server } from "lucide-react";

import { deviceStatusForModelWithThreshold, deviceTitleWithFallback } from "@/lib/format";
import { AppConfig, DeviceSummaryModel, MetricsStatusThreshold } from "@/lib/types";

type StatusPillStatus = "passed" | "failed" | "unknown";

export function deviceHref(wwn: string) {
  return `/device?wwn=${encodeURIComponent(wwn)}`;
}

export function sortDevicesForDashboard(
  devices: DeviceSummaryModel[],
  settings?: AppConfig
) {
  const dashboardSort = settings?.dashboard_sort ?? "status";
  const sortedDevices = [...devices].sort((a, b) => {
    if (dashboardSort === "title") {
      const left = deviceTitleWithFallback(a.device, settings?.dashboard_display ?? "name");
      const right = deviceTitleWithFallback(b.device, settings?.dashboard_display ?? "name");
      return left.localeCompare(right);
    }
    if (dashboardSort === "age") {
      return (a.smart?.power_on_hours ?? 0) - (b.smart?.power_on_hours ?? 0);
    }
    const statusValue = (summaryItem: DeviceSummaryModel) => {
      if (!summaryItem.smart) return 0;
      if (summaryItem.device.device_status === 0) return 1;
      return summaryItem.device.device_status * -1;
    };
    return statusValue(a) - statusValue(b);
  });
  return sortedDevices;
}

export function groupDevicesByHost(devices: DeviceSummaryModel[], unknownHostLabel: string) {
  const grouped = devices.reduce<Record<string, DeviceSummaryModel[]>>((acc, item) => {
    const host = item.device.host_id?.trim() || unknownHostLabel;
    if (!acc[host]) acc[host] = [];
    acc[host].push(item);
    return acc;
  }, {});
  const groupEntries = Object.entries(grouped).sort(([a], [b]) => {
    if (a === unknownHostLabel) return 1;
    if (b === unknownHostLabel) return -1;
    return a.localeCompare(b);
  });
  return groupEntries;
}

export function getDeviceCardData(
  deviceSummary: DeviceSummaryModel,
  settings: AppConfig | undefined,
  threshold: MetricsStatusThreshold,
  t: (key: string) => string
) {
  const status = deviceStatusForModelWithThreshold(
    deviceSummary.device,
    !!deviceSummary.smart,
    threshold
  );
  const statusLabel = t(`status.${status.replace(": ", "_")}`);
  const pillStatus: StatusPillStatus =
    status === "passed" ? "passed" : status.startsWith("failed") ? "failed" : "unknown";
  const title = deviceTitleWithFallback(
    deviceSummary.device,
    settings?.dashboard_display ?? "name"
  );
  const failedEmphasis = status.startsWith("failed")
    ? "border-rose-200 ring-1 ring-rose-100"
    : "border-border";
  const protocol = deviceSummary.device.device_protocol?.toUpperCase() ?? "";
  const ProtocolIcon =
    protocol === "ATA" ? HardDrive : protocol === "NVME" ? Cpu : protocol === "SCSI" ? Server : HelpCircle;

  return {
    failedEmphasis,
    pillStatus,
    ProtocolIcon,
    protocol,
    status,
    statusLabel,
    title,
  };
}
