import type { Metadata } from "next";

import "@/app/globals.css";
import { Header } from "@/components/layout/header";
import { Toaster } from "@/components/ui/sonner";
import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/components/theme-provider";
import { MockProvider } from "@/components/mock-provider";

export const metadata: Metadata = {
  title: "Scrutiny",
  description: "Scrutiny front-end",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <MockProvider />
          <I18nProvider>
            <Header />
            <main className="container pb-16 pt-10">{children}</main>
            <Toaster richColors />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
