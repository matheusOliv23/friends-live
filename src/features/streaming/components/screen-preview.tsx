"use client";

import { StatusIndicator } from "@/components/status-indicator";
import { MediaVideo } from "@/features/streaming/components/media-video";
import {
  formatDetectedResolution,
  formatQuality,
} from "@/features/streaming/constants/quality";
import type { DetectedCaptureSettings } from "@/features/streaming/types/capture";
import type { StreamQualitySettings } from "@/types/streaming";
import { cn } from "@/lib/utils";

interface ScreenPreviewProps {
  stream: MediaStream;
  quality: StreamQualitySettings;
  detected: DetectedCaptureSettings;
  className?: string;
}

/**
 * Preview local da captura. Não representa transmissão remota —
 * o mesmo MediaStream poderá ser publicado via LiveKit depois.
 */
export function ScreenPreview({
  stream,
  quality,
  detected,
  className,
}: ScreenPreviewProps) {
  const detectedLabel = formatDetectedResolution(
    detected.width,
    detected.height,
  );

  return (
    <div className={cn("absolute inset-0", className)}>
      <MediaVideo stream={stream} muted className="absolute inset-0" />

      <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
        <div className="rounded-md border bg-background/80 px-2.5 py-1.5 backdrop-blur">
          <StatusIndicator label="Preview local" tone="live" pulse />
        </div>
        <div className="rounded-md border bg-background/80 px-2.5 py-1.5 font-mono text-xs text-muted-foreground backdrop-blur">
          {detectedLabel ?? "Resolução detectando…"}
          <span className="mx-1.5 text-border">·</span>
          {formatQuality(quality)}
          {detected.frameRate !== null && (
            <>
              <span className="mx-1.5 text-border">·</span>
              ~{detected.frameRate} fps real
            </>
          )}
        </div>
      </div>
    </div>
  );
}
