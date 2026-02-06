"use client";

import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
import { SmartModel, TemperatureUnit } from "@/lib/types";
import { formatDateTime, formatTemperature } from "@/lib/format";

interface SmartChartProps {
  data: SmartModel[];
  unit: TemperatureUnit;
}

export function SmartChart({ data, unit }: SmartChartProps) {
  const { t } = useI18n();
  const series = data
    .map((entry) => ({
      date: entry.date,
      temp: entry.temp,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle>{t("device.smart_history")}</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <LineChart data={series} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="date"
              tickFormatter={(value) => formatDateTime(value)}
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
            />
            <YAxis
              tickFormatter={(value) => formatTemperature(value, unit)}
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
            />
            <Tooltip
              formatter={(value) => formatTemperature(Number(value), unit)}
              labelFormatter={(label) => formatDateTime(label)}
            />
            <Line type="monotone" dataKey="temp" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
