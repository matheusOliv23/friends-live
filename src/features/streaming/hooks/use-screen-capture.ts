"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { DEFAULT_QUALITY_SETTINGS } from "@/features/streaming/constants/quality";
import { ScreenCaptureService } from "@/features/streaming/services/screen-capture.service";
import type {
  DetectedCaptureSettings,
  ScreenCaptureErrorCode,
  ScreenCaptureStatus,
} from "@/features/streaming/types/capture";
import type { StreamQualitySettings } from "@/types/streaming";

const INITIAL_DETECTED: DetectedCaptureSettings = {
  width: null,
  height: null,
  frameRate: null,
};

const IDLE_SNAPSHOT = {
  status: "idle" as const,
  stream: null,
  errorCode: null,
  errorMessage: null,
  requestedQuality: null,
  detected: INITIAL_DETECTED,
};

export interface UseScreenCaptureResult {
  status: ScreenCaptureStatus;
  stream: MediaStream | null;
  errorCode: ScreenCaptureErrorCode | null;
  errorMessage: string | null;
  quality: StreamQualitySettings;
  detected: DetectedCaptureSettings;
  isSupported: boolean;
  isActive: boolean;
  isRequesting: boolean;
  start: () => Promise<MediaStream>;
  stop: () => void;
  /** Expõe o MediaStream para publicação futura (LiveKit/WebRTC). */
  getPublishableStream: () => MediaStream | null;
}

export function useScreenCapture(): UseScreenCaptureResult {
  const [service] = useState(() => new ScreenCaptureService());
  const quality = DEFAULT_QUALITY_SETTINGS;

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
      // Em Strict Mode o service sobrevive ao ciclo setup/cleanup;
      // apenas liberamos tracks e listeners de mídia.
      service.stop();
    };
  }, [service]);

  const start = useCallback(async () => {
    return service.start(quality);
  }, [quality, service]);

  const stop = useCallback(() => {
    service.stop();
  }, [service]);

  const getPublishableStream = useCallback(
    () => service.getStream(),
    [service],
  );

  return {
    status: snapshot.status,
    stream: snapshot.stream,
    errorCode: snapshot.errorCode,
    errorMessage: snapshot.errorMessage,
    quality,
    detected: snapshot.detected,
    isSupported: ScreenCaptureService.isSupported(),
    isActive: snapshot.status === "active",
    isRequesting: snapshot.status === "requesting",
    start,
    stop,
    getPublishableStream,
  };
}
