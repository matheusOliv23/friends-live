import { app, BrowserWindow, dialog, ipcMain } from "electron";
import { autoUpdater } from "electron-updater";

export type UpdateStatusPayload =
  | { status: "checking" }
  | { status: "available"; version: string }
  | { status: "not-available" }
  | { status: "downloading"; percent: number }
  | { status: "ready"; version: string }
  | { status: "error"; message: string };

let wired = false;

function send(
  getWindow: () => BrowserWindow | null,
  payload: UpdateStatusPayload,
): void {
  const win = getWindow();
  if (!win || win.isDestroyed()) return;
  win.webContents.send("nexus:update-status", payload);
}

/**
 * Auto-update via GitHub Releases (NSIS). Só roda no app empacotado.
 */
export function setupAutoUpdater(getWindow: () => BrowserWindow | null): void {
  if (!app.isPackaged) return;

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  // Releases públicos no repo — sem token no cliente.
  autoUpdater.allowPrerelease = false;

  autoUpdater.on("checking-for-update", () => {
    send(getWindow, { status: "checking" });
  });

  autoUpdater.on("update-available", (info) => {
    send(getWindow, {
      status: "available",
      version: info.version,
    });
  });

  autoUpdater.on("update-not-available", () => {
    send(getWindow, { status: "not-available" });
  });

  autoUpdater.on("download-progress", (progress) => {
    send(getWindow, {
      status: "downloading",
      percent: Math.round(progress.percent),
    });
  });

  autoUpdater.on("update-downloaded", async (info) => {
    send(getWindow, {
      status: "ready",
      version: info.version,
    });

    const win = getWindow();
    const result = await dialog.showMessageBox(win ?? undefined, {
      type: "info",
      title: "Atualização pronta",
      message: `A versão ${info.version} foi baixada.`,
      detail: "Reinicie agora para aplicar, ou continue e reinicie depois.",
      buttons: ["Reiniciar agora", "Depois"],
      defaultId: 0,
      cancelId: 1,
    });

    if (result.response === 0) {
      autoUpdater.quitAndInstall(false, true);
    }
  });

  autoUpdater.on("error", (error) => {
    console.error("[nexus-desktop] autoUpdater", error);
    send(getWindow, {
      status: "error",
      message: error.message || "Falha ao verificar atualização.",
    });
  });

  if (!wired) {
    wired = true;
    ipcMain.handle("nexus:check-for-updates", async () => {
      try {
        const result = await autoUpdater.checkForUpdates();
        return {
          ok: true as const,
          version: result?.updateInfo.version ?? null,
        };
      } catch (error) {
        return {
          ok: false as const,
          message:
            error instanceof Error
              ? error.message
              : "Falha ao verificar atualização.",
        };
      }
    });

    ipcMain.handle("nexus:install-update", () => {
      autoUpdater.quitAndInstall(false, true);
    });
  }

  // Aguarda a janela estabilizar antes de checar.
  setTimeout(() => {
    void autoUpdater.checkForUpdates().catch((error) => {
      console.error("[nexus-desktop] checkForUpdates", error);
    });
  }, 4000);
}
