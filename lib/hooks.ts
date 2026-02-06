"use client";

import { useEffect, useRef, useState } from "react";
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

interface ElementSizeOptions {
  debounceMs?: number;
  enabled?: boolean;
}

export function useElementSize<T extends HTMLElement>(options: ElementSizeOptions = {}) {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const { debounceMs = 0, enabled = true } = options;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled || !ref.current) return;
    const element = ref.current;
    const updateSize = () => {
      const { width, height } = element.getBoundingClientRect();
      if (debounceMs > 0) {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          setSize({ width, height });
        }, debounceMs);
      } else {
        setSize({ width, height });
      }
    };
    const raf = requestAnimationFrame(updateSize);
    const rafRetry = requestAnimationFrame(() => {
      const { width, height } = element.getBoundingClientRect();
      if (width === 0 || height === 0) updateSize();
    });
    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => updateSize());
      observer.observe(element);
    } else {
      window.addEventListener("resize", updateSize);
    }
    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(rafRetry);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (observer) observer.disconnect();
      else window.removeEventListener("resize", updateSize);
    };
  }, [debounceMs, enabled]);

  return { ref, size };
}
