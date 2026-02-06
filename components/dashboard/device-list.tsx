"use client";

import { toast } from "sonner";
import React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { performDeviceAction } from "@/lib/device-actions";
import { AppConfig, DeviceSummaryModel, MetricsStatusThreshold } from "@/lib/types";
import { groupDevicesByHost, sortDevicesForDashboard } from "@/components/dashboard/device-list-shared";
import { DeviceCard } from "@/components/dashboard/device-card";

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
              return (
                <DeviceCard
                  key={deviceSummary.device.wwn}
                  deviceSummary={deviceSummary}
                  settings={settings}
                  threshold={threshold}
                  t={t}
                  variant="desktop"
                  onAction={(payload) => setConfirmState(payload)}
                />
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
