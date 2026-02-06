import { describe, expect, it } from "vitest";

import { statusBarClass } from "@/lib/format";

describe("statusBarClass", () => {
  it("returns green for passed", () => {
    expect(statusBarClass("passed")).toBe("bg-emerald-500");
  });

  it("returns red for failed variants", () => {
    expect(statusBarClass("failed")).toBe("bg-rose-500");
    expect(statusBarClass("failed: smart")).toBe("bg-rose-500");
    expect(statusBarClass("failed: both")).toBe("bg-rose-500");
  });

  it("returns amber for unknown", () => {
    expect(statusBarClass("unknown")).toBe("bg-amber-500");
  });
});
