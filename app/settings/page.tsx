"use client";

import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useI18n } from "@/lib/i18n";
import { useHealth, useSettings } from "@/lib/hooks";
import { saveSettings, sendTestNotification } from "@/lib/api";
import {
  AppConfig,
  MetricsNotifyLevel,
  MetricsStatusFilterAttributes,
  MetricsStatusThreshold,
} from "@/lib/types";

export default function SettingsPage() {
  const { t } = useI18n();
  const settings = useSettings();
  const health = useHealth();
  const [draft, setDraft] = useState<AppConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [testingNotify, setTestingNotify] = useState(false);

  useEffect(() => {
    if (settings.data) {
      setDraft(settings.data);
    }
  }, [settings.data]);

  const update = (next: Partial<AppConfig>) => {
    setDraft((prev) => ({ ...(prev ?? {}), ...next }));
  };

  const updateMetrics = (next: Partial<AppConfig["metrics"]>) => {
    setDraft((prev) => ({
      ...(prev ?? {}),
      metrics: { ...(prev?.metrics ?? {}), ...next },
    }));
  };
  const updateCollector = (next: Partial<AppConfig["collector"]>) => {
    setDraft((prev) => ({
      ...(prev ?? {}),
      collector: { ...(prev?.collector ?? {}), ...next },
    }));
  };

  const handleSave = async () => {
    if (!draft) return;
    try {
      setSaving(true);
      await saveSettings(draft);
      await settings.mutate();
      toast.success(t("settings.actions.saved"));
    } catch {
      toast.error(t("settings.actions.failed"));
    } finally {
      setSaving(false);
    }
  };

  const handleTestNotify = async () => {
    try {
      setTestingNotify(true);
      await sendTestNotification();
      toast.success(t("settings.health.notify_success"));
    } catch {
      toast.error(t("settings.health.notify_failed"));
    } finally {
      setTestingNotify(false);
    }
  };

  if (settings.error) {
    return (
      <Card className="glass-panel">
        <CardContent className="space-y-4 p-6">
          <p className="text-sm text-muted-foreground">{String(settings.error)}</p>
          <Button onClick={() => settings.mutate()}>{t("common.retry")}</Button>
        </CardContent>
      </Card>
    );
  }

  if (!draft) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">{t("settings.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("settings.subtitle")}</p>
      </div>

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>{t("settings.health.title")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase text-muted-foreground">{t("settings.health.status")}</p>
            {health.isLoading ? (
              <Skeleton className="mt-2 h-6 w-28" />
            ) : health.error ? (
              <p className="mt-2 text-sm font-semibold text-rose-600">
                {t("settings.health.unhealthy")}
              </p>
            ) : (
              <p className="mt-2 text-sm font-semibold text-emerald-600">
                {health.data ? t("settings.health.healthy") : t("settings.health.unhealthy")}
              </p>
            )}
          </div>
          <Button onClick={handleTestNotify} disabled={testingNotify} className="md:self-end">
            {testingNotify ? t("settings.health.notify_sending") : t("settings.health.notify")}
          </Button>
        </CardContent>
      </Card>

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>{t("settings.metrics")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs uppercase text-muted-foreground">{t("settings.metrics.notify")}</label>
            <Select
              value={String(draft.metrics?.notify_level ?? MetricsNotifyLevel.Fail)}
              onValueChange={(value) => updateMetrics({ notify_level: Number(value) })}
            >
              <SelectTrigger className="mt-2 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={String(MetricsNotifyLevel.Warn)}>{t("settings.metrics.warn")}</SelectItem>
                <SelectItem value={String(MetricsNotifyLevel.Fail)}>{t("settings.metrics.fail")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs uppercase text-muted-foreground">{t("settings.metrics.threshold")}</label>
            <Select
              value={String(draft.metrics?.status_threshold ?? MetricsStatusThreshold.Both)}
              onValueChange={(value) => updateMetrics({ status_threshold: Number(value) })}
            >
              <SelectTrigger className="mt-2 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={String(MetricsStatusThreshold.Smart)}>{t("settings.metrics.threshold_smart")}</SelectItem>
                <SelectItem value={String(MetricsStatusThreshold.Scrutiny)}>
                  {t("settings.metrics.threshold_scrutiny")}
                </SelectItem>
                <SelectItem value={String(MetricsStatusThreshold.Both)}>{t("settings.metrics.threshold_both")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs uppercase text-muted-foreground">{t("settings.metrics.repeat")}</label>
            <div className="mt-2 flex items-center gap-2">
              <Switch
                checked={draft.metrics?.repeat_notifications ?? false}
                onCheckedChange={(value) => updateMetrics({ repeat_notifications: value })}
              />
              <span className="text-sm">{draft.metrics?.repeat_notifications ? t("common.on") : t("common.off")}</span>
            </div>
          </div>
          <div>
            <label className="text-xs uppercase text-muted-foreground">{t("settings.metrics.filter")}</label>
            <Select
              value={String(draft.metrics?.status_filter_attributes ?? MetricsStatusFilterAttributes.All)}
              onValueChange={(value) => updateMetrics({ status_filter_attributes: Number(value) })}
            >
              <SelectTrigger className="mt-2 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={String(MetricsStatusFilterAttributes.All)}>{t("settings.metrics.filter_all")}</SelectItem>
                <SelectItem value={String(MetricsStatusFilterAttributes.Critical)}>
                  {t("settings.metrics.filter_critical")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>{t("settings.display")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs uppercase text-muted-foreground">{t("settings.display.dashboard_display")}</label>
            <Select
              value={draft.dashboard_display ?? "name"}
              onValueChange={(value) => update({ dashboard_display: value as AppConfig["dashboard_display"] })}
            >
              <SelectTrigger className="mt-2 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">{t("settings.display.name")}</SelectItem>
                <SelectItem value="serial_id">{t("settings.display.serial_id")}</SelectItem>
                <SelectItem value="uuid">{t("settings.display.uuid")}</SelectItem>
                <SelectItem value="label">{t("settings.display.label")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs uppercase text-muted-foreground">{t("settings.display.dashboard_sort")}</label>
            <Select
              value={draft.dashboard_sort ?? "status"}
              onValueChange={(value) => update({ dashboard_sort: value as AppConfig["dashboard_sort"] })}
            >
              <SelectTrigger className="mt-2 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="status">{t("settings.display.status")}</SelectItem>
                <SelectItem value="title">{t("settings.display.title")}</SelectItem>
                <SelectItem value="age">{t("settings.display.age")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs uppercase text-muted-foreground">{t("settings.display.temperature_unit")}</label>
            <Select
              value={draft.temperature_unit ?? "celsius"}
              onValueChange={(value) => update({ temperature_unit: value as AppConfig["temperature_unit"] })}
            >
              <SelectTrigger className="mt-2 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="celsius">{t("settings.display.celsius")}</SelectItem>
                <SelectItem value="fahrenheit">{t("settings.display.fahrenheit")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs uppercase text-muted-foreground">{t("settings.display.file_size")}</label>
            <div className="mt-2 flex items-center gap-2">
              <Switch
                checked={draft.file_size_si_units ?? false}
                onCheckedChange={(value) => update({ file_size_si_units: value })}
              />
              <span className="text-sm">{draft.file_size_si_units ? t("settings.display.si") : t("settings.display.binary")}</span>
            </div>
          </div>
          <div>
            <label className="text-xs uppercase text-muted-foreground">{t("settings.display.powered_on")}</label>
            <Select
              value={draft.powered_on_hours_unit ?? "humanize"}
              onValueChange={(value) => update({ powered_on_hours_unit: value as AppConfig["powered_on_hours_unit"] })}
            >
              <SelectTrigger className="mt-2 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="humanize">{t("settings.display.humanize")}</SelectItem>
                <SelectItem value="device_hours">{t("settings.display.hours")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs uppercase text-muted-foreground">{t("settings.display.line_stroke")}</label>
            <Select
              value={draft.line_stroke ?? "smooth"}
              onValueChange={(value) => update({ line_stroke: value as AppConfig["line_stroke"] })}
            >
              <SelectTrigger className="mt-2 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="smooth">{t("settings.display.smooth")}</SelectItem>
                <SelectItem value="straight">{t("settings.display.straight")}</SelectItem>
                <SelectItem value="stepline">{t("settings.display.step")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>{t("settings.collector.title")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="flex items-center gap-2">
              <label
                htmlFor="collector-discard-sct-temp-history"
                className="text-xs uppercase text-muted-foreground"
              >
                {t("settings.collector.discard_sct_temp_history")}
              </label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
                      aria-label={t("settings.collector.discard_sct_temp_history")}
                    >
                      <Info className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs text-xs">
                    {t("settings.collector.discard_sct_temp_history_help")}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Switch
                id="collector-discard-sct-temp-history"
                checked={draft.collector?.discard_sct_temp_history ?? false}
                aria-label={t("settings.collector.discard_sct_temp_history")}
                onCheckedChange={(value) => updateCollector({ discard_sct_temp_history: value })}
              />
              <span className="text-sm">
                {draft.collector?.discard_sct_temp_history ? t("common.on") : t("common.off")}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full md:w-auto">
        {saving ? t("settings.actions.saving") : t("settings.actions.save")}
      </Button>
    </div>
  );
}
