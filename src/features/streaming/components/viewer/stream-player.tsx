"use client";

import { useState } from "react";
import { LoaderCircle, Sparkles, Volume2, WifiOff } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { MediaVideo } from "@/features/streaming/components/media-video";
import { PlayerFrame } from "@/features/streaming/components/viewer/player-frame";
import { PlayerStateOverlay } from "@/features/streaming/components/viewer/player-state-overlay";
import { PlayerToolbar } from "@/features/streaming/components/viewer/player-toolbar";
import { streamHasLiveAudio } from "@/features/streaming/lib/display-media-constraints";
import type { ViewerSession } from "@/features/streaming/hooks/use-viewer-session";
import { useFullscreen } from "@/hooks/use-fullscreen";

type StreamPlayerProps = Pick<
  ViewerSession,
  | "status"
  | "stream"
  | "quality"
  | "connectionQuality"
  | "mediaConnectionStatus"
  | "mediaError"
>;

export function StreamPlayer({
  status,
  stream,
  quality,
  connectionQuality,
  mediaConnectionStatus,
  mediaError,
}: StreamPlayerProps) {
  const { ref, isFullscreen, isSupported, toggle } =
    useFullscreen<HTMLDivElement>();
  const hasAudio = streamHasLiveAudio(stream);
  const streamKey = stream?.id ?? null;
  const [unmutedStreamKey, setUnmutedStreamKey] = useState<string | null>(null);
  const muted =
    !hasAudio || !streamKey || unmutedStreamKey !== streamKey;

  return (
    <PlayerFrame ref={ref} live={status === "live" && !!stream}>
      {status === "live" ? (
        <LiveViewerContent
          stream={stream}
          muted={muted}
          hasAudio={hasAudio}
          mediaConnectionStatus={mediaConnectionStatus}
          mediaError={mediaError}
          onUnmute={() => {
            if (streamKey) setUnmutedStreamKey(streamKey);
          }}
        />
      ) : (
        <PlayerStateOverlay status={status} />
      )}
      <PlayerToolbar
        status={status}
        quality={quality}
        connectionQuality={connectionQuality}
        isFullscreen={isFullscreen}
        canFullscreen={isSupported}
        onToggleFullscreen={toggle}
        hasAudio={hasAudio}
        muted={muted}
        onToggleMute={() => {
          if (!streamKey || !hasAudio) return;
          setUnmutedStreamKey((current) =>
            current === streamKey ? null : streamKey,
          );
        }}
      />
    </PlayerFrame>
  );
}

function LiveViewerContent({
  stream,
  muted,
  hasAudio,
  mediaConnectionStatus,
  mediaError,
  onUnmute,
}: {
  stream: MediaStream | null;
  muted: boolean;
  hasAudio: boolean;
  mediaConnectionStatus: ViewerSession["mediaConnectionStatus"];
  mediaError: string | null;
  onUnmute: () => void;
}) {
  if (stream) {
    return (
      <>
        <MediaVideo
          stream={stream}
          muted={muted}
          className="absolute inset-0"
        />
        {hasAudio && muted ? (
          <div className="absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 justify-center px-4">
            <Button
              type="button"
              size="lg"
              onClick={onUnmute}
              aria-label="Ativar som"
            >
              <Volume2 data-icon="inline-start" />
              Ativar som
            </Button>
          </div>
        ) : null}
      </>
    );
  }

  if (mediaConnectionStatus === "error") {
    return (
      <EmptyState
        icon={WifiOff}
        title="Não foi possível receber o vídeo"
        description={
          mediaError ??
          "Houve um problema ao conectar na transmissão. Verifique a conexão e tente novamente."
        }
      />
    );
  }

  if (
    mediaConnectionStatus === "connecting" ||
    mediaConnectionStatus === "reconnecting"
  ) {
    return (
      <div
        role="status"
        className="relative flex flex-col items-center gap-3 text-sm text-muted-foreground"
      >
        <LoaderCircle className="size-6 animate-spin text-primary" aria-hidden />
        Conectando à transmissão…
      </div>
    );
  }

  return (
    <EmptyState
      icon={Sparkles}
      title="Aguardando o vídeo"
      description="Conectado à sala. O vídeo aparece quando a track do anfitrião for recebida — confirme que a captura continua ativa na outra janela."
    />
  );
}
