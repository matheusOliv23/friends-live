import {
  SignalHigh,
  SignalLow,
  SignalMedium,
  SignalZero,
  type LucideIcon,
} from "lucide-react";
import { CONNECTION_QUALITY_LABELS } from "@/features/streaming/constants/status";
import { cn } from "@/lib/utils";
import type { ConnectionQuality } from "@/types/streaming";

const ICONS: Record<ConnectionQuality, { icon: LucideIcon; className: string }> = {
  unknown: { icon: SignalZero, className: "text-muted-foreground" },
  good: { icon: SignalHigh, className: "text-success" },
  fair: { icon: SignalMedium, className: "text-warning" },
  poor: { icon: SignalLow, className: "text-live" },
};

interface ConnectionIndicatorProps {
  quality: ConnectionQuality;
}

export function ConnectionIndicator({ quality }: ConnectionIndicatorProps) {
  const { icon: Icon, className } = ICONS[quality];

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <Icon className={cn("size-4", className)} aria-hidden />
      {CONNECTION_QUALITY_LABELS[quality]}
    </span>
  );
}
