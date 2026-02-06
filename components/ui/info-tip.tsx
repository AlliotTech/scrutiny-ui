"use client";

import { Info } from "lucide-react";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface InfoTipProps {
  label: string;
  text: string;
}

export function InfoTip({ label, text }: InfoTipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
            aria-label={label}
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-xs">{text}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
