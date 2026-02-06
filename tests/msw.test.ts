import { describe, expect, it, vi, beforeEach } from "vitest";

describe("ensureMswReady", () => {
  beforeEach(() => {
    delete (window as typeof window & { __MSW_READY__?: Promise<void> }).__MSW_READY__;
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("starts worker once when mocks enabled", async () => {
    process.env.NEXT_PUBLIC_USE_MOCKS = "true";
    process.env.NEXT_PUBLIC_BASE_PATH = "";

    const start = vi.fn().mockResolvedValue(undefined);
    vi.doMock("@/mocks/browser", () => ({
      worker: { start },
    }));

    const { ensureMswReady } = await import("@/lib/msw");

    await ensureMswReady();
    await ensureMswReady();

    expect(start).toHaveBeenCalledTimes(1);
  });
});
