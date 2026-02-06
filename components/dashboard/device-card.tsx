"use client";

import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  formatBytes,
  formatDateTime,
  formatPowerOnHours,
  formatTemperature,
  summaryAgeClass,
} from "@/lib/format";
import { AppConfig, DeviceSummaryModel, MetricsStatusThreshold } from "@/lib/types";
import { deviceHref, getDeviceCardData } from "@/components/dashboard/device-list-shared";

export type DeviceCardVariant = "desktop" | "mobile";

interface DeviceCardProps {
  deviceSummary: DeviceSummaryModel;
  settings?: AppConfig;
  threshold: MetricsStatusThreshold;
  t: (key: string) => string;
  variant: DeviceCardVariant;
  onAction: (payload: { action: "archive" | "unarchive" | "delete"; wwn: string; label: string }) => void;
  onNavigate: (href: string) => void;
}

export function DeviceCard({ deviceSummary, settings, threshold, t, variant, onAction, onNavigate }: DeviceCardProps) {
  const {
    failedEmphasis,
    pillStatus,
    ProtocolIcon,
    protocol,
    statusLabel,
    title,
  } = getDeviceCardData(deviceSummary, settings, threshold, t);
  const temperatureUnit = settings?.temperature_unit ?? "celsius";

  if (variant === "mobile") {
    const handleNavigate = () => onNavigate(deviceHref(deviceSummary.device.wwn));
    return (
      <div
        className={`rounded-lg border bg-card p-4 cursor-pointer transition-colors hover:bg-muted/30 ${failedEmphasis}`}
        onClick={handleNavigate}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground"
                title={protocol || t("common.unknown")}
              >
                <ProtocolIcon className="h-3.5 w-3.5" />
              </span>
              <h3 className="text-base font-semibold">{title}</h3>
              {deviceSummary.device.archived && (
                <Badge variant="outline">{t("dashboard.devices.archived")}</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{deviceSummary.device.wwn}</p>
          </div>
          <StatusPill status={pillStatus} label={statusLabel} />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-[11px] uppercase text-muted-foreground">{t("dashboard.devices.last_updated")}</p>
            <p className={cn("text-base font-semibold", summaryAgeClass(deviceSummary.smart))}>
              {formatDateTime(deviceSummary.smart?.collector_date)}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase text-muted-foreground">{t("dashboard.devices.temp")}</p>
            <p className="text-base font-semibold">
              {formatTemperature(deviceSummary.smart?.temp, temperatureUnit)}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" onClick={(event) => event.stopPropagation()}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={(event) => event.preventDefault()}
                onClick={handleNavigate}
                className="cursor-pointer"
              >
                {t("nav.device")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(event) => event.preventDefault()}
                onClick={() =>
                  onAction({
                    action: deviceSummary.device.archived ? "unarchive" : "archive",
                    wwn: deviceSummary.device.wwn,
                    label: title,
                  })
                }
                className="cursor-pointer"
              >
                {deviceSummary.device.archived ? t("device.actions.unarchive") : t("device.actions.archive")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(event) => event.preventDefault()}
                onClick={() =>
                  onAction({
                    action: "delete",
                    wwn: deviceSummary.device.wwn,
                    label: title,
                  })
                }
                className="cursor-pointer"
              >
                {t("device.actions.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  return (
    <Card className={`glass-panel ${failedEmphasis}`}>
      <CardContent className="flex h-full flex-col gap-4 pt-6">
        <Link
          href={deviceHref(deviceSummary.device.wwn)}
          className="relative flex flex-col gap-3 rounded-md transition-colors hover:bg-muted/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground"
                  title={protocol || t("common.unknown")}
                >
                  <ProtocolIcon className="h-4 w-4" />
                </span>
                <h3 className="truncate text-lg font-semibold">{title}</h3>
                {deviceSummary.device.archived && (
                  <Badge variant="outline">{t("dashboard.devices.archived")}</Badge>
                )}
              </div>
              <p className="truncate text-xs text-muted-foreground">{deviceSummary.device.wwn}</p>
              <div className="mt-2">
                <StatusPill status={pillStatus} label={statusLabel} />
              </div>
            </div>
            <div className="flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t("header.actions")}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                    }}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={(event) => event.preventDefault()} asChild className="cursor-pointer">
                    <Link href={deviceHref(deviceSummary.device.wwn)} onClick={(event) => event.stopPropagation()}>
                      {t("nav.device")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={(event) => event.preventDefault()}
                    onClick={(event) => {
                      event.stopPropagation();
                      onAction({
                        action: deviceSummary.device.archived ? "unarchive" : "archive",
                        wwn: deviceSummary.device.wwn,
                        label: title,
                      });
                    }}
                    className="cursor-pointer"
                  >
                    {deviceSummary.device.archived ? t("device.actions.unarchive") : t("device.actions.archive")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={(event) => event.preventDefault()}
                    onClick={(event) => {
                      event.stopPropagation();
                      onAction({
                        action: "delete",
                        wwn: deviceSummary.device.wwn,
                        label: title,
                      });
                    }}
                    className="cursor-pointer"
                  >
                    {t("device.actions.delete")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </Link>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-[11px] uppercase text-muted-foreground">{t("dashboard.devices.last_updated")}</p>
            <p className={cn("text-base font-semibold", summaryAgeClass(deviceSummary.smart))}>
              {formatDateTime(deviceSummary.smart?.collector_date)}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase text-muted-foreground">{t("dashboard.devices.temp")}</p>
            <p className="text-base font-semibold">
              {formatTemperature(deviceSummary.smart?.temp, temperatureUnit)}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase text-muted-foreground">{t("dashboard.devices.capacity")}</p>
            <p className="text-sm text-muted-foreground">
              {formatBytes(deviceSummary.device.capacity, settings?.file_size_si_units)}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase text-muted-foreground">{t("dashboard.devices.power_on")}</p>
            <p className="text-sm text-muted-foreground">
              {formatPowerOnHours(deviceSummary.smart?.power_on_hours, settings?.powered_on_hours_unit)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
