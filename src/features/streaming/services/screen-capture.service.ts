import {
  classifyCaptureError,
  getFriendlyCaptureMessage,
} from "@/features/streaming/lib/capture-errors";
import {
  applyContentHint,
  buildDisplayMediaConstraintLadder,
  readDetectedSettings,
} from "@/features/streaming/lib/display-media-constraints";
import type {
  DetectedCaptureSettings,
  ScreenCaptureErrorCode,
  ScreenCaptureListener,
  ScreenCaptureSnapshot,
  ScreenCaptureStatus,
} from "@/features/streaming/types/capture";
import type { StreamQualitySettings } from "@/types/streaming";

const EMPTY_DETECTED: DetectedCaptureSettings = {
  width: null,
  height: null,
  frameRate: null,
};

/**
 * Gerencia o ciclo de vida de `getDisplayMedia`.
 * O MediaStream fica disponível via `getStream()` para publicação futura (LiveKit).
 */
export class ScreenCaptureService {
  private stream: MediaStream | null = null;
  private status: ScreenCaptureStatus = "idle";
  private errorCode: ScreenCaptureErrorCode | null = null;
  private errorMessage: string | null = null;
  private requestedQuality: StreamQualitySettings | null = null;
  private detected: DetectedCaptureSettings = EMPTY_DETECTED;
  private snapshot: ScreenCaptureSnapshot = {
    status: "idle",
    stream: null,
    errorCode: null,
    errorMessage: null,
    requestedQuality: null,
    detected: EMPTY_DETECTED,
  };
  private readonly listeners = new Set<ScreenCaptureListener>();
  private readonly trackCleanups: Array<() => void> = [];
  private startGeneration = 0;

  static isSupported(): boolean {
    return (
      typeof navigator !== "undefined" &&
      !!navigator.mediaDevices &&
      typeof navigator.mediaDevices.getDisplayMedia === "function"
    );
  }

  subscribe(listener: ScreenCaptureListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getSnapshot(): ScreenCaptureSnapshot {
    return this.snapshot;
  }

  /** Fonte de mídia para preview local e futura publicação remota. */
  getStream(): MediaStream | null {
    return this.stream;
  }

  getVideoTracks(): MediaStreamTrack[] {
    return this.stream?.getVideoTracks() ?? [];
  }

  async start(quality: StreamQualitySettings): Promise<MediaStream> {
    if (!ScreenCaptureService.isSupported()) {
      this.setError("unsupported");
      throw new Error(getFriendlyCaptureMessage("unsupported"));
    }

    if (this.status === "requesting") {
      throw new Error("Já existe uma solicitação de captura em andamento.");
    }

    this.stopTracksOnly();
    this.startGeneration += 1;
    const generation = this.startGeneration;

    this.requestedQuality = quality;
    this.errorCode = null;
    this.errorMessage = null;
    this.detected = EMPTY_DETECTED;
    this.setStatus("requesting");

    try {
      const stream = await this.requestDisplayMedia(quality);
      if (generation !== this.startGeneration) {
        stopMediaStream(stream);
        throw new Error("A captura foi cancelada.");
      }

      this.attachStream(stream, quality);
      this.setStatus("active");
      return stream;
    } catch (error) {
      if (generation !== this.startGeneration) {
        throw error;
      }

      const classified = classifyCaptureError(error);
      this.clearStreamReferences();
      this.setError(classified.code, classified.message);
      throw new Error(classified.message);
    }
  }

  stop(): void {
    this.startGeneration += 1;
    this.stopTracksOnly();
    this.clearStreamReferences();

    if (this.status === "idle") return;

    this.errorCode = null;
    this.errorMessage = null;
    this.setStatus(this.status === "requesting" ? "idle" : "ended");
  }

  /** Limpeza total — usar no unmount do React. */
  dispose(): void {
    this.startGeneration += 1;
    this.stopTracksOnly();
    this.clearStreamReferences();
    this.status = "idle";
    this.errorCode = null;
    this.errorMessage = null;
    this.requestedQuality = null;
    this.detected = EMPTY_DETECTED;
    this.snapshot = {
      status: "idle",
      stream: null,
      errorCode: null,
      errorMessage: null,
      requestedQuality: null,
      detected: EMPTY_DETECTED,
    };
    this.listeners.clear();
  }

  private async requestDisplayMedia(
    quality: StreamQualitySettings,
  ): Promise<MediaStream> {
    const desktopStream = await tryDesktopEnhancedCapture(quality);
    if (desktopStream) return desktopStream;

    const ladder = buildDisplayMediaConstraintLadder(quality);
    let lastError: unknown;

    for (const constraints of ladder) {
      try {
        return await navigator.mediaDevices.getDisplayMedia(constraints);
      } catch (error) {
        lastError = error;
        const classified = classifyCaptureError(error);

        // Cancelamento / permissão / ausência de fonte não devem tentar fallback.
        if (
          classified.code === "cancelled" ||
          classified.code === "permission_denied" ||
          classified.code === "not_found" ||
          classified.code === "unsupported"
        ) {
          throw error;
        }
      }
    }

    throw lastError ?? new Error(getFriendlyCaptureMessage("unknown"));
  }

  private attachStream(
    stream: MediaStream,
    quality: StreamQualitySettings,
  ): void {
    this.stream = stream;

    for (const track of stream.getVideoTracks()) {
      applyContentHint(track, quality.contentHint);

      const onEnded = () => {
        this.handleTrackEnded();
      };
      track.addEventListener("ended", onEnded);
      this.trackCleanups.push(() => {
        track.removeEventListener("ended", onEnded);
      });
    }

    this.detected = readDetectedSettings(stream.getVideoTracks()[0]);
    this.emit();
  }

  private handleTrackEnded(): void {
    const hasLiveVideo = this.getVideoTracks().some(
      (track) => track.readyState === "live",
    );
    if (hasLiveVideo) return;

    this.stopTracksOnly();
    this.clearStreamReferences();
    this.errorCode = null;
    this.errorMessage = null;
    this.setStatus("ended");
  }

  private stopTracksOnly(): void {
    for (const cleanup of this.trackCleanups.splice(0)) {
      cleanup();
    }

    if (this.stream) {
      stopMediaStream(this.stream);
    }
  }

  private clearStreamReferences(): void {
    this.stream = null;
    this.detected = EMPTY_DETECTED;
  }

  private setStatus(status: ScreenCaptureStatus): void {
    this.status = status;
    this.emit();
  }

  private setError(
    code: ScreenCaptureErrorCode,
    message = getFriendlyCaptureMessage(code),
  ): void {
    this.status = "error";
    this.errorCode = code;
    this.errorMessage = message;
    this.emit();
  }

  private emit(): void {
    this.snapshot = {
      status: this.status,
      stream: this.stream,
      errorCode: this.errorCode,
      errorMessage: this.errorMessage,
      requestedQuality: this.requestedQuality,
      detected: this.detected,
    };
    for (const listener of this.listeners) {
      listener(this.snapshot);
    }
  }
}

function stopMediaStream(stream: MediaStream): void {
  for (const track of stream.getTracks()) {
    track.stop();
  }
}

type DesktopAudioPrefs = {
  audioMode:
    | "app-loopback"
    | "window-only"
    | "system-loopback"
    | "virtual-device";
  selectedDeviceId: string;
};

type NexusDesktopBridge = {
  getAudioPrefs?: () => Promise<DesktopAudioPrefs>;
  stopAppAudio?: () => Promise<void>;
  onAppAudioChunk?: (handler: (chunk: Uint8Array) => void) => () => void;
  getAppAudioFormat?: () => Promise<{
    sampleRate: number;
    channels: number;
    bitDepth: 16;
  }>;
};

/**
 * No app Electron: vídeo via desktopCapturer + áudio WASAPI por app
 * (sem Discord), loopback do sistema, ou dispositivo virtual.
 */
async function tryDesktopEnhancedCapture(
  quality: StreamQualitySettings,
): Promise<MediaStream | null> {
  const bridge = (
    globalThis as typeof globalThis & { nexusDesktop?: NexusDesktopBridge }
  ).nexusDesktop;
  if (!bridge?.getAudioPrefs) return null;

  const prefs = await bridge.getAudioPrefs();
  const wantDisplayAudio =
    prefs.audioMode === "system-loopback"
      ? true
      : quality.includeDisplayAudio &&
        prefs.audioMode !== "virtual-device" &&
        prefs.audioMode !== "app-loopback" &&
        prefs.audioMode !== "window-only";

  const displayStream = await navigator.mediaDevices.getDisplayMedia({
    video: true,
    audio: wantDisplayAudio,
  });

  if (prefs.audioMode === "app-loopback") {
    const appTrack = await createAppLoopbackAudioTrack(bridge);
    if (appTrack) {
      for (const track of displayStream.getAudioTracks()) {
        displayStream.removeTrack(track);
        track.stop();
      }
      displayStream.addTrack(appTrack);
    }
    return displayStream;
  }

  if (prefs.audioMode !== "virtual-device" || !prefs.selectedDeviceId) {
    return displayStream;
  }

  try {
    const audioStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: { exact: prefs.selectedDeviceId },
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
      video: false,
    });
    const audioTrack = audioStream.getAudioTracks()[0];
    if (!audioTrack) return displayStream;

    for (const track of displayStream.getAudioTracks()) {
      displayStream.removeTrack(track);
      track.stop();
    }
    displayStream.addTrack(audioTrack);
    return displayStream;
  } catch {
    return displayStream;
  }
}

type AudioTrackGeneratorCtor = new (init: {
  kind: "audio";
}) => MediaStreamTrack & {
  writable: WritableStream<AudioData>;
};

type AudioDataCtor = new (init: {
  format: "s16";
  sampleRate: number;
  numberOfFrames: number;
  numberOfChannels: number;
  timestamp: number;
  data: ArrayBufferView;
}) => AudioData & { close: () => void };

/**
 * Converte PCM s16le estéreo 48 kHz do main process em MediaStreamTrack.
 */
async function createAppLoopbackAudioTrack(
  bridge: NexusDesktopBridge,
): Promise<MediaStreamTrack | null> {
  const TrackGenerator = (
    globalThis as typeof globalThis & {
      MediaStreamTrackGenerator?: AudioTrackGeneratorCtor;
      AudioData?: AudioDataCtor;
    }
  ).MediaStreamTrackGenerator;
  const AudioDataType = (
    globalThis as typeof globalThis & {
      AudioData?: AudioDataCtor;
    }
  ).AudioData;

  if (!bridge.onAppAudioChunk || !TrackGenerator || !AudioDataType) {
    return null;
  }

  const format = (await bridge.getAppAudioFormat?.()) ?? {
    sampleRate: 48000,
    channels: 2,
    bitDepth: 16 as const,
  };

  const generator = new TrackGenerator({ kind: "audio" });
  const writer = generator.writable.getWriter();
  let timestampUs = 0;
  let closed = false;

  const unsubscribe = bridge.onAppAudioChunk((chunk) => {
    if (closed || chunk.byteLength < 4) return;
    const aligned = chunk.byteLength & ~1;
    const frames = Math.floor(aligned / 2 / format.channels);
    if (frames <= 0) return;

    const copy = new Int16Array(frames * format.channels);
    copy.set(
      new Int16Array(chunk.buffer, chunk.byteOffset, copy.length),
    );

    try {
      const audioData = new AudioDataType({
        format: "s16",
        sampleRate: format.sampleRate,
        numberOfFrames: frames,
        numberOfChannels: format.channels,
        timestamp: timestampUs,
        data: copy,
      });
      timestampUs += Math.round((frames / format.sampleRate) * 1_000_000);
      void writer.write(audioData).finally(() => audioData.close());
    } catch {
      // drop underrun / closed writer
    }
  });

  const stop = () => {
    if (closed) return;
    closed = true;
    unsubscribe();
    void writer.close().catch(() => undefined);
    void bridge.stopAppAudio?.();
  };

  generator.addEventListener("ended", stop, { once: true });
  const originalStop = generator.stop.bind(generator);
  generator.stop = () => {
    stop();
    originalStop();
  };

  return generator;
}
