"use client";

import { useEffect } from "react";
import { ensureMswReady } from "@/lib/msw";

export function MockProvider() {
  useEffect(() => {
    void ensureMswReady();
  }, []);

  return null;
}
