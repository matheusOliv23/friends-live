export type BroadcastStatus = "idle" | "live" | "ended";

export type ViewerStatus = "connecting" | "waiting" | "live" | "ended";

export type StreamResolution = "720p" | "1080p" | "1440p";

export type StreamFrameRate = 30 | 60;

/**
 * Espelha os valores de `MediaStreamTrack.contentHint` usados para vídeo:
 * "motion" prioriza fluidez (jogos) e "detail" prioriza nitidez (texto, apps).
 */
export type StreamContentHint = "motion" | "detail";

export interface StreamQualitySettings {
  resolution: StreamResolution;
  frameRate: StreamFrameRate;
  contentHint: StreamContentHint;
  /**
   * Áudio da aba/janela compartilhada (não é microfone).
   * Desligado por padrão para evitar eco com Discord/voice chat.
   */
  includeDisplayAudio: boolean;
}

export type ConnectionQuality = "unknown" | "good" | "fair" | "poor";
