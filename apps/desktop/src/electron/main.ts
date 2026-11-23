import { existsSync } from "node:fs";
import path from "node:path";
import { app, BrowserWindow, ipcMain, powerSaveBlocker, shell } from "electron";
import {
  getAppAudioFormat,
  stopAppAudioCapture,
} from "./app-audio-capture";
import { setupAutoUpdater } from "./auto-updater";
import {
  installHostAuthHeader,
  rememberHostToken,
} from "./host-auth";
import { injectHostCookie } from "./host-cookie";
import {
  installDisplayMediaHandler,
  listWindowSources,
  setCaptureAudioMode,
} from "./native-capture";
import { resolveSiteUrl, streamUrl, watchUrl } from "../shared/config";
import type { CaptureAudioMode } from "../shared/desktop-api";

function resolvePreloadPath(): string {
  const candidates = ["preload.mjs", "preload.js", "preload.cjs"];
  for (const name of candidates) {
    const full = path.join(__dirname, name);
    if (existsSync(full)) return full;
  }
  return path.join(__dirname, "preload.js");
}

const isDev = !app.isPackaged;
let mainWindow: BrowserWindow | null = null;
let pendingDeepLink: { roomId: string; hostToken?: string } | null = null;

const SITE_URL = resolveSiteUrl();
const COOKIE_SECRET =
  process.env.HOST_COOKIE_SECRET?.trim() || "nexus-stream-dev-secret";

type AudioPrefs = {
  audioMode: CaptureAudioMode;
  selectedDeviceId: string;
};

let audioPrefs: AudioPrefs = {
  audioMode: "app-loopback",
  selectedDeviceId: "",
};

let powerSaveBlockerId: number | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 960,
    minHeight: 640,
    title: "Friends Stream",
    backgroundColor: "#09090b",
    autoHideMenuBar: true,
    webPreferences: {
      preload: resolvePreloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      // Sem isso, minimizar a janela throttla timers/WebSocket e o LiveKit cai
      // com "could not establish signal connection".
      backgroundThrottling: false,
    },
  });

  // Garante o mesmo comportamento se a preferência for reaplicada em runtime.
  mainWindow.webContents.setBackgroundThrottling(false);

  if (isDev) {
    void mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    void mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function extractDeepLink(raw: string): {
  roomId: string;
  hostToken?: string;
} | null {
  try {
    const normalized = raw.replace(/^nexus:\/\//i, "https://nexus/");
    const url = new URL(normalized);
    const parts = url.pathname.split("/").filter(Boolean);
    const roomId =
      parts[0] === "stream" && parts[1]
        ? parts[1]
        : parts[0]
          ? parts[0]
          : null;
    if (!roomId) return null;
    const hostToken =
      url.searchParams.get("ht")?.trim() ||
      url.searchParams.get("hostToken")?.trim() ||
      undefined;
    return { roomId, hostToken };
  } catch {
    return null;
  }
}

function handleDeepLink(raw: string): void {
  const parsed = extractDeepLink(raw);
  if (!parsed) return;
  if (mainWindow) {
    mainWindow.webContents.send("nexus:deep-link", parsed);
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  } else {
    pendingDeepLink = parsed;
  }
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", (_event, argv) => {
    const link = argv.find((arg) => arg.startsWith("nexus://"));
    if (link) handleDeepLink(link);
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient("nexus", process.execPath, [
        path.resolve(process.argv[1]),
      ]);
    }
  } else {
    app.setAsDefaultProtocolClient("nexus");
  }

  app.whenReady().then(() => {
    setCaptureAudioMode(audioPrefs.audioMode);
    installDisplayMediaHandler();
    createWindow();
    if (mainWindow) {
      installHostAuthHeader(mainWindow.webContents.session, SITE_URL);
    }
    setupAutoUpdater(() => mainWindow);

    const bootLink = process.argv.find((arg) => arg.startsWith("nexus://"));
    if (bootLink) handleDeepLink(bootLink);

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}

app.on("open-url", (event, url) => {
  event.preventDefault();
  handleDeepLink(url);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("nexus:get-config", () => ({
  siteUrl: SITE_URL,
  isPackaged: app.isPackaged,
  pendingDeepLink,
}));

ipcMain.handle("nexus:consume-deep-link", () => {
  const value = pendingDeepLink;
  pendingDeepLink = null;
  return value;
});

ipcMain.handle(
  "nexus:open-stream",
  async (
    _event,
    payload: { roomId: string; hostToken?: string | null },
  ) => {
    if (!mainWindow) return { ok: false as const };

    if (payload.hostToken) {
      rememberHostToken(payload.roomId, payload.hostToken);
      installHostAuthHeader(mainWindow.webContents.session, SITE_URL);
      await injectHostCookie({
        session: mainWindow.webContents.session,
        siteUrl: SITE_URL,
        roomId: payload.roomId,
        hostToken: payload.hostToken,
        cookieSecret: COOKIE_SECRET,
      });
    }

    const target = streamUrl(SITE_URL, payload.roomId);
    await mainWindow.loadURL(target);
    return { ok: true as const, url: target };
  },
);

ipcMain.handle("nexus:open-external", async (_event, url: string) => {
  await shell.openExternal(url);
});

ipcMain.handle(
  "nexus:open-watch",
  async (_event, roomId?: string | null) => {
    if (!mainWindow) return { ok: false as const };
    stopAppAudioCapture();
    const target = roomId?.trim()
      ? watchUrl(SITE_URL, roomId.trim())
      : `${SITE_URL}/watch`;
    await mainWindow.loadURL(target);
    return { ok: true as const, url: target };
  },
);

ipcMain.handle("nexus:watch-url", (_event, roomId: string) =>
  watchUrl(SITE_URL, roomId),
);

ipcMain.handle("nexus:list-sources", async () => listWindowSources());

ipcMain.handle("nexus:go-home", async () => {
  stopAppAudioCapture();
  if (!mainWindow) return;
  // Cache-bust pra garantir remount limpo do launcher (sem estado “Criando…”).
  if (isDev) {
    await mainWindow.loadURL(`http://localhost:5173/?t=${Date.now()}`);
  } else {
    await mainWindow.loadFile(path.join(__dirname, "../dist/index.html"), {
      query: { t: String(Date.now()) },
    });
  }
});

ipcMain.handle("nexus:set-audio-prefs", (_event, prefs: AudioPrefs) => {
  audioPrefs = prefs;
  setCaptureAudioMode(prefs.audioMode);
  return audioPrefs;
});

ipcMain.handle("nexus:get-audio-prefs", () => audioPrefs);

ipcMain.handle("nexus:get-app-audio-format", () => getAppAudioFormat());

ipcMain.handle("nexus:stop-app-audio", () => {
  stopAppAudioCapture();
});

ipcMain.handle("nexus:set-power-save", (_event, enabled: boolean) => {
  if (enabled) {
    if (powerSaveBlockerId === null) {
      powerSaveBlockerId = powerSaveBlocker.start("prevent-app-suspension");
    }
    return;
  }
  if (powerSaveBlockerId !== null) {
    powerSaveBlocker.stop(powerSaveBlockerId);
    powerSaveBlockerId = null;
  }
});
