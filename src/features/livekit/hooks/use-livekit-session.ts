"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { fetchLiveKitToken } from "@/features/livekit/api/client";
import { LiveKitSessionService } from "@/features/livekit/services/livekit-session.service";
import type {
  LiveKitConnectionStatus,
  LiveKitSessionSnapshot,
} from "@/features/livekit/types";
import type { StreamQualitySettings } from "@/types/streaming";

const IDLE_SNAPSHOT: LiveKitSessionSnapshot = {
  status: "idle",
  errorMessage: null,
  remoteStream: null,
  participantCount: 0,
};

export interface UseLiveKitSessionResult {
  status: LiveKitConnectionStatus;
  errorMessage: string | null;
  remoteStream: MediaStream | null;
  participantCount: number;
  isConnected: boolean;
  publishScreen: (
    stream: MediaStream,
    quality: StreamQualitySettings,
  ) => Promise<void>;
  connectAsPublisher: (
    roomId: string,
    stream: MediaStream,
    quality: StreamQualitySettings,
  ) => Promise<void>;
  connectAsViewer: (roomId: string) => Promise<void>;
  disconnect: () => Promise<void>;
}

export function useLiveKitSession(): UseLiveKitSessionResult {
  const [service] = useState(() => new LiveKitSessionService());

  const snapshot = useSyncExternalStore(
    (onStoreChange) =>
      service.subscribe(() => {
        onStoreChange();
      }),
    () => service.getSnapshot(),
    () => IDLE_SNAPSHOT,
  );

  useEffect(() => {
    return () => {
      void service.disconnect();
    };
  }, [service]);

  const connectAsPublisher = useCallback(
    async (
      roomId: string,
      stream: MediaStream,
      quality: StreamQualitySettings,
    ) => {
      const credentials = await fetchLiveKitToken(roomId);
      if (credentials.role !== "publisher") {
        throw new Error(
          "Esta sessão não tem permissão para publicar a transmissão.",
        );
      }
      await service.connect(credentials.url, credentials.token, credentials.roomName);
      await service.publishScreenShare(stream, quality);
    },
    [service],
  );

  const connectAsViewer = useCallback(
    async (roomId: string) => {
      if (service.isConnectedTo(roomId)) {
        return;
      }
      const credentials = await fetchLiveKitToken(roomId);
      if (credentials.role !== "subscriber") {
        throw new Error("Não foi possível entrar como espectador.");
      }
      if (service.isConnectedTo(credentials.roomName)) {
        return;
      }
      await service.connect(
        credentials.url,
        credentials.token,
        credentials.roomName,
      );
    },
    [service],
  );

  const publishScreen = useCallback(
    async (stream: MediaStream, quality: StreamQualitySettings) => {
      await service.publishScreenShare(stream, quality);
    },
    [service],
  );

  const disconnect = useCallback(async () => {
    await service.disconnect();
  }, [service]);

  return {
    status: snapshot.status,
    errorMessage: snapshot.errorMessage,
    remoteStream: snapshot.remoteStream,
    participantCount: Math.max(0, snapshot.participantCount - 1),
    isConnected: snapshot.status === "connected",
    publishScreen,
    connectAsPublisher,
    connectAsViewer,
    disconnect,
  };
}
