const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");

declare global {
  interface Window {
    __MSW_READY__?: Promise<void>;
  }
}

export async function ensureMswReady() {
  if (process.env.NEXT_PUBLIC_USE_MOCKS !== "true") return;
  if (typeof window === "undefined") return;
  if (!window.__MSW_READY__) {
    window.__MSW_READY__ = (async () => {
      const { worker } = await import("@/mocks/browser");
      const serviceWorkerUrl = `${basePath || ""}/mockServiceWorker.js`;
      await worker.start({
        onUnhandledRequest: "bypass",
        serviceWorker: {
          url: serviceWorkerUrl,
          options: {
            scope: basePath ? `${basePath}/` : "/",
          },
        },
      });
    })();
  }
  await window.__MSW_READY__;
}
