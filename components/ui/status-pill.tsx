import { cn } from "@/lib/utils";

interface StatusPillProps {
  status: "passed" | "failed" | "unknown";
  label: string;
  className?: string;
}

const STATUS_STYLES: Record<StatusPillProps["status"], string> = {
  passed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  failed: "bg-rose-50 text-rose-700 ring-rose-200",
  unknown: "bg-amber-50 text-amber-700 ring-amber-200",
};

export function StatusPill({ status, label, className }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        STATUS_STYLES[status],
        className
      )}
    >
      {label}
    </span>
  );
}
