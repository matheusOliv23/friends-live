import type {
  StreamContentHint,
  StreamFrameRate,
  StreamQualitySettings,
  StreamResolution,
} from "@/types/streaming";

interface Option<TValue> {
  value: TValue;
  label: string;
  description?: string;
}

export const RESOLUTION_OPTIONS: readonly Option<StreamResolution>[] = [
  { value: "720p", label: "720p" },
  { value: "1080p", label: "1080p" },
  { value: "1440p", label: "1440p" },
];

export const FRAME_RATE_OPTIONS: readonly Option<StreamFrameRate>[] = [
  { value: 30, label: "30 fps" },
  { value: 60, label: "60 fps" },
];

export const CONTENT_HINT_OPTIONS: readonly Option<StreamContentHint>[] = [
  {
    value: "motion",
    label: "Movimento",
    description: "Prioriza fluidez. Ideal para jogos.",
  },
  {
    value: "detail",
    label: "Nitidez",
    description: "Prioriza detalhes. Ideal para textos e aplicativos.",
  },
];

export const RESOLUTION_DIMENSIONS: Record<
  StreamResolution,
  { width: number; height: number }
> = {
  "720p": { width: 1280, height: 720 },
  "1080p": { width: 1920, height: 1080 },
  "1440p": { width: 2560, height: 1440 },
};

export const DEFAULT_QUALITY_SETTINGS: StreamQualitySettings = {
  resolution: "1080p",
  frameRate: 60,
  contentHint: "motion",
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
