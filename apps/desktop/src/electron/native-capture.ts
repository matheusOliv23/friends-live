import {
  BrowserWindow,
  desktopCapturer,
  session,
  type DesktopCapturerSource,
  type Streams,
} from "electron";
import { startAppAudioCapture, stopAppAudioCapture } from "./app-audio-capture";
import { pickCaptureSource } from "./source-picker";
import { getPidFromCapturerSourceId } from "./win-process";

export type CaptureAudioMode =
  | "app-loopback"
  | "window-only"
  | "system-loopback"
  | "virtual-device";

let captureAudioMode: CaptureAudioMode = "app-loopback";
let lastChosenSourceId: string | null = null;

export function setCaptureAudioMode(mode: CaptureAudioMode): void {
  captureAudioMode = mode;
  if (mode !== "app-loopback") {
    stopAppAudioCapture();
  }
}

export function getLastChosenSourceId(): string | null {
  return lastChosenSourceId;
}

/**
 * Intercepta getDisplayMedia no Chromium do Electron.
 * Mostra seletor de tela/janela e, no modo app-loopback, inicia WASAPI por PID.
 */
export function installDisplayMediaHandler(): void {
  session.defaultSession.setDisplayMediaRequestHandler(
    async (_request, callback) => {
      try {
        const sources = await desktopCapturer.getSources({
          types: ["window", "screen"],
          thumbnailSize: { width: 320, height: 180 },
          fetchWindowIcons: false,
        });

        const usable = sources.filter(
          (source) => !/electron|nexus stream/i.test(source.name),
        );
        const list = usable.length > 0 ? usable : sources;

        const parent =
          BrowserWindow.getFocusedWindow() ??
          BrowserWindow.getAllWindows()[0] ??
          null;

        const chosen = await pickCaptureSource(list, parent);
        if (!chosen) {
          stopAppAudioCapture();
          callback({});
          return;
        }

        lastChosenSourceId = chosen.id;

        const streams: Streams = {
          video: chosen,
        };

        if (captureAudioMode === "system-loopback") {
          stopAppAudioCapture();
          streams.audio = "loopback";
        } else if (captureAudioMode === "app-loopback") {
          // Vídeo da janela + áudio só desse processo (sem Discord).
          const pid = getPidFromCapturerSourceId(chosen.id);
          if (pid) {
            const started = startAppAudioCapture(pid);
            if (!started.ok) {
              console.warn("[nexus-desktop]", started.error);
            }
          } else {
            // Tela inteira não tem PID de app — cai sem áudio de processo.
            stopAppAudioCapture();
            console.warn(
              "[nexus-desktop] app-loopback exige janela de aplicativo (não tela inteira).",
            );
          }
        } else {
          stopAppAudioCapture();
        }

        callback(streams);
      } catch (error) {
        console.error("[nexus-desktop] displayMedia handler failed", error);
        stopAppAudioCapture();
        callback({});
      }
    },
  );
}

export async function listWindowSources(): Promise<
  Array<{ id: string; name: string }>
> {
  const sources = await desktopCapturer.getSources({
    types: ["window", "screen"],
    thumbnailSize: { width: 320, height: 180 },
  });
  return sources.map((source) => ({ id: source.id, name: source.name }));
}
