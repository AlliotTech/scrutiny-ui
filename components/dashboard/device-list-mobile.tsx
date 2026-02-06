"use client";

import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import React from "react";
import { useRouter } from "next/navigation";

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
import { useI18n } from "@/lib/i18n";
import { performDeviceAction } from "@/lib/device-actions";
import { AppConfig, DeviceSummaryModel, MetricsStatusThreshold } from "@/lib/types";
import { formatDateTime, formatTemperature, summaryAgeClass } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  deviceHref,
  getDeviceCardData,
  groupDevicesByHost,
} from "@/components/dashboard/device-list-shared";

interface DeviceListMobileProps {
  summary: Record<string, DeviceSummaryModel>;
  settings?: AppConfig;
  showArchived: boolean;
  onAction: () => void;
}

export function DeviceListMobile({ summary, settings, showArchived, onAction }: DeviceListMobileProps) {
  const { t } = useI18n();
  const router = useRouter();
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

  const unknownHostLabel = t("dashboard.devices.host_unknown");
  const groupEntries = groupDevicesByHost(devices, unknownHostLabel);

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
      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
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
          <div className="space-y-3">
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
                <div
                  key={deviceSummary.device.wwn}
                  className={`rounded-lg border bg-card p-4 cursor-pointer transition-colors hover:bg-muted/30 ${failedEmphasis}`}
                  onClick={() => router.push(deviceHref(deviceSummary.device.wwn))}
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
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onSelect={(event) => event.preventDefault()}
                          onClick={() => router.push(deviceHref(deviceSummary.device.wwn))}
                          className="cursor-pointer"
                        >
                          {t("nav.device")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={(event) => event.preventDefault()}
                          onClick={() =>
                            setConfirmState({
                              action: deviceSummary.device.archived ? "unarchive" : "archive",
                              wwn: deviceSummary.device.wwn,
                              label: title,
                            })
                          }
                          className="cursor-pointer"
                        >
                          {deviceSummary.device.archived
                            ? t("device.actions.unarchive")
                            : t("device.actions.archive")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={(event) => event.preventDefault()}
                          onClick={() =>
                            setConfirmState({
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
            })}
          </div>
        </div>
      ))}

      <Dialog open={!!confirmState} onOpenChange={() => setConfirmState(null)}>
        <DialogContent>
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
            <Button variant="outline" onClick={() => setConfirmState(null)}>
              {t("device.actions.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleConfirm}>
              {t("device.actions.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
