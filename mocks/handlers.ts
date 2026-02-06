import { http, HttpResponse } from "msw";

import summary from "@/mocks/data/summary.json";
import summaryTemp from "@/mocks/data/summary-temp.json";
import deviceDetails from "@/mocks/data/device-details.json";
import settings from "@/mocks/data/settings.json";

export const handlers = [
  http.get(/\/api\/summary\/?$/, () => HttpResponse.json(summary)),
  http.get(/\/api\/summary\/temp\/?$/, () => HttpResponse.json(summaryTemp)),
  http.get(/\/api\/device\/[^/]+\/details\/?$/, () => HttpResponse.json(deviceDetails)),
  http.post(/\/api\/device\/[^/]+\/archive\/?$/, () => HttpResponse.json({ success: true })),
  http.post(/\/api\/device\/[^/]+\/unarchive\/?$/, () => HttpResponse.json({ success: true })),
  http.delete(/\/api\/device\/[^/]+\/?$/, () => HttpResponse.json({ success: true })),
  http.get(/\/api\/settings\/?$/, () => HttpResponse.json(settings)),
  http.post(/\/api\/settings\/?$/, async ({ request }) => {
    const payload = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ success: true, settings: payload });
  }),
  http.get(/\/api\/health\/?$/, () => HttpResponse.json({ success: true })),
  http.post(/\/api\/health\/notify\/?$/, () => HttpResponse.json({ success: true })),
];
