import { LogOut, Maximize, Minimize, Users, Volume2, VolumeX } from "lucide-react";
import { HomeLink } from "@/components/home-link";
import { StatusIndicator } from "@/components/status-indicator";
import { Button, buttonVariants } from "@/components/ui/button";
import { ConnectionIndicator } from "@/features/streaming/components/viewer/connection-indicator";
import { formatQuality } from "@/features/streaming/constants/quality";
import { VIEWER_STATUS_META } from "@/features/streaming/constants/status";
import { formatViewerCount } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ViewerSession } from "@/features/streaming/hooks/use-viewer-session";

interface PlayerToolbarProps
  extends Pick<ViewerSession, "status" | "quality" | "connectionQuality"> {
  isFullscreen: boolean;
  canFullscreen: boolean;
  onToggleFullscreen: () => void;
  hasAudio: boolean;
  muted: boolean;
  volume: number;
  onToggleMute: () => void;
  onVolumeChange: (volume: number) => void;
  viewerCount: number;
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
  volume,
  onToggleMute,
  onVolumeChange,
  viewerCount,
}: PlayerToolbarProps) {
  const meta = VIEWER_STATUS_META[status];
  const fullscreenLabel = isFullscreen ? "Sair da tela cheia" : "Tela cheia";
  const FullscreenIcon = isFullscreen ? Minimize : Maximize;
  const muteLabel = muted ? "Ativar som" : "Desativar som";
  const MuteIcon = muted ? VolumeX : Volume2;
  const showWatching = status === "live" || status === "connecting";

  return (
    <>
      <HomeLink
        href="/"
        className={cn(
          buttonVariants({ size: "sm" }),
          "absolute top-3 right-3 z-30 gap-1.5 border-transparent bg-red-600 text-white shadow-lg hover:bg-red-500",
        )}
        aria-label="Sair da transmissão"
      >
        <LogOut data-icon="inline-start" />
        Sair
      </HomeLink>

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3 bg-linear-to-t from-black/80 to-transparent px-3 pt-10 pb-3 transition-opacity duration-300 sm:px-4",
          status === "live" &&
            "sm:opacity-0 sm:group-hover/player:opacity-100 sm:focus-within:opacity-100",
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          <StatusIndicator
            label={meta.label}
            tone={meta.tone}
            pulse={meta.pulse}
          />
          <span className="hidden h-3 w-px bg-border sm:block" aria-hidden />
          <span className="hidden text-xs text-muted-foreground tabular-nums sm:inline">
            {quality ? formatQuality(quality) : "Qualidade indisponível"}
          </span>
          {showWatching ? (
            <>
              <span className="hidden h-3 w-px bg-border sm:block" aria-hidden />
              <span
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground tabular-nums"
                title={formatViewerCount(viewerCount)}
              >
                <Users className="size-3.5 shrink-0" aria-hidden />
                <span className="sm:hidden">{viewerCount}</span>
                <span className="hidden sm:inline">
                  {formatViewerCount(viewerCount)}
                </span>
              </span>
            </>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <ConnectionIndicator quality={connectionQuality} />
          {hasAudio ? (
            <div className="flex items-center gap-1.5">
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
              <label className="flex items-center">
                <span className="sr-only">Volume</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={muted ? 0 : volume}
                  onChange={(event) =>
                    onVolumeChange(Number.parseFloat(event.target.value))
                  }
                  className="h-1.5 w-16 cursor-pointer appearance-none rounded-full bg-white/25 accent-white sm:w-24 [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round((muted ? 0 : volume) * 100)}
                  aria-label="Volume da transmissão"
                />
              </label>
            </div>
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
    </>
  );
}
