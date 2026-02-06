import {
  AppConfig,
  DeviceDetailsResponseWrapper,
  DeviceSummaryResponseWrapper,
  DeviceSummaryTempResponseWrapper,
  HealthResponse,
  SettingsResponseWrapper,
} from "@/lib/types";
import { ensureMswReady } from "@/lib/msw";

class ApiError extends Error {
  status?: number;
  payload?: unknown;

  constructor(message: string, status?: number, payload?: unknown) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

const baseUrl = (process.env.NEXT_PUBLIC_API_BASE ?? "").replace(/\/$/, "");

function withBase(path: string) {
  if (!baseUrl) return path;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  await ensureMswReady();
  const response = await fetch(withBase(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    let payload: unknown = undefined;
    try {
      payload = await response.json();
    } catch {
      payload = undefined;
    }
    throw new ApiError(`Request failed (${response.status})`, response.status, payload);
  }

  const data = (await response.json()) as T;
  return data;
}

export async function getSummary() {
  const response = await apiFetch<DeviceSummaryResponseWrapper>("/api/summary");
  if (!response.success) {
    throw new ApiError("Summary request failed", 500, response.errors);
  }
  return response.data.summary;
}

export async function getSummaryTemp(durationKey: string) {
  const response = await apiFetch<DeviceSummaryTempResponseWrapper>(
    `/api/summary/temp?duration_key=${encodeURIComponent(durationKey)}`
  );
  if (!response.success) {
    throw new ApiError("Summary temp request failed", 500, response.errors);
  }
  return response.data.temp_history;
}

export async function getDeviceDetails(wwn: string, durationKey: string) {
  const response = await apiFetch<DeviceDetailsResponseWrapper>(
    `/api/device/${encodeURIComponent(wwn)}/details?duration_key=${encodeURIComponent(durationKey)}`
  );
  if (!response.success) {
    throw new ApiError("Device details request failed", 500, response.errors);
  }
  return response;
}

export async function archiveDevice(wwn: string) {
  const response = await apiFetch<{ success: boolean }>(`/api/device/${encodeURIComponent(wwn)}/archive`, {
    method: "POST",
    body: JSON.stringify({}),
  });
  if (!response.success) {
    throw new ApiError("Archive request failed", 500, response);
  }
  return response;
}

export async function unarchiveDevice(wwn: string) {
  const response = await apiFetch<{ success: boolean }>(
    `/api/device/${encodeURIComponent(wwn)}/unarchive`,
    {
      method: "POST",
      body: JSON.stringify({}),
    }
  );
  if (!response.success) {
    throw new ApiError("Unarchive request failed", 500, response);
  }
  return response;
}

export async function deleteDevice(wwn: string) {
  const response = await apiFetch<{ success: boolean }>(`/api/device/${encodeURIComponent(wwn)}`, {
    method: "DELETE",
  });
  if (!response.success) {
    throw new ApiError("Delete request failed", 500, response);
  }
  return response;
}

export async function getSettings() {
  const response = await apiFetch<SettingsResponseWrapper>("/api/settings");
  if (!response.success) {
    throw new ApiError("Settings request failed", 500, response);
  }
  return response.settings;
}

export async function saveSettings(settings: AppConfig) {
  const response = await apiFetch<SettingsResponseWrapper>("/api/settings", {
    method: "POST",
    body: JSON.stringify(settings),
  });
  if (!response.success) {
    throw new ApiError("Save settings failed", 500, response);
  }
  return response.settings;
}

export async function getHealth() {
  const response = await apiFetch<HealthResponse>("/api/health");
  return response.success;
}

export async function sendTestNotification() {
  const response = await apiFetch<HealthResponse>("/api/health/notify", {
    method: "POST",
    body: JSON.stringify({}),
  });
  if (!response.success) {
    throw new ApiError("Test notification failed", 500, response);
  }
  return response.success;
}

export { ApiError };
