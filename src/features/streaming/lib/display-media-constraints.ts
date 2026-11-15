import { RESOLUTION_DIMENSIONS } from "@/features/streaming/constants/quality";
import type {
  StreamFrameRate,
  StreamQualitySettings,
  StreamResolution,
} from "@/types/streaming";

const RESOLUTION_FALLBACK: StreamResolution[] = ["1080p", "720p"];
const FRAME_RATE_FALLBACK: StreamFrameRate[] = [60, 30];

/** Preferências extras de áudio de display (Chromium). */
type DisplayAudioExtras = {
  systemAudio?: "include" | "exclude";
};

function uniquePreservingOrder<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function buildVideoConstraints(
  resolution: StreamResolution,
  frameRate: StreamFrameRate,
): MediaTrackConstraints {
  const { width, height } = RESOLUTION_DIMENSIONS[resolution];

  return {
    width: { ideal: width },
    height: { ideal: height },
    frameRate: { ideal: frameRate, max: frameRate },
  };
}

/**
 * Áudio só da superfície compartilhada (aba/janela).
 * `systemAudio: "exclude"` evita capturar Discord e o restante do sistema —
 * isso era a causa do eco da própria voz na live.
 */
function withDisplayAudio(
  options: DisplayMediaStreamOptions,
  includeAudio: boolean,
): DisplayMediaStreamOptions {
  if (!includeAudio) {
    return { ...options, audio: false };
  }

  const extras: DisplayAudioExtras = { systemAudio: "exclude" };
  return {
    ...options,
    ...extras,
    audio: {
      // Evita tocar o áudio da aba duas vezes na máquina do anfitrião.
      suppressLocalAudioPlayback: true,
    } as MediaTrackConstraints,
  };
}

/**
 * Escada de constraints: qualidade pedida → fallbacks.
 * Se `includeDisplayAudio` estiver off, nem tenta pedir áudio.
 */
export function buildDisplayMediaConstraintLadder(
  quality: StreamQualitySettings,
): DisplayMediaStreamOptions[] {
  const resolutions = uniquePreservingOrder([
    quality.resolution,
    ...RESOLUTION_FALLBACK,
  ]);
  const frameRates = uniquePreservingOrder([
    quality.frameRate,
    ...FRAME_RATE_FALLBACK,
  ]);

  const videoSteps: DisplayMediaStreamOptions[] = [];

  for (const resolution of resolutions) {
    for (const frameRate of frameRates) {
      videoSteps.push({
        video: buildVideoConstraints(resolution, frameRate),
      });
    }
  }

  videoSteps.push({ video: true });

  const ladder: DisplayMediaStreamOptions[] = [];
  const wantAudio = quality.includeDisplayAudio;

  if (wantAudio) {
    for (const step of videoSteps) {
      ladder.push(withDisplayAudio(step, true));
    }
  }

  for (const step of videoSteps) {
    ladder.push(withDisplayAudio(step, false));
  }

  return ladder;
}

export function readDetectedSettings(
  track: MediaStreamTrack | undefined,
): {
  width: number | null;
  height: number | null;
  frameRate: number | null;
} {
  if (!track) {
    return { width: null, height: null, frameRate: null };
  }

  const settings = track.getSettings();
  return {
    width: typeof settings.width === "number" ? settings.width : null,
    height: typeof settings.height === "number" ? settings.height : null,
    frameRate:
      typeof settings.frameRate === "number"
        ? Math.round(settings.frameRate)
        : null,
  };
}

export function applyContentHint(
  track: MediaStreamTrack,
  contentHint: StreamQualitySettings["contentHint"],
): void {
  if ("contentHint" in track) {
    try {
      track.contentHint = contentHint;
    } catch {
      // Nem todos os navegadores aceitam contentHint em tracks de display.
    }
  }
}

export function streamHasLiveAudio(stream: MediaStream | null): boolean {
  if (!stream) return false;
  return stream
    .getAudioTracks()
    .some((track) => track.readyState === "live" && track.enabled);
}
