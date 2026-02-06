"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, Download, Trash2, Undo2 } from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";

import { DeviceSummary } from "@/components/device/device-summary";
import { AttributeTable } from "@/components/device/attribute-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/lib/i18n";
import { useDeviceDetails, useSettings } from "@/lib/hooks";
import { deviceTitleWithFallback } from "@/lib/format";
import { archiveDevice, deleteDevice, unarchiveDevice } from "@/lib/api";
import { DurationKey, DURATION_KEYS } from "@/lib/constants";

const SmartChart = dynamic(() => import("@/components/device/smart-chart").then((mod) => mod.SmartChart), {
  ssr: false,
  loading: () => <Skeleton className="h-72" />,
});

interface DeviceDetailClientProps {
  wwn: string;
}

export function DeviceDetailClient({ wwn }: DeviceDetailClientProps) {
  const router = useRouter();
  const { t } = useI18n();
  const [durationKey, setDurationKey] = useState<DurationKey>("month");
  const [confirmState, setConfirmState] = useState<"archive" | "unarchive" | "delete" | null>(null);

  const details = useDeviceDetails(wwn, durationKey);
  const settings = useSettings();

  const latestSmart = details.data?.data.smart_results?.[0];

  const handleAction = async () => {
    if (!details.data) return;
    try {
      if (confirmState === "archive") {
        await archiveDevice(wwn);
      }
      if (confirmState === "unarchive") {
        await unarchiveDevice(wwn);
      }
      if (confirmState === "delete") {
        await deleteDevice(wwn);
        router.push("/");
      }
      toast.success(t("toast.success"));
      details.mutate();
    } catch {
      toast.error(t("toast.error"));
    } finally {
      setConfirmState(null);
    }
  };

  const handleExport = () => {
    if (!details.data) return;
    const payload = {
      device: details.data.data.device,
      smart_latest: latestSmart ?? null,
      attributes: latestSmart?.attrs ?? {},
      metadata: details.data.metadata,
      exported_at: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `device-${wwn}-attributes.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success(t("device.export_success"));
  };

  const title = useMemo(() => {
    if (!details.data) return t("device.title");
    return deviceTitleWithFallback(details.data.data.device, settings.data?.dashboard_display ?? "name");
  }, [details.data, settings.data?.dashboard_display, t]);

  if (details.error) {
    return (
      <Card className="glass-panel">
        <CardContent className="space-y-4 p-6">
          <p className="text-sm text-muted-foreground">{String(details.error)}</p>
          <Button onClick={() => details.mutate()}>{t("common.retry")}</Button>
        </CardContent>
      </Card>
    );
  }

  if (!details.data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24" />
        <Skeleton className="h-72" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">{title}</h1>
          <p className="text-sm text-muted-foreground">{wwn}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={durationKey} onValueChange={(value) => setDurationKey(value as typeof durationKey)}>
            <SelectTrigger className="w-full md:w-36">
              <SelectValue placeholder={t("dashboard.temp.duration")} />
            </SelectTrigger>
            <SelectContent>
              {DURATION_KEYS.map((key) => (
                <SelectItem key={key} value={key}>
                  {t(`dashboard.duration.${key}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4" />
            {t("device.export")}
          </Button>
          <Button
            variant="secondary"
            onClick={() => setConfirmState(details.data?.data.device.archived ? "unarchive" : "archive")}
          >
            {details.data?.data.device.archived ? (
              <>
                <Undo2 className="h-4 w-4" />
                {t("device.actions.unarchive")}
              </>
            ) : (
              <>
                <Archive className="h-4 w-4" />
                {t("device.actions.archive")}
              </>
            )}
          </Button>
          <Button variant="destructive" onClick={() => setConfirmState("delete")}
          >
            <Trash2 className="h-4 w-4" />
            {t("device.actions.delete")}
          </Button>
        </div>
      </div>

      <DeviceSummary device={details.data.data.device} smart={latestSmart} settings={settings.data} />

      <Card className="glass-panel">
        <CardContent className="space-y-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase text-muted-foreground">{t("device.temperature_history")}</p>
              <p className="text-lg font-semibold">{t("device.temp_last")}</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>{t("device.temp_normal")}</span>
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span>{t("device.temp_warn")}</span>
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              <span>{t("device.temp_critical")}</span>
            </div>
          </div>
          <SmartChart
            data={details.data.data.smart_results}
            unit={settings.data?.temperature_unit ?? "celsius"}
          />
        </CardContent>
      </Card>

      <AttributeTable
        attrs={details.data.data.smart_results?.[0]?.attrs ?? {}}
        metadata={details.data.metadata}
        deviceProtocol={details.data.data.device.device_protocol}
        smartResults={details.data.data.smart_results ?? []}
        settings={settings.data}
      />

      <Dialog open={confirmState !== null} onOpenChange={(open) => !open && setConfirmState(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmState === "delete"
                ? t("device.actions.delete")
                : confirmState === "archive"
                  ? t("device.actions.archive")
                  : t("device.actions.unarchive")}
            </DialogTitle>
            <DialogDescription>
              {confirmState === "delete"
                ? t("device.dialog.delete")
                : confirmState === "archive"
                  ? t("device.dialog.archive")
                  : t("device.dialog.unarchive")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmState(null)}>
              {t("common.cancel")}
            </Button>
            <Button variant={confirmState === "delete" ? "destructive" : "default"} onClick={handleAction}>
              {t("common.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
