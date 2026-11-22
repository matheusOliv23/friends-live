"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  endRoom,
  fetchRoom,
  goLiveRoom,
  RoomApiError,
} from "@/features/rooms/api/client";
import type { PublicRoom } from "@/types/rooms";

interface UseRoomOptions {
  roomId: string;
  pollIntervalMs?: number;
  enabled?: boolean;
}

interface UseRoomResult {
  room: PublicRoom | null;
  isHost: boolean;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  goLive: () => Promise<PublicRoom>;
  end: () => Promise<PublicRoom>;
}

export function useRoom({
  roomId,
  pollIntervalMs = 0,
  enabled = true,
}: UseRoomOptions): UseRoomResult {
  const [room, setRoom] = useState<PublicRoom | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const refresh = useCallback(async () => {
    if (!enabled) return;

    const requestId = ++requestIdRef.current;

    try {
      const result = await fetchRoom(roomId);
      if (requestId !== requestIdRef.current) return;
      setRoom(result.room);
      setIsHost(result.isHost);
      setError(null);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      const message =
        err instanceof RoomApiError
          ? err.message
          : "Não foi possível carregar a sala.";
      setError(message);
      if (err instanceof RoomApiError && err.status === 404) {
        setRoom(null);
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [enabled, roomId]);

  useEffect(() => {
    if (!enabled) return;

    const frame = window.requestAnimationFrame(() => {
      void refresh();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [enabled, refresh]);

  useEffect(() => {
    if (!enabled || pollIntervalMs <= 0) return;

    const interval = window.setInterval(() => {
      void refresh();
    }, pollIntervalMs);

    return () => window.clearInterval(interval);
  }, [enabled, pollIntervalMs, refresh]);

  const goLive = useCallback(async () => {
    const next = await goLiveRoom(roomId);
    setRoom(next);
    setIsHost(true);
    return next;
  }, [roomId]);

  const end = useCallback(async () => {
    const next = await endRoom(roomId);
    setRoom(next);
    setIsHost(true);
    return next;
  }, [roomId]);

  return { room, isHost, isLoading, error, refresh, goLive, end };
}
