"use client";

import { Fragment, useMemo, useState } from "react";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import { ArrowUpDown, Info } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useI18n } from "@/lib/i18n";
import {
  AppConfig,
  AttributeMetadataModel,
  MetricsStatusFilterAttributes,
  SmartAttributeModel,
  SmartModel,
} from "@/lib/types";
import {
  attributeStatusKind,
  attributeStatusName,
  attributeScrutinyStatus,
  attributeSmartStatus,
  attributeStatusColor,
  formatAttributeIdeal,
  formatAttributeThreshold,
  formatAttributeValue,
  formatAttributeWorst,
  formatPercent,
  isAtaProtocol,
  toHexId,
} from "@/lib/format";
import { cn } from "@/lib/utils";

interface AttributeTableProps {
  attrs: Record<string, SmartAttributeModel>;
  metadata: Record<string, AttributeMetadataModel>;
  deviceProtocol?: string;
  smartResults?: SmartModel[];
  settings?: AppConfig;
}

type SortKey = "status" | "id" | "name" | "value" | "worst" | "threshold" | "ideal" | "failure";

interface SortableHeadProps {
  label: string;
  sort: SortKey;
  className?: string;
  active: boolean;
  onSort: (sort: SortKey) => void;
}

function SortableHead({ label, sort, className, active, onSort }: SortableHeadProps) {
  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => onSort(sort)}
        className={cn(
          "group inline-flex items-center gap-1 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground",
          active && "text-foreground"
        )}
      >
        <span>{label}</span>
        <ArrowUpDown className={cn("h-3.5 w-3.5 opacity-40", active && "opacity-90")} />
      </button>
    </TableHead>
  );
}

export function AttributeTable({
  attrs,
  metadata,
  deviceProtocol,
  smartResults = [],
  settings,
}: AttributeTableProps) {
  const { t } = useI18n();
  const defaultFilterMode =
    settings?.metrics?.status_filter_attributes === MetricsStatusFilterAttributes.Critical
      ? "critical"
      : "all";
  const [filterOverride, setFilterOverride] = useState<"critical" | "all" | null>(null);
  const filterMode = filterOverride ?? defaultFilterMode;
  const onlyCritical = filterMode === "critical";
  const rows = Object.values(attrs);
  const isAta = isAtaProtocol(deviceProtocol);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const protocol = (deviceProtocol ?? "").toUpperCase();
  const showId = protocol === "ATA";
  const showIdeal = protocol !== "SCSI";
  const showFailure = protocol === "ATA";

  const historyMap = useMemo(() => {
    if (!smartResults.length) return new Map<string, Array<{ value: number }>>();
    const map = new Map<string, Array<{ value: number }>>();
    const sorted = [...smartResults].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    sorted.forEach((entry) => {
      Object.values(entry.attrs || {}).forEach((attr) => {
        const key = String(attr.attribute_id);
        const value = formatAttributeValue(attr, metadata[key], isAta);
        if (value === undefined || value === null || Number.isNaN(Number(value))) return;
        const list = map.get(key) ?? [];
        list.push({ value: Number(value) });
        map.set(key, list);
      });
    });
    return map;
  }, [isAta, metadata, smartResults]);

  const filteredRows = rows.filter((attr) => {
    if (!onlyCritical) return true;
    const meta = metadata[String(attr.attribute_id)];
    if (meta?.critical) return true;
    if (attr.thresh !== undefined && attr.thresh !== null && attr.value !== undefined) {
      return attr.value < attr.thresh;
    }
    return false;
  });

  const sortedRows = useMemo(() => {
    if (!sortKey) return filteredRows;
    const statusRank: Record<string, number> = {
      failed: 0,
      warn: 1,
      passed: 2,
      unknown: 3,
    };
    const parseIdeal = (value?: string) => {
      if (!value) return null;
      const parsed = Number.parseFloat(value);
      return Number.isNaN(parsed) ? null : parsed;
    };
    const getValue = (attr: SmartAttributeModel) => {
      const meta = metadata[String(attr.attribute_id)];
      switch (sortKey) {
        case "status":
          return statusRank[attributeStatusKind(attr.status)];
        case "id":
          return Number(attr.attribute_id);
        case "name":
          return (meta?.display_name ?? "").toLowerCase();
        case "value":
          return attr.value ?? null;
        case "worst":
          return attr.worst ?? null;
        case "threshold":
          return attr.thresh ?? null;
        case "ideal":
          return parseIdeal(meta?.ideal);
        case "failure":
          return attr.failure_rate ?? null;
        default:
          return null;
      }
    };
    const compareValues = (aValue: unknown, bValue: unknown) => {
      if (aValue === null || aValue === undefined) return bValue === null || bValue === undefined ? 0 : 1;
      if (bValue === null || bValue === undefined) return -1;
      if (typeof aValue === "number" && typeof bValue === "number") return aValue - bValue;
      return String(aValue).localeCompare(String(bValue), undefined, { numeric: true, sensitivity: "base" });
    };
    return [...filteredRows].sort((a, b) => {
      const result = compareValues(getValue(a), getValue(b));
      return sortDir === "asc" ? result : -result;
    });
  }, [filteredRows, metadata, sortDir, sortKey]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir("asc");
  };

  return (
    <Card className="glass-panel">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle>{t("device.attributes")}</CardTitle>
        <Tabs
          value={filterMode}
          onValueChange={(value) => setFilterOverride(value as "critical" | "all")}
        >
          <TabsList className="h-8 gap-1 rounded-full bg-muted/60 p-1">
            <TabsTrigger
              value="critical"
              className="h-6 rounded-full px-3 text-xs data-[state=active]:bg-background data-[state=active]:shadow-xs"
            >
              {t("table.show_critical")}
            </TabsTrigger>
            <TabsTrigger
              value="all"
              className="h-6 rounded-full px-3 text-xs data-[state=active]:bg-background data-[state=active]:shadow-xs"
            >
              {t("table.show_all")}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table className="table-fixed min-w-[900px] w-full">
          <TableHeader>
            <TableRow>
              <SortableHead
                label={t("table.status")}
                sort="status"
                className="w-[88px]"
                active={sortKey === "status"}
                onSort={handleSort}
              />
              {showId && (
                <SortableHead
                  label={t("table.id")}
                  sort="id"
                  className="w-[84px]"
                  active={sortKey === "id"}
                  onSort={handleSort}
                />
              )}
              <SortableHead label={t("table.name")} sort="name" active={sortKey === "name"} onSort={handleSort} />
              <SortableHead
                label={t("table.value")}
                sort="value"
                className="w-[110px]"
                active={sortKey === "value"}
                onSort={handleSort}
              />
              <SortableHead
                label={t("table.worst")}
                sort="worst"
                className="w-[90px]"
                active={sortKey === "worst"}
                onSort={handleSort}
              />
              <SortableHead
                label={t("table.threshold")}
                sort="threshold"
                className="w-[110px]"
                active={sortKey === "threshold"}
                onSort={handleSort}
              />
              {showIdeal && (
                <SortableHead
                  label={t("table.ideal")}
                  sort="ideal"
                  className="w-[90px]"
                  active={sortKey === "ideal"}
                  onSort={handleSort}
                />
              )}
              {showFailure && (
                <TableHead className="w-[140px]">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleSort("failure")}
                      className={cn(
                        "group inline-flex items-center gap-1 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground",
                        sortKey === "failure" && "text-foreground"
                      )}
                    >
                      <span>{t("table.failure")}</span>
                      <ArrowUpDown
                        className={cn("h-3.5 w-3.5 opacity-40", sortKey === "failure" && "opacity-90")}
                      />
                    </button>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="rounded-full border border-border/60 p-1 text-muted-foreground hover:text-foreground"
                              aria-label={t("table.failure_help")}
                            >
                              <Info className="h-3.5 w-3.5" />
                            </button>
                          </TooltipTrigger>
                        <TooltipContent className="max-w-[240px]">
                          {t("table.failure_help")}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableHead>
              )}
              <TableHead className="w-[130px]">{t("table.history")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRows.map((attr) => {
              const meta = metadata[String(attr.attribute_id)];
              const status = attributeStatusName(attr.status);
              const statusKind = attributeStatusKind(attr.status);
              const history = historyMap.get(String(attr.attribute_id)) ?? [];
              const rowId = String(attr.attribute_id);
              const isExpanded = expandedId === rowId;
              return (
                <Fragment key={rowId}>
                  <TableRow
                    className={cn("cursor-pointer", isExpanded && "bg-muted/40")}
                    onClick={() => setExpandedId(isExpanded ? null : rowId)}
                  >
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
                          statusKind === "passed" && "bg-emerald-50 text-emerald-700",
                          statusKind === "warn" && "bg-amber-50 text-amber-700",
                          statusKind === "failed" && "bg-rose-50 text-rose-700",
                          statusKind === "unknown" && "bg-muted text-muted-foreground"
                        )}
                        title={attr.status_reason ?? ""}
                      >
                        {t(`status.${status}`)}
                      </span>
                    </TableCell>
                    {showId && (
                      <TableCell className="whitespace-nowrap">
                        {attr.attribute_id}{" "}
                        <span className="text-xs text-muted-foreground">{toHexId(attr.attribute_id)}</span>
                      </TableCell>
                    )}
                    <TableCell className="truncate" title={meta?.description ?? ""}>
                      <div className="space-y-0.5">
                        <span className="block truncate">{meta?.display_name ?? t("common.unknown")}</span>
                        <p className="text-[11px] text-muted-foreground">{t("table.more")}</p>
                      </div>
                    </TableCell>
                    <TableCell title={meta?.display_type ?? ""}>
                      {formatAttributeValue(attr, meta, isAta) ?? "--"}
                    </TableCell>
                    <TableCell>{formatAttributeWorst(attr, meta) ?? "--"}</TableCell>
                    <TableCell>{formatAttributeThreshold(attr, meta, isAta) ?? "--"}</TableCell>
                    {showIdeal && <TableCell>{formatAttributeIdeal(meta, isAta) ?? "--"}</TableCell>}
                    {showFailure && <TableCell>{formatPercent(attr.failure_rate)}</TableCell>}
                    <TableCell className="min-w-[120px]">
                      {history.length ? (
                        <div className="h-6 w-28">
                          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <LineChart data={history}>
                              <Line
                                type="monotone"
                                dataKey="value"
                                stroke={attributeStatusColor(attr.status)}
                                strokeWidth={1.5}
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        "--"
                      )}
                    </TableCell>
                  </TableRow>
                  {isExpanded && (
                    <TableRow className="bg-muted/30">
                      <TableCell colSpan={5 + (showId ? 1 : 0) + (showIdeal ? 1 : 0) + (showFailure ? 1 : 0)}>
                        <div className="grid gap-3 p-3 text-sm md:grid-cols-3">
                          <div className="md:col-span-2">
                            <p className="text-xs uppercase text-muted-foreground">{t("table.name")}</p>
                            <p>{meta?.display_name ?? t("common.unknown")}</p>
                          </div>
                          <div className="md:col-span-2">
                            <p className="text-xs uppercase text-muted-foreground">{t("table.description")}</p>
                            <p>{meta?.description ?? "--"}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase text-muted-foreground">{t("table.type")}</p>
                            <p>{meta?.display_type ?? "--"}</p>
                          </div>
                        </div>
                        <div className="grid gap-4 border-t p-3 text-sm md:grid-cols-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "h-2 w-2 rounded-full",
                                attributeScrutinyStatus(attr.status) === "failed" && "bg-rose-500",
                                attributeScrutinyStatus(attr.status) === "warn" && "bg-amber-500",
                                attributeScrutinyStatus(attr.status) === "passed" && "bg-emerald-500"
                              )}
                            />
                            <span className="font-medium">{t("table.scrutiny")}</span>
                          </div>
                          <div>
                            <p className="text-xs uppercase text-muted-foreground">{t("table.value")}</p>
                            <p>{formatAttributeValue(attr, meta, isAta) ?? "--"}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase text-muted-foreground">{t("table.worst_threshold")}</p>
                            <p>
                              {formatAttributeWorst(attr, meta) ?? "--"} /{" "}
                              {formatAttributeThreshold(attr, meta, isAta) ?? "--"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase text-muted-foreground">{t("table.failure")}</p>
                            <p>{formatPercent(attr.failure_rate)}</p>
                          </div>
                        </div>
                        <div className="grid gap-4 border-t p-3 text-sm md:grid-cols-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "h-2 w-2 rounded-full",
                                attributeSmartStatus(attr.status) === "failed" && "bg-rose-500",
                                attributeSmartStatus(attr.status) === "passed" && "bg-emerald-500"
                              )}
                            />
                            <span className="font-medium">{t("table.normalized")}</span>
                          </div>
                          <div>
                            <p className="text-xs uppercase text-muted-foreground">{t("table.value")}</p>
                            <p>{attr.value ?? "--"}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase text-muted-foreground">{t("table.worst_threshold")}</p>
                            <p>
                              {formatAttributeWorst(attr, meta) ?? "--"} /{" "}
                              {formatAttributeThreshold(attr, meta, isAta) ?? "--"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase text-muted-foreground">{t("table.raw")}</p>
                            <p>{attr.raw_value ?? "--"}</p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
