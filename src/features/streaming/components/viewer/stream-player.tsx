"use client";

import { useCallback, useState } from "react";
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
  | "viewerCount"
>;

interface AudioSession {
  streamKey: string | null;
  userMuted: boolean;
  autoplayBlocked: boolean;
  volume: number;
}

const DEFAULT_VOLUME = 1;

const OPEN_AUDIO: Omit<AudioSession, "streamKey"> = {
  userMuted: false,
  autoplayBlocked: false,
  volume: DEFAULT_VOLUME,
};

export function StreamPlayer({
  status,
  stream,
  quality,
  connectionQuality,
  mediaConnectionStatus,
  mediaError,
  viewerCount,
}: StreamPlayerProps) {
  const { ref, isFullscreen, isSupported, toggle } =
    useFullscreen<HTMLDivElement>();
  const hasAudio = streamHasLiveAudio(stream);
  const streamKey = stream?.id ?? null;
  const [audioSession, setAudioSession] = useState<AudioSession>({
    streamKey: null,
    ...OPEN_AUDIO,
  });

  const activeSession =
    audioSession.streamKey === streamKey
      ? audioSession
      : { streamKey, ...OPEN_AUDIO, volume: audioSession.volume };

  const muted =
    !hasAudio || activeSession.userMuted || activeSession.autoplayBlocked;
  const volume = activeSession.volume;

  const openAudio = useCallback(() => {
    if (!streamKey) return;
    setAudioSession((prev) => ({
      streamKey,
      userMuted: false,
      autoplayBlocked: false,
      volume: prev.volume > 0 ? prev.volume : DEFAULT_VOLUME,
    }));
  }, [streamKey]);

  const handleAutoplayBlocked = useCallback(() => {
    if (!streamKey) return;
    setAudioSession((prev) => ({
      streamKey,
      userMuted: false,
      autoplayBlocked: true,
      volume: prev.volume,
    }));
  }, [streamKey]);

  const handleVolumeChange = useCallback(
    (next: number) => {
      if (!streamKey) return;
      const clamped = Math.min(1, Math.max(0, next));
      setAudioSession({
        streamKey,
        volume: clamped,
        userMuted: clamped === 0,
        autoplayBlocked: false,
      });
    },
    [streamKey],
  );

  return (
    <PlayerFrame ref={ref} live={status === "live" && !!stream}>
      {status === "live" ? (
        <LiveViewerContent
          stream={stream}
          muted={muted}
          volume={volume}
          hasAudio={hasAudio}
          mediaConnectionStatus={mediaConnectionStatus}
          mediaError={mediaError}
          onAutoplayBlocked={handleAutoplayBlocked}
          onUnmute={openAudio}
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
        volume={volume}
        viewerCount={viewerCount}
        onVolumeChange={handleVolumeChange}
        onToggleMute={() => {
          if (!hasAudio || !streamKey) return;
          if (muted) {
            openAudio();
            return;
          }
          setAudioSession((prev) => ({
            streamKey,
            userMuted: true,
            autoplayBlocked: false,
            volume: prev.volume,
          }));
        }}
      />
    </PlayerFrame>
  );
}

function LiveViewerContent({
  stream,
  muted,
  volume,
  hasAudio,
  mediaConnectionStatus,
  mediaError,
  onAutoplayBlocked,
  onUnmute,
}: {
  stream: MediaStream | null;
  muted: boolean;
  volume: number;
  hasAudio: boolean;
  mediaConnectionStatus: ViewerSession["mediaConnectionStatus"];
  mediaError: string | null;
  onAutoplayBlocked: () => void;
  onUnmute: () => void;
}) {
  if (stream) {
    return (
      <>
        <MediaVideo
          stream={stream}
          muted={muted}
          volume={volume}
          className="absolute inset-0"
          onAutoplayBlocked={onAutoplayBlocked}
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
