import { contextBridge, ipcRenderer } from "electron";
import type {
  DesktopAudioPrefs,
  DesktopDeepLink,
  NexusDesktopApi,
  UpdateStatusPayload,
} from "../shared/desktop-api";

const api: NexusDesktopApi = {
  getConfig: () => ipcRenderer.invoke("nexus:get-config"),
  consumeDeepLink: () => ipcRenderer.invoke("nexus:consume-deep-link"),
  openStream: (payload) => ipcRenderer.invoke("nexus:open-stream", payload),
  openWatch: (roomId) => ipcRenderer.invoke("nexus:open-watch", roomId ?? null),
  openExternal: (url) => ipcRenderer.invoke("nexus:open-external", url),
  watchUrl: (roomId) => ipcRenderer.invoke("nexus:watch-url", roomId),
  listSources: () => ipcRenderer.invoke("nexus:list-sources"),
  goHome: () => ipcRenderer.invoke("nexus:go-home"),
  setAudioPrefs: (prefs: DesktopAudioPrefs) =>
    ipcRenderer.invoke("nexus:set-audio-prefs", prefs),
  getAudioPrefs: () => ipcRenderer.invoke("nexus:get-audio-prefs"),
  getAppAudioFormat: () => ipcRenderer.invoke("nexus:get-app-audio-format"),
  stopAppAudio: () => ipcRenderer.invoke("nexus:stop-app-audio"),
  setPowerSave: (enabled) => ipcRenderer.invoke("nexus:set-power-save", enabled),
  checkForUpdates: () => ipcRenderer.invoke("nexus:check-for-updates"),
  installUpdate: () => ipcRenderer.invoke("nexus:install-update"),
  onAppAudioChunk: (handler) => {
    const listener = (_event: Electron.IpcRendererEvent, payload: unknown) => {
      if (payload instanceof Uint8Array) {
        handler(payload);
        return;
      }
      if (payload instanceof ArrayBuffer) {
        handler(new Uint8Array(payload));
        return;
      }
      if (Buffer.isBuffer(payload)) {
        handler(new Uint8Array(payload.buffer, payload.byteOffset, payload.byteLength));
        return;
      }
    };
    ipcRenderer.on("nexus:app-audio-chunk", listener);
    return () => ipcRenderer.removeListener("nexus:app-audio-chunk", listener);
  },
  onDeepLink: (handler) => {
    const listener = (
      _event: Electron.IpcRendererEvent,
      payload: DesktopDeepLink,
    ) => {
      handler(payload);
    };
    ipcRenderer.on("nexus:deep-link", listener);
    return () => ipcRenderer.removeListener("nexus:deep-link", listener);
  },
  onUpdateStatus: (handler) => {
    const listener = (
      _event: Electron.IpcRendererEvent,
      payload: UpdateStatusPayload,
    ) => {
      handler(payload);
    };
    ipcRenderer.on("nexus:update-status", listener);
    return () => ipcRenderer.removeListener("nexus:update-status", listener);
  },
};

contextBridge.exposeInMainWorld("nexusDesktop", api);
