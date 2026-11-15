"use client";

import { StatusIndicator } from "@/components/status-indicator";
import { LIVEKIT_CONNECTION_META } from "@/features/livekit/constants/connection-status";
import type { LiveKitConnectionStatus } from "@/features/livekit/types";

interface ConnectionStatusBadgeProps {
  status: LiveKitConnectionStatus;
  errorMessage?: string | null;
}

export function ConnectionStatusBadge({
  status,
  errorMessage,
}: ConnectionStatusBadgeProps) {
  const meta = LIVEKIT_CONNECTION_META[status];

  return (
    <div className="space-y-1">
      <StatusIndicator label={meta.label} tone={meta.tone} pulse={meta.pulse} />
      {status === "error" && errorMessage && (
        <p role="alert" className="text-xs text-destructive">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
