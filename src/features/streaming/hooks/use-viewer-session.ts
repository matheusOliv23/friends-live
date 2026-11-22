"use client";

import { useEffect, useRef } from "react";
import { useLiveKitSession } from "@/features/livekit/hooks/use-livekit-session";
import type { LiveKitConnectionStatus } from "@/features/livekit/types";
import { roomStatusToViewerStatus } from "@/features/rooms/constants/status";
import { useRoom } from "@/features/rooms/hooks/use-room";
import type {
  ConnectionQuality,
  StreamQualitySettings,
  ViewerStatus,
} from "@/types/streaming";

export interface ViewerSession {
  roomId: string;
  status: ViewerStatus;
  stream: MediaStream | null;
  quality: StreamQualitySettings | null;
  connectionQuality: ConnectionQuality;
  mediaConnectionStatus: LiveKitConnectionStatus;
  mediaError: string | null;
  /** Espectadores conectados (exclui o anfitrião). */
  viewerCount: number;
  isLoading: boolean;
  error: string | null;
  notFound: boolean;
}

function mapLiveKitQuality(status: LiveKitConnectionStatus): ConnectionQuality {
  switch (status) {
    case "connected":
      return "good";
    case "reconnecting":
    case "connecting":
      return "fair";
    case "error":
      return "poor";
    default:
      return "unknown";
  }
}

function shouldAttemptJoin(status: LiveKitConnectionStatus): boolean {
  return (
    status === "idle" ||
    status === "disconnected" ||
    status === "error"
  );
}

export function useViewerSession(roomId: string): ViewerSession {
  const roomState = useRoom({
    roomId,
    pollIntervalMs: 3000,
  });
  const {
    status: mediaStatus,
    errorMessage: mediaError,
    remoteStream,
    participantCount,
    connectAsViewer,
    disconnect,
  } = useLiveKitSession();

  const canJoinMedia = !!roomState.room;
  const joinGenerationRef = useRef(0);

  useEffect(() => {
    if (!canJoinMedia) {
      joinGenerationRef.current += 1;
      void disconnect();
      return;
    }

    if (!shouldAttemptJoin(mediaStatus)) {
      return;
    }

    const generation = ++joinGenerationRef.current;
    let retryTimer: number | undefined;

    const join = async () => {
      try {
        await connectAsViewer(roomId);
      } catch {
        if (generation !== joinGenerationRef.current) return;
        retryTimer = window.setTimeout(() => {
          if (generation === joinGenerationRef.current) {
            void join();
          }
        }, 2500);
      }
    };

    void join();

    return () => {
      if (retryTimer !== undefined) {
        window.clearTimeout(retryTimer);
      }
    };
  }, [roomId, canJoinMedia, connectAsViewer, disconnect, mediaStatus]);

  if (roomState.isLoading && !roomState.room) {
    return {
      roomId,
      status: "connecting",
      stream: null,
      quality: null,
      connectionQuality: "unknown",
      mediaConnectionStatus: mediaStatus,
      mediaError,
      viewerCount: 0,
      isLoading: true,
      error: null,
      notFound: false,
    };
  }

  if (!roomState.room) {
    return {
      roomId,
      status: "ended",
      stream: null,
      quality: null,
      connectionQuality: "unknown",
      mediaConnectionStatus: mediaStatus,
      mediaError,
      viewerCount: 0,
      isLoading: false,
      error: roomState.error,
      notFound: true,
    };
  }

  const roomStatus = roomStatusToViewerStatus(roomState.room.status);
  const hasRemoteVideo = remoteStream !== null;

  let status: ViewerStatus = roomStatus;
  if (roomStatus === "live" && !hasRemoteVideo) {
    status =
      mediaStatus === "connecting" ||
      mediaStatus === "reconnecting" ||
      mediaStatus === "idle" ||
      mediaStatus === "disconnected"
        ? "connecting"
        : "live";
  }

  return {
    roomId,
    status,
    stream: remoteStream,
    quality: null,
    connectionQuality: mapLiveKitQuality(mediaStatus),
    mediaConnectionStatus: mediaStatus,
    mediaError,
    viewerCount: participantCount,
    isLoading: false,
    error: roomState.error,
    notFound: false,
  };
}
