import { describe, expect, it } from "vitest";
import { HttpResponse, http } from "msw";

import {
  ApiError,
  getDeviceDetails,
  getSettings,
  getSummary,
  getSummaryTemp,
  saveSettings,
} from "@/lib/api";
import { server } from "@/mocks/server";

describe("api", () => {
  it("fetches summary", async () => {
    const data = await getSummary();
    const keys = Object.keys(data);
    expect(keys.length).toBeGreaterThan(0);
  });

  it("fetches temperature history", async () => {
    const data = await getSummaryTemp("month");
    expect(Object.keys(data).length).toBeGreaterThan(0);
  });

  it("fetches device details", async () => {
    const data = await getDeviceDetails("0x5000c500dbe60357", "month");
    expect(data.success).toBe(true);
    expect(data.data.device.wwn).toBe("0x5000c500dbe60357");
  });

  it("fetches and saves settings", async () => {
    const settings = await getSettings();
    expect(settings.temperature_unit).toBe("celsius");
    const updated = await saveSettings({ ...settings, temperature_unit: "fahrenheit" });
    expect(updated.temperature_unit).toBe("fahrenheit");
  });

  it("throws ApiError on server failure", async () => {
    server.use(http.get("/api/summary", () => HttpResponse.json({ success: false }, { status: 500 })));
    await expect(getSummary()).rejects.toBeInstanceOf(ApiError);
  });
});
