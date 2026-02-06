"use client";

import dynamic from "next/dynamic";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/lib/i18n";
import { DURATION_KEYS, DurationKey } from "@/lib/constants";
import { DeviceSummaryModel, SmartTemperatureModel, TemperatureUnit } from "@/lib/types";

const TempChart = dynamic(() => import("@/components/dashboard/temp-chart").then((mod) => mod.TempChart), {
  ssr: false,
  loading: () => <Skeleton className="h-64" />,
});

interface TempChartSectionProps {
  isDesktop: boolean | null;
  durationKey: DurationKey;
  onDurationChange: (value: DurationKey) => void;
  tempData?: Record<string, SmartTemperatureModel[]>;
  unit: TemperatureUnit;
  summary: Record<string, DeviceSummaryModel>;
  dashboardDisplay: "name" | "serial_id" | "uuid" | "label";
  tempOpen: string;
  onTempOpenChange: (value: string) => void;
}

export function TempChartSection({
  isDesktop,
  durationKey,
  onDurationChange,
  tempData,
  unit,
  summary,
  dashboardDisplay,
  tempOpen,
  onTempOpenChange,
}: TempChartSectionProps) {
  const { t } = useI18n();

  if (isDesktop === null) {
    return (
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>{t("dashboard.temp.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64" />
        </CardContent>
      </Card>
    );
  }

  const durationSelect = (
    <Select value={durationKey} onValueChange={(value) => onDurationChange(value as DurationKey)}>
      <SelectTrigger className={isDesktop ? "w-full md:w-40" : "w-full"}>
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
  );

  const chartContent = tempData ? (
    <TempChart
      tempHistory={tempData}
      unit={unit}
      summary={summary}
      dashboardDisplay={dashboardDisplay}
      durationKey={durationKey}
    />
  ) : (
    <Skeleton className="h-64" />
  );

  if (isDesktop) {
    return (
      <Card className="glass-panel">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>{t("dashboard.temp.title")}</CardTitle>
          </div>
          {durationSelect}
        </CardHeader>
        <CardContent>{chartContent}</CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle>{t("dashboard.temp.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {durationSelect}
        <Accordion type="single" collapsible value={tempOpen} onValueChange={onTempOpenChange}>
          <AccordionItem value="temp">
            <AccordionTrigger>{t("dashboard.temp.title")}</AccordionTrigger>
            <AccordionContent>
              {tempOpen === "temp" ? chartContent : null}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
