import { contextBridge, ipcRenderer } from "electron";
import type {
  DesktopAudioPrefs,
  DesktopDeepLink,
  NexusDesktopApi,
} from "../shared/desktop-api";

const api: NexusDesktopApi = {
  getConfig: () => ipcRenderer.invoke("nexus:get-config"),
  consumeDeepLink: () => ipcRenderer.invoke("nexus:consume-deep-link"),
  openStream: (payload) => ipcRenderer.invoke("nexus:open-stream", payload),
  openExternal: (url) => ipcRenderer.invoke("nexus:open-external", url),
  watchUrl: (roomId) => ipcRenderer.invoke("nexus:watch-url", roomId),
  listSources: () => ipcRenderer.invoke("nexus:list-sources"),
  goHome: () => ipcRenderer.invoke("nexus:go-home"),
  setAudioPrefs: (prefs: DesktopAudioPrefs) =>
    ipcRenderer.invoke("nexus:set-audio-prefs", prefs),
  getAudioPrefs: () => ipcRenderer.invoke("nexus:get-audio-prefs"),
  getAppAudioFormat: () => ipcRenderer.invoke("nexus:get-app-audio-format"),
  stopAppAudio: () => ipcRenderer.invoke("nexus:stop-app-audio"),
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
};

contextBridge.exposeInMainWorld("nexusDesktop", api);
