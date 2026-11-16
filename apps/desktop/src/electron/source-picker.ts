import { existsSync } from "node:fs";
import path from "node:path";
import { BrowserWindow, ipcMain } from "electron";
import type { DesktopCapturerSource } from "electron";

type PickerResult = { id: string } | { cancelled: true };

let pickerInFlight: Promise<DesktopCapturerSource | null> | null = null;
let activeSources: Array<{ id: string; name: string; thumbnail: string }> = [];

function resolvePickerPreload(): string {
  for (const name of ["picker-preload.mjs", "picker-preload.js"]) {
    const full = path.join(__dirname, name);
    if (existsSync(full)) return full;
  }
  return path.join(__dirname, "picker-preload.js");
}

function resolvePickerHtml(): string {
  const candidates = [
    path.join(__dirname, "picker.html"),
    path.join(__dirname, "../src/electron/picker.html"),
  ];
  for (const full of candidates) {
    if (existsSync(full)) return full;
  }
  return path.join(__dirname, "picker.html");
}

/**
 * Janela modal para o usuário escolher tela/janela antes do getDisplayMedia.
 */
export async function pickCaptureSource(
  sources: DesktopCapturerSource[],
  parent: BrowserWindow | null,
): Promise<DesktopCapturerSource | null> {
  if (sources.length === 0) return null;
  if (sources.length === 1) return sources[0] ?? null;

  if (pickerInFlight) return pickerInFlight;

  pickerInFlight = runPicker(sources, parent).finally(() => {
    pickerInFlight = null;
  });
  return pickerInFlight;
}

async function runPicker(
  sources: DesktopCapturerSource[],
  parent: BrowserWindow | null,
): Promise<DesktopCapturerSource | null> {
  activeSources = sources.map((source) => ({
    id: source.id,
    name: source.name,
    thumbnail: source.thumbnail.isEmpty()
      ? ""
      : source.thumbnail.toDataURL(),
  }));

  const result = await openPickerWindow(parent);
  if ("cancelled" in result) return null;
  return sources.find((source) => source.id === result.id) ?? null;
}

function openPickerWindow(
  parent: BrowserWindow | null,
): Promise<PickerResult> {
  return new Promise((resolve) => {
    ensurePickerIpc();

    const win = new BrowserWindow({
      width: 740,
      height: 580,
      minWidth: 520,
      minHeight: 400,
      parent: parent ?? undefined,
      modal: Boolean(parent),
      show: false,
      autoHideMenuBar: true,
      title: "Escolher o que transmitir",
      backgroundColor: "#09090b",
      webPreferences: {
        preload: resolvePickerPreload(),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false,
      },
    });

    let settled = false;
    const finish = (result: PickerResult) => {
      if (settled) return;
      settled = true;
      if (!win.isDestroyed()) win.close();
      resolve(result);
    };

    currentFinish = finish;

    win.on("closed", () => {
      finish({ cancelled: true });
      if (currentFinish === finish) currentFinish = null;
    });

    void win.loadFile(resolvePickerHtml()).then(() => {
      if (!win.isDestroyed()) {
        win.show();
        win.focus();
      }
    });
  });
}

let pickerIpcReady = false;
let currentFinish: ((result: PickerResult) => void) | null = null;

function ensurePickerIpc(): void {
  if (pickerIpcReady) return;
  pickerIpcReady = true;

  ipcMain.handle("nexus:picker-get-sources", () => activeSources);

  ipcMain.on("nexus:picker-select", (_event, id: string) => {
    if (typeof id === "string" && id) {
      currentFinish?.({ id });
    }
  });

  ipcMain.on("nexus:picker-cancel", () => {
    currentFinish?.({ cancelled: true });
  });
}
