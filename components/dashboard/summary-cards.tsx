"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import { DeviceSummaryModel, MetricsStatusThreshold } from "@/lib/types";
import { deviceStatusForModelWithThreshold } from "@/lib/format";

interface SummaryCardsProps {
  summary: Record<string, DeviceSummaryModel>;
  threshold?: MetricsStatusThreshold;
}

export function SummaryCards({ summary, threshold = MetricsStatusThreshold.Both }: SummaryCardsProps) {
  const { t } = useI18n();
  const devices = Object.values(summary);
  const total = devices.length;
  const archived = devices.filter((device) => device.device.archived).length;
  const failed = devices.filter((device) =>
    deviceStatusForModelWithThreshold(device.device, !!device.smart, threshold).startsWith("failed")
  ).length;
  const passed = devices.filter((device) =>
    deviceStatusForModelWithThreshold(device.device, !!device.smart, threshold) === "passed"
  ).length;

  const cards = [
    { label: t("dashboard.summary.total"), value: total },
    { label: t("dashboard.summary.archived"), value: archived },
    { label: t("dashboard.summary.failed"), value: failed },
    { label: t("dashboard.summary.passed"), value: passed },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className="glass-panel border-muted">
          <CardContent className="flex flex-col gap-2 pt-6">
            <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{card.label}</span>
            <div className="flex items-baseline justify-between">
              <span className="text-4xl font-semibold tracking-tight">{card.value}</span>
              <Badge variant="outline">{Math.round((card.value / Math.max(total, 1)) * 100)}%</Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
