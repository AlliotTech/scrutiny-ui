"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

import { DeviceDetailClient } from "./device-detail-client";

export default function DevicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();

  const wwn = searchParams.get("wwn")?.trim() ?? "";

  if (!wwn) {
    return (
      <Card className="glass-panel">
        <CardContent className="space-y-4 p-6">
          <p className="text-sm text-muted-foreground">{t("device.missing_wwn")}</p>
          <Button onClick={() => router.push("/")}>{t("nav.dashboard")}</Button>
        </CardContent>
      </Card>
    );
  }

  return <DeviceDetailClient wwn={wwn} />;
}
