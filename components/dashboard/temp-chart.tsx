"use client";

import { useEffect, useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip } from "recharts";

import { Button } from "@/components/ui/button";
import { ChartContainer } from "@/components/ui/chart-container";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useI18n } from "@/lib/i18n";
import { DeviceSummaryModel, SmartTemperatureModel, TemperatureUnit } from "@/lib/types";
import { DurationKey } from "@/lib/constants";
import { deviceTitleWithFallback, formatDateTime, formatTemperature } from "@/lib/format";

interface TempChartProps {
  tempHistory: Record<string, SmartTemperatureModel[]>;
  unit: TemperatureUnit;
  summary: Record<string, DeviceSummaryModel>;
  dashboardDisplay: "name" | "serial_id" | "uuid" | "label";
  durationKey: DurationKey;
}

type ChartRow = { date: string } & Record<string, number | string | null>;

function buildSeries(history: Record<string, SmartTemperatureModel[]>) {
  const dates = new Map<string, ChartRow>();
  Object.entries(history).forEach(([wwn, series]) => {
    series.forEach((point) => {
      const row = dates.get(point.date) ?? { date: point.date };
      row[wwn] = point.temp;
      dates.set(point.date, row);
    });
  });
  return Array.from(dates.values()).sort(
    (a, b) => new Date(a.date as string).getTime() - new Date(b.date as string).getTime()
  );
}

const palette = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-1) / 0.6)",
  "hsl(var(--chart-2) / 0.6)",
  "hsl(var(--chart-3) / 0.6)",
  "hsl(var(--chart-4) / 0.6)",
  "hsl(var(--chart-5) / 0.6)",
  "hsl(var(--chart-1) / 0.35)",
  "hsl(var(--chart-2) / 0.35)",
];

function formatTickByDuration(value: string, durationKey: TempChartProps["durationKey"]) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  if (durationKey === "week" || durationKey === "month") {
    return new Intl.DateTimeFormat(undefined, { month: "2-digit", day: "2-digit" }).format(date);
  }
  if (durationKey === "year") {
    return new Intl.DateTimeFormat(undefined, { month: "short", year: "2-digit" }).format(date);
  }
  return new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short" }).format(date);
}

export function TempChart({ tempHistory, unit, summary, dashboardDisplay, durationKey }: TempChartProps) {
  const { t } = useI18n();
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsClient(true);
  }, []);

  const deviceKeys = useMemo(
    () => Object.keys(tempHistory).filter((key) => tempHistory[key]?.length),
    [tempHistory]
  );
  const data = useMemo(() => buildSeries(tempHistory), [tempHistory]);

  const defaultVisible = useMemo(() => {
    const averages = deviceKeys.map((key) => {
      const series = tempHistory[key] ?? [];
      const avg =
        series.reduce((sum, point) => sum + point.temp, 0) / Math.max(series.length, 1);
      return { key, avg };
    });
    averages.sort((a, b) => b.avg - a.avg);
    const topKeys = averages.slice(0, 3).map((item) => item.key);
    return Object.fromEntries(deviceKeys.map((key) => [key, topKeys.includes(key)]));
  }, [deviceKeys, tempHistory]);

  const resolvedVisibility = useMemo(
    () => ({
      ...defaultVisible,
      ...visible,
    }),
    [defaultVisible, visible]
  );

  const labelFor = (wwn: string) =>
    summary[wwn]?.device ? deviceTitleWithFallback(summary[wwn].device, dashboardDisplay) : wwn;
  const shortLabelFor = (wwn: string) => {
    const label = labelFor(wwn);
    const parts = label.split(" - ");
    const shortLabel = parts.slice(-1)[0] ?? label;
    return shortLabel.length > 28 ? `${shortLabel.slice(0, 28)}…` : shortLabel;
  };

  const toggleKey = (key: string) => {
    setVisible((prev) => ({ ...prev, [key]: !resolvedVisibility[key] }));
  };

  const yDomain = useMemo(() => {
    const values: number[] = [];
    deviceKeys.forEach((key) => {
      if (!resolvedVisibility[key]) return;
      (tempHistory[key] ?? []).forEach((point) => values.push(point.temp));
    });
    if (values.length === 0) return undefined;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = Math.max(1, (max - min) * 0.1);
    return [min - padding, max + padding] as [number, number];
  }, [deviceKeys, resolvedVisibility, tempHistory]);

  if (!isClient) {
    return <div className="h-72 w-full min-w-0" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setVisible(Object.fromEntries(deviceKeys.map((key) => [key, true])))}
        >
          {t("dashboard.temp.all")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setVisible(Object.fromEntries(deviceKeys.map((key) => [key, false])))}
        >
          {t("dashboard.temp.none")}
        </Button>
        {deviceKeys.map((wwn, index) => {
          const isVisible = resolvedVisibility[wwn];
          return (
            <TooltipProvider key={wwn}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isVisible ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => toggleKey(wwn)}
                    className="max-w-full"
                  >
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ background: palette[index % palette.length] }}
                    />
                    <span className="max-w-[12rem] truncate md:max-w-[18rem]">{shortLabelFor(wwn)}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{labelFor(wwn)}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
      <ChartContainer className="h-72 w-full" debounceMs={80}>
        {(containerSize) => (
          <LineChart
            data={data}
            width={containerSize.width}
            height={containerSize.height}
            margin={{ top: 12, right: 12, left: 0, bottom: 0 }}
          >
            <XAxis
              dataKey="date"
              tickFormatter={(value) => formatTickByDuration(value, durationKey)}
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
            />
            <YAxis
              domain={yDomain ?? ["auto", "auto"]}
              tickFormatter={(value) => formatTemperature(value, unit)}
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
            />
            <RechartsTooltip
              content={({ label, payload }) => {
                if (!payload?.length) return null;
                return (
                  <div className="rounded-md border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
                    <div className="mb-2 font-semibold">{formatDateTime(String(label))}</div>
                    <div className="space-y-1">
                      {payload.map((item) => (
                        <div key={String(item.dataKey)} className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ background: String(item.color) }}
                          />
                          <span className="truncate">{labelFor(String(item.dataKey))}</span>
                          <span className="ml-auto font-medium">
                            {formatTemperature(Number(item.value), unit)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }}
            />
            {deviceKeys.map((wwn, index) =>
              resolvedVisibility[wwn] ? (
                <Line
                  key={wwn}
                  type="monotone"
                  dataKey={wwn}
                  name={labelFor(wwn)}
                  stroke={palette[index % palette.length]}
                  strokeWidth={2}
                  strokeOpacity={0.9}
                  activeDot={{ r: 4 }}
                  dot={false}
                />
              ) : null
            )}
          </LineChart>
        )}
      </ChartContainer>
    </div>
  );
}
