"use client";

import type { ReactNode } from "react";
import { Clock, Radio, Users } from "lucide-react";
import { Panel } from "@/components/panel";
import { StatusIndicator } from "@/components/status-indicator";
import { Button } from "@/components/ui/button";
import { ROOM_STATUS_META } from "@/features/rooms/constants/status";
import { useElapsedSeconds } from "@/hooks/use-elapsed-seconds";
import { formatDuration, formatViewerCount } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { RoomStatus } from "@/types/rooms";

interface BroadcastOverviewPanelProps {
  status: RoomStatus;
  viewerCount: number;
  startedAt: number | null;
  isEnding?: boolean;
  onEnd: () => void;
}

export function BroadcastOverviewPanel({
  status,
  viewerCount,
  startedAt,
  isEnding = false,
  onEnd,
}: BroadcastOverviewPanelProps) {
  const meta = ROOM_STATUS_META[status];
  const isLive = status === "live";
  const canEnd = status === "live";
  const elapsed = useElapsedSeconds(isLive ? startedAt : null);

  return (
    <Panel title="Transmissão" icon={Radio}>
      <dl className="grid grid-cols-2 gap-3">
        <Stat label="Status">
          <StatusIndicator
            label={meta.label}
            tone={meta.tone}
            pulse={meta.pulse}
          />
        </Stat>
        <Stat label="Duração">
          <span className="inline-flex items-center gap-1.5 font-mono text-sm tabular-nums">
            <Clock className="size-3.5 text-muted-foreground" aria-hidden />
            {isLive ? formatDuration(elapsed) : "--:--"}
          </span>
        </Stat>
        <Stat label="Espectadores" className="col-span-2">
          <span className="inline-flex items-center gap-1.5 text-sm">
            <Users className="size-3.5 text-muted-foreground" aria-hidden />
            {formatViewerCount(viewerCount)}
          </span>
        </Stat>
      </dl>
      <Button
        variant="destructive"
        size="lg"
        onClick={onEnd}
        disabled={!canEnd || isEnding}
        className="mt-4 h-10 w-full"
      >
        {isEnding ? "Parando…" : "Parar transmissão"}
      </Button>
      <p className="mt-2 text-xs text-muted-foreground">
        O link dos amigos continua o mesmo. Você pode transmitir de novo quando
        quiser.
      </p>
    </Panel>
  );
}

interface StatProps {
  label: string;
  children: ReactNode;
  className?: string;
}

function Stat({ label, children, className }: StatProps) {
  return (
    <div
      className={cn(
        "space-y-1.5 rounded-lg border bg-background/60 p-3",
        className,
      )}
    >
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
