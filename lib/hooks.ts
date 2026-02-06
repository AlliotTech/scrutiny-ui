"use client";

import useSWR from "swr";

import { getDeviceDetails, getHealth, getSettings, getSummary, getSummaryTemp } from "@/lib/api";
import { AppConfig, DeviceDetailsResponseWrapper, DeviceSummaryModel, SmartTemperatureModel } from "@/lib/types";

export function useSummary() {
  return useSWR<Record<string, DeviceSummaryModel>>("/api/summary", () => getSummary(), {
    revalidateOnFocus: false,
  });
}

export function useSummaryTemp(durationKey: string) {
  return useSWR<Record<string, SmartTemperatureModel[]>>(
    ["/api/summary/temp", durationKey],
    () => getSummaryTemp(durationKey),
    { revalidateOnFocus: false }
  );
}

export function useDeviceDetails(wwn: string, durationKey: string) {
  return useSWR<DeviceDetailsResponseWrapper>(["/api/device/details", wwn, durationKey], () =>
    getDeviceDetails(wwn, durationKey)
  );
}

export function useSettings() {
  return useSWR<AppConfig>("/api/settings", () => getSettings(), {
    revalidateOnFocus: false,
  });
}

export function useHealth() {
  return useSWR<boolean>("/api/health", () => getHealth(), {
    revalidateOnFocus: false,
  });
}
