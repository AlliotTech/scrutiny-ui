"use client";

import { useEffect, useState } from "react";
import { RefreshCcw } from "lucide-react";

import { SummaryCards } from "@/components/dashboard/summary-cards";
import { DeviceList } from "@/components/dashboard/device-list";
import { DeviceListMobile } from "@/components/dashboard/device-list-mobile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/lib/i18n";
import { useSettings, useSummary, useSummaryTemp } from "@/lib/hooks";
import { toast } from "sonner";
import { DurationKey } from "@/lib/constants";
import { TempChartSection } from "@/components/dashboard/temp-chart-section";

export default function DashboardPage() {
  const { t } = useI18n();
  const [durationKey, setDurationKey] = useState<DurationKey>("month");
  const [showArchived, setShowArchived] = useState(false);
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const [tempOpen, setTempOpen] = useState<string>("");

  const summary = useSummary();
  const temp = useSummaryTemp(durationKey);
  const settings = useSettings();

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const handleRefresh = async () => {
    const toastId = toast.loading(t("dashboard.refreshing"));
    try {
      await Promise.all([summary.mutate(), temp.mutate()]);
      toast.success(t("dashboard.refreshed"), { id: toastId });
    } catch {
      toast.error(t("toast.error"), { id: toastId });
    }
  };

  const isRefreshing = summary.isValidating || temp.isValidating;

  if (summary.error) {
    return (
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>{t("dashboard.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{String(summary.error)}</p>
          <Button onClick={handleRefresh}>{t("common.retry")}</Button>
        </CardContent>
      </Card>
    );
  }

  if (!summary.data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/2" />
        <div className="grid gap-4 md:grid-cols-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const deviceEntries = Object.values(summary.data ?? {});
  if (deviceEntries.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">{t("dashboard.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("dashboard.subtitle")}</p>
        </div>
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>{t("dashboard.empty.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>{t("dashboard.empty.body")}</p>
            <div className="rounded-md border bg-muted/30 p-3 font-mono text-xs text-foreground">
              {t("dashboard.empty.command")}
            </div>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              aria-label={t("common.retry")}
            >
              <RefreshCcw className={isRefreshing ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
              <span className="ml-2">{t("common.retry")}</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">{t("dashboard.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("dashboard.subtitle")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            aria-label={t("common.retry")}
            disabled={isRefreshing}
          >
            <RefreshCcw className={isRefreshing ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
          </Button>
          <div className="flex items-center gap-2 text-sm">
            <Switch checked={showArchived} onCheckedChange={setShowArchived} />
            <span>{t("dashboard.filter.show_archived")}</span>
          </div>
        </div>
      </div>

      <SummaryCards summary={summary.data} threshold={settings.data?.metrics?.status_threshold} />

      <TempChartSection
        isDesktop={isDesktop}
        durationKey={durationKey}
        onDurationChange={setDurationKey}
        tempData={temp.data}
        unit={settings.data?.temperature_unit ?? "celsius"}
        summary={summary.data}
        dashboardDisplay={settings.data?.dashboard_display ?? "name"}
        tempOpen={tempOpen}
        onTempOpenChange={setTempOpen}
      />

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{t("dashboard.devices.title")}</h2>
        {isDesktop === null ? (
          <Skeleton className="h-40" />
        ) : isDesktop ? (
          <DeviceList
            summary={summary.data}
            settings={settings.data}
            showArchived={showArchived}
            onAction={handleRefresh}
          />
        ) : (
          <DeviceListMobile
            summary={summary.data}
            settings={settings.data}
            showArchived={showArchived}
            onAction={handleRefresh}
          />
        )}
      </div>
    </div>
  );
}
