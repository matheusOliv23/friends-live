"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LoaderCircle, ShieldAlert, Signal } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { HomeLink } from "@/components/home-link";
import { Panel } from "@/components/panel";
import { buttonVariants } from "@/components/ui/button";
import { ConnectionStatusBadge } from "@/features/livekit/components/connection-status-badge";
import { useLiveKitSession } from "@/features/livekit/hooks/use-livekit-session";
import { RoomApiError } from "@/features/rooms/api/client";
import { ShareLinkPanel } from "@/features/rooms/components/share-link-panel";
import { useRoom } from "@/features/rooms/hooks/use-room";
import { getWatchPath } from "@/features/rooms/lib/paths";
import { BroadcastOverviewPanel } from "@/features/streaming/components/broadcaster/broadcast-overview-panel";
import { BroadcastStage } from "@/features/streaming/components/broadcaster/broadcast-stage";
import { QualitySettingsPanel } from "@/features/streaming/components/broadcaster/quality-settings-panel";
import { useScreenCapture } from "@/features/streaming/hooks/use-screen-capture";

interface BroadcastStudioProps {
  roomId: string;
}

export function BroadcastStudio({ roomId }: BroadcastStudioProps) {
  const roomState = useRoom({ roomId, pollIntervalMs: 5000 });
  const capture = useScreenCapture();
  const livekit = useLiveKitSession();
  const [isEnding, setIsEnding] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const disconnectLiveKit = livekit.disconnect;

  useEffect(() => {
    if (capture.status === "ended") {
      void disconnectLiveKit();
    }
  }, [capture.status, disconnectLiveKit]);

  if (roomState.isLoading) {
    return (
      <div
        role="status"
        className="flex min-h-80 items-center justify-center gap-2 text-sm text-muted-foreground"
      >
        <LoaderCircle className="size-5 animate-spin text-primary" aria-hidden />
        Carregando sala…
      </div>
    );
  }

  if (roomState.error && !roomState.room) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Sala não encontrada"
        description={roomState.error}
      >
        <HomeLink className={buttonVariants({ variant: "outline", size: "lg" })}>
          Voltar ao início
        </HomeLink>
      </EmptyState>
    );
  }

  if (roomState.room && !roomState.isHost && roomState.room.status !== "ended") {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Acesso restrito ao anfitrião"
        description="Esta página é exclusiva de quem criou a sala. Use o link de espectador para assistir."
      >
        <Link
          href={getWatchPath(roomId)}
          className={buttonVariants({ size: "lg" })}
        >
          Ir para a visualização
        </Link>
      </EmptyState>
    );
  }

  if (!roomState.room) return null;
  const room = roomState.room;

  async function handleStartSharing() {
    setActionError(null);
    const shouldGoLive = roomState.room?.status === "waiting";

    try {
      const stream = await capture.start();
      await livekit.connectAsPublisher(roomId, stream, capture.quality);

      if (shouldGoLive) {
        try {
          await roomState.goLive();
        } catch (err) {
          await livekit.disconnect();
          capture.stop();
          throw err;
        }
      }
    } catch (err) {
      capture.stop();
      await livekit.disconnect().catch(() => undefined);

      if (err instanceof RoomApiError) {
        setActionError(err.message);
        return;
      }

      setActionError(
        err instanceof Error
          ? err.message
          : "Não foi possível iniciar o compartilhamento.",
      );
    }
  }

  async function handleStopSharing() {
    setActionError(null);
    try {
      await livekit.disconnect();
    } finally {
      capture.stop();
    }
  }

  async function handleEnd() {
    setIsEnding(true);
    setActionError(null);
    try {
      await livekit.disconnect();
      capture.stop();
      await roomState.end();
    } catch (err) {
      setActionError(
        err instanceof RoomApiError
          ? err.message
          : "Não foi possível encerrar a sala.",
      );
    } finally {
      setIsEnding(false);
    }
  }

  const startedAt = room.liveAt ? Date.parse(room.liveAt) : null;
  const stageError = actionError ?? capture.errorMessage ?? livekit.errorMessage;
  const qualityLocked =
    capture.isActive ||
    capture.isRequesting ||
    livekit.status === "connecting" ||
    room.status === "ended";

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
      <div className="min-w-0 flex-1 space-y-4">
        <BroadcastStage
          roomStatus={room.status}
          captureStatus={capture.status}
          stream={capture.stream}
          quality={capture.quality}
          detected={capture.detected}
          error={stageError}
          isSupported={capture.isSupported}
          onStartSharing={handleStartSharing}
          onStopSharing={() => {
            void handleStopSharing();
          }}
        />
      </div>
      <aside className="flex shrink-0 flex-col gap-4 lg:w-80">
        <ShareLinkPanel roomId={room.id} />
        <BroadcastOverviewPanel
          status={room.status}
          viewerCount={livekit.participantCount}
          startedAt={startedAt}
          isEnding={isEnding}
          onEnd={handleEnd}
        />
        <Panel title="Conexão LiveKit" icon={Signal}>
          <ConnectionStatusBadge
            status={livekit.status}
            errorMessage={livekit.errorMessage}
          />
        </Panel>
        <QualitySettingsPanel
          quality={capture.quality}
          onChange={capture.updateQuality}
          locked={qualityLocked}
        />
      </aside>
    </div>
  );
}
