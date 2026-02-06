"use client";

import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
import { performDeviceAction } from "@/lib/device-actions";
import { AppConfig, DeviceSummaryModel, MetricsStatusThreshold } from "@/lib/types";
import {
  formatBytes,
  formatDateTime,
  formatPowerOnHours,
  formatTemperature,
  summaryAgeClass,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  deviceHref,
  getDeviceCardData,
  groupDevicesByHost,
  sortDevicesForDashboard,
} from "@/components/dashboard/device-list-shared";

interface DeviceListProps {
  summary: Record<string, DeviceSummaryModel>;
  settings?: AppConfig;
  showArchived: boolean;
  onAction: () => void;
}

export function DeviceList({ summary, settings, showArchived, onAction }: DeviceListProps) {
  const { t } = useI18n();
  const [confirmState, setConfirmState] = React.useState<{
    action: "archive" | "unarchive" | "delete";
    wwn: string;
    label: string;
  } | null>(null);

  const threshold = settings?.metrics?.status_threshold ?? MetricsStatusThreshold.Both;
  const temperatureUnit = settings?.temperature_unit ?? "celsius";

  const devices = Object.values(summary).filter((device) =>
    showArchived ? true : !device.device.archived
  );

  const sortedDevices = sortDevicesForDashboard(devices, settings);

  const unknownHostLabel = t("dashboard.devices.host_unknown");
  const groupEntries = groupDevicesByHost(sortedDevices, unknownHostLabel);

  const handleConfirm = async () => {
    if (!confirmState) return;
    try {
      await performDeviceAction(confirmState.action, confirmState.wwn);
      toast.success(t("toast.success"));
      onAction();
    } catch {
      toast.error(t("toast.error"));
    } finally {
      setConfirmState(null);
    }
  };

  if (!devices.length) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        {t("dashboard.devices.empty")}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groupEntries.map(([host, group]) => (
        <div key={host} className="space-y-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
            <span>{t("dashboard.devices.host")}</span>
            <span className="text-foreground">{host}</span>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {group.map((deviceSummary) => {
              const {
                failedEmphasis,
                pillStatus,
                ProtocolIcon,
                protocol,
                statusLabel,
                title,
              } = getDeviceCardData(deviceSummary, settings, threshold, t);
              return (
                <Card key={deviceSummary.device.wwn} className={`glass-panel ${failedEmphasis}`}>
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
                              <DropdownMenuItem
                                onSelect={(event) => event.preventDefault()}
                                asChild
                                className="cursor-pointer"
                              >
                                <Link
                                  href={deviceHref(deviceSummary.device.wwn)}
                                  onClick={(event) => event.stopPropagation()}
                                >
                                  {t("nav.device")}
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={(event) => event.preventDefault()}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setConfirmState({
                                    action: deviceSummary.device.archived ? "unarchive" : "archive",
                                    wwn: deviceSummary.device.wwn,
                                    label: title,
                                  });
                                }}
                                className="cursor-pointer"
                              >
                                {deviceSummary.device.archived
                                  ? t("device.actions.unarchive")
                                  : t("device.actions.archive")}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={(event) => event.preventDefault()}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setConfirmState({
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
            })}
          </div>
        </div>
      ))}

      <Dialog open={!!confirmState} onOpenChange={() => setConfirmState(null)}>
        <DialogContent onPointerDown={(event) => event.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>{confirmState?.label}</DialogTitle>
            <DialogDescription>
              {confirmState?.action === "delete"
                ? t("device.actions.delete_warning")
                : confirmState?.action === "archive"
                ? t("device.actions.archive_confirm")
                : t("device.actions.unarchive_confirm")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={(event) => {
                event.stopPropagation();
                setConfirmState(null);
              }}
            >
              {t("device.actions.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={(event) => {
                event.stopPropagation();
                handleConfirm();
              }}
            >
              {t("device.actions.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
