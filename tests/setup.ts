import "@testing-library/jest-dom";
import "whatwg-fetch";

import { server } from "@/mocks/server";

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

if (!("ResizeObserver" in globalThis)) {
  class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  // @ts-expect-error - adding to global for tests
  globalThis.ResizeObserver = ResizeObserver;
}

const ensureMatchMedia = () => {
  // @ts-expect-error - adding to global for tests
  const matcher = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
  // @ts-expect-error - assign for tests
  if (typeof globalThis.matchMedia !== "function") globalThis.matchMedia = matcher;
  if (globalThis.window && typeof globalThis.window.matchMedia !== "function") {
    // @ts-expect-error - assign for jsdom window
    globalThis.window.matchMedia = matcher;
  }
};

ensureMatchMedia();
