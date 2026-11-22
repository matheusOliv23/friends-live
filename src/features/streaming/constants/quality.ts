import type { StreamQualitySettings } from "@/types/streaming";

export const RESOLUTION_DIMENSIONS: Record<
  StreamQualitySettings["resolution"],
  { width: number; height: number }
> = {
  "720p": { width: 1280, height: 720 },
  "1080p": { width: 1920, height: 1080 },
  "1440p": { width: 2560, height: 1440 },
};

/** Qualidade fixa da transmissão (sem painel de ajustes). */
export const DEFAULT_QUALITY_SETTINGS: StreamQualitySettings = {
  resolution: "1080p",
  frameRate: 60,
  contentHint: "motion",
  includeDisplayAudio: true,
};

export function formatDetectedResolution(
  width: number | null,
  height: number | null,
): string | null {
  if (width === null || height === null) return null;
  return `${width}×${height}`;
}

export function formatQuality({
  resolution,
  frameRate,
}: Pick<StreamQualitySettings, "resolution" | "frameRate">): string {
  return `${resolution} · ${frameRate} fps`;
}
