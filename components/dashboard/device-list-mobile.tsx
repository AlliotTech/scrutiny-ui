"use client";

import { toast } from "sonner";
import React from "react";
import { useRouter } from "next/navigation";

import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog";
import { useI18n } from "@/lib/i18n";
import { performDeviceAction } from "@/lib/device-actions";
import { AppConfig, DeviceSummaryModel, MetricsStatusThreshold } from "@/lib/types";
import { groupDevicesByHost, sortDevicesForDashboard } from "@/components/dashboard/device-list-shared";
import { DeviceCard } from "@/components/dashboard/device-card";

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
  const devices = Object.values(summary).filter((device) =>
    showArchived ? true : !device.device.archived
  );

  const unknownHostLabel = t("dashboard.devices.host_unknown");
  const sortedDevices = sortDevicesForDashboard(devices, settings);
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
            {group.map((deviceSummary) => (
              <DeviceCard
                key={deviceSummary.device.wwn}
                deviceSummary={deviceSummary}
                settings={settings}
                threshold={threshold}
                t={t}
                variant="mobile"
                onAction={(payload) => setConfirmState(payload)}
                onNavigate={(href) => router.push(href)}
              />
            ))}
          </div>
        </div>
      ))}

      <ConfirmActionDialog
        open={!!confirmState}
        title={confirmState?.label ?? ""}
        description={
          confirmState?.action === "delete"
            ? t("device.actions.delete_warning")
            : confirmState?.action === "archive"
            ? t("device.actions.archive_confirm")
            : t("device.actions.unarchive_confirm")
        }
        confirmLabel={t("device.actions.confirm")}
        cancelLabel={t("device.actions.cancel")}
        confirmVariant="destructive"
        onConfirm={handleConfirm}
        onCancel={() => setConfirmState(null)}
      />
    </div>
  );
}
