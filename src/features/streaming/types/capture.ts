import type { StreamQualitySettings } from "@/types/streaming";

export type ScreenCaptureStatus =
  | "idle"
  | "requesting"
  | "active"
  | "error"
  | "ended";

export type ScreenCaptureErrorCode =
  | "unsupported"
  | "permission_denied"
  | "cancelled"
  | "not_found"
  | "not_readable"
  | "overconstrained"
  | "unknown";

export interface DetectedCaptureSettings {
  width: number | null;
  height: number | null;
  frameRate: number | null;
}

export interface ScreenCaptureSnapshot {
  status: ScreenCaptureStatus;
  stream: MediaStream | null;
  errorCode: ScreenCaptureErrorCode | null;
  errorMessage: string | null;
  requestedQuality: StreamQualitySettings | null;
  detected: DetectedCaptureSettings;
}

export type ScreenCaptureListener = (snapshot: ScreenCaptureSnapshot) => void;
