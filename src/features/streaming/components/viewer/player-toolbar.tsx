import { Maximize, Minimize, Volume2, VolumeX } from "lucide-react";
import { StatusIndicator } from "@/components/status-indicator";
import { Button } from "@/components/ui/button";
import { ConnectionIndicator } from "@/features/streaming/components/viewer/connection-indicator";
import { formatQuality } from "@/features/streaming/constants/quality";
import { VIEWER_STATUS_META } from "@/features/streaming/constants/status";
import { cn } from "@/lib/utils";
import type { ViewerSession } from "@/features/streaming/hooks/use-viewer-session";

interface PlayerToolbarProps
  extends Pick<ViewerSession, "status" | "quality" | "connectionQuality"> {
  isFullscreen: boolean;
  canFullscreen: boolean;
  onToggleFullscreen: () => void;
  hasAudio: boolean;
  muted: boolean;
  onToggleMute: () => void;
}

export function PlayerToolbar({
  status,
  quality,
  connectionQuality,
  isFullscreen,
  canFullscreen,
  onToggleFullscreen,
  hasAudio,
  muted,
  onToggleMute,
}: PlayerToolbarProps) {
  const meta = VIEWER_STATUS_META[status];
  const fullscreenLabel = isFullscreen ? "Sair da tela cheia" : "Tela cheia";
  const FullscreenIcon = isFullscreen ? Minimize : Maximize;
  const muteLabel = muted ? "Ativar som" : "Desativar som";
  const MuteIcon = muted ? VolumeX : Volume2;

  return (
    <div
      className={cn(
        "absolute inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3 bg-linear-to-t from-black/80 to-transparent px-3 pt-10 pb-3 transition-opacity duration-300 sm:px-4",
        status === "live" &&
          "sm:opacity-0 sm:group-hover/player:opacity-100 sm:focus-within:opacity-100",
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <StatusIndicator label={meta.label} tone={meta.tone} pulse={meta.pulse} />
        <span className="hidden h-3 w-px bg-border sm:block" aria-hidden />
        <span className="hidden text-xs text-muted-foreground tabular-nums sm:inline">
          {quality ? formatQuality(quality) : "Qualidade indisponível"}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <ConnectionIndicator quality={connectionQuality} />
        {hasAudio ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleMute}
            aria-label={muteLabel}
            title={muteLabel}
            aria-pressed={!muted}
          >
            <MuteIcon />
          </Button>
        ) : null}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleFullscreen}
          disabled={!canFullscreen}
          aria-label={fullscreenLabel}
          title={fullscreenLabel}
        >
          <FullscreenIcon />
        </Button>
      </div>
    </div>
  );
}
