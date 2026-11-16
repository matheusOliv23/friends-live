type NexusDesktopBridge = {
  goHome?: () => Promise<void>;
};

export function getNexusDesktop(): NexusDesktopBridge | null {
  if (typeof globalThis === "undefined") return null;
  const bridge = (
    globalThis as typeof globalThis & { nexusDesktop?: NexusDesktopBridge }
  ).nexusDesktop;
  return bridge ?? null;
}

export function isNexusDesktop(): boolean {
  return getNexusDesktop() !== null;
}

/** No app Electron, volta ao launcher local em vez da home do site. */
export async function goDesktopOrWebHome(): Promise<"desktop" | "web"> {
  const bridge = getNexusDesktop();
  if (bridge?.goHome) {
    await bridge.goHome();
    return "desktop";
  }
  return "web";
}
