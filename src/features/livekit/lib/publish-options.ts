import { Track, type TrackPublishOptions, type VideoEncoding } from "livekit-client";
import { RESOLUTION_DIMENSIONS } from "@/features/streaming/constants/quality";
import type { StreamQualitySettings } from "@/types/streaming";

/**
 * Bitrates iniciais para screen share (jogos/apps).
 * Valores são alvos — a rede e o hardware podem reduzir.
 */
const BITRATE_BY_QUALITY: Record<
  StreamQualitySettings["resolution"],
  Record<StreamQualitySettings["frameRate"], number>
> = {
  "720p": { 30: 1_800_000, 60: 2_800_000 },
  "1080p": { 30: 3_500_000, 60: 5_000_000 },
  "1440p": { 30: 5_000_000, 60: 7_000_000 },
};

export function buildScreenSharePublishOptions(
  quality: StreamQualitySettings,
): TrackPublishOptions {
  const { width, height } = RESOLUTION_DIMENSIONS[quality.resolution];
  const encoding: VideoEncoding = {
    maxBitrate: BITRATE_BY_QUALITY[quality.resolution][quality.frameRate],
    maxFramerate: quality.frameRate,
  };

  return {
    name: "screen",
    source: Track.Source.ScreenShare,
    simulcast: quality.frameRate <= 30,
    screenShareEncoding: encoding,
    videoEncoding: encoding,
    degradationPreference: "maintain-resolution",
    // Dimensões informativas para o encoder escolher camadas.
    ...(width && height ? {} : {}),
  };
}

export function buildScreenShareAudioPublishOptions(): TrackPublishOptions {
  return {
    name: "screen-audio",
    source: Track.Source.ScreenShareAudio,
    dtx: true,
    red: true,
  };
}
