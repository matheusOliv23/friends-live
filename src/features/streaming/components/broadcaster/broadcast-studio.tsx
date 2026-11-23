"use client";

import { useEffect, useRef, useState } from "react";
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
  const [hostRetries, setHostRetries] = useState(0);
  const shareEpochRef = useRef(0);
  const prevCaptureStatusRef = useRef(capture.status);
  const stoppingRef = useRef(false);
  const recoveringRef = useRef(false);
  const hadConnectedRef = useRef(false);

  const disconnectLiveKit = livekit.disconnect;
  const connectAsPublisher = livekit.connectAsPublisher;
  const refreshRoom = roomState.refresh;
  const resetRoom = roomState.end;
  const isHost = roomState.isHost;
  const roomStatus = roomState.room?.status;

  useEffect(() => {
    setHostRetries(0);
  }, [roomId]);

  useEffect(() => {
    if (livekit.status === "connected") {
      hadConnectedRef.current = true;
    }
    if (!capture.isActive) {
      hadConnectedRef.current = false;
    }
  }, [livekit.status, capture.isActive]);

  // Mantém o PC acordado enquanto transmite (web Wake Lock + Electron powerSave).
  useEffect(() => {
    if (!capture.isActive) return;

    let wakeLock: WakeLockSentinel | null = null;
    let cancelled = false;

    void (async () => {
      try {
        wakeLock = (await navigator.wakeLock?.request("screen")) ?? null;
      } catch {
        // navegador pode negar — ok
      }
      if (cancelled) {
        void wakeLock?.release();
        return;
      }
      const desktop = (
        globalThis as typeof globalThis & {
          nexusDesktop?: { setPowerSave?: (enabled: boolean) => Promise<void> };
        }
      ).nexusDesktop;
      await desktop?.setPowerSave?.(true);
    })();

    return () => {
      cancelled = true;
      void wakeLock?.release();
      const desktop = (
        globalThis as typeof globalThis & {
          nexusDesktop?: { setPowerSave?: (enabled: boolean) => Promise<void> };
        }
      ).nexusDesktop;
      void desktop?.setPowerSave?.(false);
    };
  }, [capture.isActive]);

  // Se o sinal cair no meio do jogo, reconecta sem pedir a tela de novo.
  useEffect(() => {
    if (!capture.isActive || !capture.stream) return;
    if (!hadConnectedRef.current) return;
    if (stoppingRef.current || recoveringRef.current) return;
    if (livekit.status !== "disconnected" && livekit.status !== "error") {
      return;
    }

    recoveringRef.current = true;
    const stream = capture.stream;
    const quality = capture.quality;
    const epoch = shareEpochRef.current;

    void (async () => {
      try {
        setActionError("Reconectando à transmissão…");
        await connectAsPublisher(roomId, stream, quality);
        if (epoch === shareEpochRef.current) {
          setActionError(null);
        }
      } catch (err) {
        if (epoch !== shareEpochRef.current) return;
        setActionError(
          err instanceof Error
            ? err.message
            : "A conexão caiu. Toque em compartilhar de novo.",
        );
      } finally {
        recoveringRef.current = false;
      }
    })();
  }, [
    capture.isActive,
    capture.stream,
    capture.quality,
    livekit.status,
    connectAsPublisher,
    roomId,
  ]);

  // Só limpa quando a captura CAI de active→ended.
  // Evita um disconnect atrasado matar a próxima tentativa de compartilhar.
  useEffect(() => {
    const prev = prevCaptureStatusRef.current;
    prevCaptureStatusRef.current = capture.status;

    if (!(prev === "active" && capture.status === "ended")) return;
    if (stoppingRef.current) return;

    const epoch = shareEpochRef.current;
    let cancelled = false;

    void (async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 250));
      if (cancelled || epoch !== shareEpochRef.current) return;

      await disconnectLiveKit();
      if (cancelled || epoch !== shareEpochRef.current) return;

      if (isHost && roomStatus === "live") {
        try {
          await resetRoom();
        } catch {
          // ignore — UI ainda permite Parar transmissão
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [capture.status, disconnectLiveKit, isHost, resetRoom, roomStatus]);

  // Na 1ª carga (esp. Electron) o cookie/Bearer pode atrasar — tenta de novo antes de bloquear.
  useEffect(() => {
    if (roomState.isLoading) return;
    if (!roomState.room || roomState.room.status === "ended") return;
    if (roomState.isHost) return;
    if (hostRetries >= 5) return;

    const timer = window.setTimeout(() => {
      void refreshRoom().finally(() => {
        setHostRetries((count) => count + 1);
      });
    }, 350);

    return () => window.clearTimeout(timer);
  }, [
    roomState.isLoading,
    roomState.room,
    roomState.isHost,
    hostRetries,
    refreshRoom,
  ]);

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

  const waitingHostAuth =
    !!roomState.room &&
    roomState.room.status !== "ended" &&
    !roomState.isHost &&
    hostRetries < 5;

  if (waitingHostAuth) {
    return (
      <div
        role="status"
        className="flex min-h-80 items-center justify-center gap-2 text-sm text-muted-foreground"
      >
        <LoaderCircle className="size-5 animate-spin text-primary" aria-hidden />
        Confirmando acesso…
      </div>
    );
  }

  if (roomState.room && !roomState.isHost && roomState.room.status !== "ended") {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Acesso restrito ao amigo"
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
    shareEpochRef.current += 1;
    const shouldGoLive = roomState.room?.status !== "live";

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
      stoppingRef.current = true;
      try {
        capture.stop();
        await livekit.disconnect().catch(() => undefined);
      } finally {
        stoppingRef.current = false;
      }

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
    stoppingRef.current = true;
    shareEpochRef.current += 1;
    try {
      await livekit.disconnect();
      capture.stop();
      // Volta a sala para waiting — espectadores no mesmo link aguardam de novo.
      await roomState.end();
    } catch (err) {
      capture.stop();
      setActionError(
        err instanceof RoomApiError
          ? err.message
          : "Não foi possível parar o compartilhamento.",
      );
    } finally {
      stoppingRef.current = false;
    }
  }

  async function handleEnd() {
    setIsEnding(true);
    setActionError(null);
    stoppingRef.current = true;
    shareEpochRef.current += 1;
    try {
      await livekit.disconnect();
      capture.stop();
      await roomState.end();
    } catch (err) {
      setActionError(
        err instanceof RoomApiError
          ? err.message
          : "Não foi possível parar a transmissão.",
      );
    } finally {
      stoppingRef.current = false;
      setIsEnding(false);
    }
  }

  const startedAt = room.liveAt ? Date.parse(room.liveAt) : null;
  const stageError = actionError ?? capture.errorMessage ?? livekit.errorMessage;

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
      <div className="min-w-0 flex-1 space-y-4">
        <BroadcastStage
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
      </aside>
    </div>
  );
}
