import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("nexusPicker", {
  getSources: () =>
    ipcRenderer.invoke("nexus:picker-get-sources") as Promise<
      Array<{ id: string; name: string; thumbnail: string }>
    >,
  select: (id: string) => ipcRenderer.send("nexus:picker-select", id),
  cancel: () => ipcRenderer.send("nexus:picker-cancel"),
});
