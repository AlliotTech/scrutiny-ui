import { render, RenderOptions } from "@testing-library/react";
import React from "react";
import { SWRConfig } from "swr";

import { I18nProvider } from "@/lib/i18n";

export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <I18nProvider>
        <SWRConfig
          value={{
            provider: () => new Map(),
            dedupingInterval: 0,
            revalidateOnFocus: false,
          }}
        >
          {children}
        </SWRConfig>
      </I18nProvider>
    ),
    ...options,
  });
}
