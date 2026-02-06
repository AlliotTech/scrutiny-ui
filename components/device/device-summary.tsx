"use client";

import { Cpu, HardDrive, HelpCircle, Server } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { useI18n } from "@/lib/i18n";
import { AppConfig, DeviceModel, SmartModel } from "@/lib/types";
import {
  deviceStatusForModelWithThreshold,
  deviceTitleWithFallback,
  formatBytes,
  formatDateTime,
  formatPowerOnHours,
  formatTemperature,
  statusBarClass,
} from "@/lib/format";

interface DeviceSummaryProps {
  device: DeviceModel;
  smart?: SmartModel;
  settings?: AppConfig;
}

function SummaryField({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value ?? "--"}</p>
    </div>
  );
}

export function DeviceSummary({ device, smart, settings }: DeviceSummaryProps) {
  const { t } = useI18n();
  const status = deviceStatusForModelWithThreshold(
    device,
    !!smart,
    settings?.metrics?.status_threshold
  );
  const statusLabel = t(`status.${status.replace(": ", "_")}`);
  const pillStatus = status === "passed" ? "passed" : status.startsWith("failed") ? "failed" : "unknown";
  const statusBar = statusBarClass(status);
  const isAta = device.device_protocol?.toUpperCase() === "ATA";
  const protocol = device.device_protocol?.toUpperCase() ?? "";
  const ProtocolIcon =
    protocol === "ATA" ? HardDrive : protocol === "NVME" ? Cpu : protocol === "SCSI" ? Server : HelpCircle;

  return (
    <Card className="relative overflow-hidden glass-panel">
      <div className={`absolute inset-x-0 top-0 h-1 ${statusBar}`} />
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground"
              title={protocol || t("common.unknown")}
            >
              <ProtocolIcon className="h-4 w-4" />
            </span>
            <CardTitle className="text-2xl">
              {deviceTitleWithFallback(device, settings?.dashboard_display ?? "name")}
            </CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">{device.wwn}</p>
        </div>
        <StatusPill status={pillStatus} label={statusLabel} />
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-4">
        <div>
          <p className="text-xs uppercase text-muted-foreground">{t("dashboard.devices.temp")}</p>
          <p className="text-lg font-semibold">
            {formatTemperature(smart?.temp, settings?.temperature_unit ?? "celsius")}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase text-muted-foreground">{t("dashboard.devices.power_on")}</p>
          <p className="text-lg font-semibold">
            {formatPowerOnHours(smart?.power_on_hours, settings?.powered_on_hours_unit)}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase text-muted-foreground">{t("dashboard.devices.capacity")}</p>
          <p className="text-lg font-semibold">
            {formatBytes(device.capacity, settings?.file_size_si_units)}
          </p>
        </div>
        <SummaryField label={t("dashboard.devices.last_updated")} value={formatDateTime(smart?.date)} />
        <SummaryField label={t("device.interface")} value={device.interface_type} />
        <SummaryField label={t("device.firmware")} value={device.firmware} />
        {device.host_id && <SummaryField label={t("device.host_id")} value={device.host_id} />}
        {device.device_uuid && <SummaryField label={t("device.device_uuid")} value={device.device_uuid} />}
        {device.device_label && <SummaryField label={t("device.device_label")} value={device.device_label} />}
        {device.device_type && device.device_type !== "ata" && device.device_type !== "scsi" && (
          <SummaryField label={t("device.device_type")} value={device.device_type.toUpperCase()} />
        )}
        {device.manufacturer && <SummaryField label={t("device.model_family")} value={device.manufacturer} />}
        {device.model_name && <SummaryField label={t("device.model_name")} value={device.model_name} />}
        {device.serial_number && <SummaryField label={t("device.serial_number")} value={device.serial_number} />}
        {device.wwn && <SummaryField label={t("device.wwn")} value={device.wwn} />}
        {device.rotational_speed ? (
          <SummaryField label={t("device.rotation_rate")} value={`${device.rotational_speed} RPM`} />
        ) : null}
        {device.device_protocol && <SummaryField label={t("device.protocol")} value={device.device_protocol} />}
        {smart?.power_cycle_count !== undefined && (
          <SummaryField label={t("device.power_cycle_count")} value={smart.power_cycle_count} />
        )}
        {isAta && smart?.power_on_hours !== undefined && (
          <SummaryField
            label={t("device.powered_on")}
            value={formatPowerOnHours(smart.power_on_hours, settings?.powered_on_hours_unit)}
          />
        )}
      </CardContent>
    </Card>
  );
}
