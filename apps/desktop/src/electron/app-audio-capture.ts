import { BrowserWindow } from "electron";
import loopback from "loopback-capture";

type CaptureHandle = {
  stop: () => void;
};

let active: CaptureHandle | null = null;
let activePid: number | null = null;

const SAMPLE_RATE = 48000;
const CHANNELS = 2;

export function getAppAudioFormat() {
  return { sampleRate: SAMPLE_RATE, channels: CHANNELS, bitDepth: 16 as const };
}

/**
 * Captura só o áudio do processo (e filhos) via WASAPI Application Loopback.
 * Não inclui Discord nem o resto do sistema.
 */
export function startAppAudioCapture(pid: number): { ok: true } | { ok: false; error: string } {
  stopAppAudioCapture();

  if (!pid || pid <= 0) {
    return { ok: false, error: "PID inválido para captura de áudio." };
  }

  try {
    const capture = new loopback.LoopbackCapture();
    capture.start(pid, (chunk: Buffer) => {
      const copy = Buffer.from(chunk);
      for (const win of BrowserWindow.getAllWindows()) {
        if (win.isDestroyed()) continue;
        win.webContents.send("nexus:app-audio-chunk", copy);
      }
    });

    active = {
      stop: () => {
        try {
          capture.stop();
        } catch {
          // ignore
        }
      },
    };
    activePid = pid;
    return { ok: true };
  } catch (error) {
    active = null;
    activePid = null;
    const message =
      error instanceof Error ? error.message : "Falha ao iniciar WASAPI loopback.";
    console.error("[nexus-desktop] app audio capture failed", error);
    return { ok: false, error: message };
  }
}

export function stopAppAudioCapture(): void {
  if (active) {
    active.stop();
    active = null;
  }
  activePid = null;
}

export function getActiveAppAudioPid(): number | null {
  return activePid;
}
