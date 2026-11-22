/** Repo GitHub onde o electron-builder publica o Setup (auto-update + download). */
export const DESKTOP_GITHUB = {
  owner: "matheusOliv23",
  repo: "friends-live",
} as const;

export function desktopReleasesUrl(): string {
  return `https://github.com/${DESKTOP_GITHUB.owner}/${DESKTOP_GITHUB.repo}/releases/latest`;
}

/** Prefer Setup (instalador NSIS); ignora Portable. */
export function isDesktopSetupAsset(name: string): boolean {
  const n = name.toLowerCase();
  return n.endsWith(".exe") && n.includes("setup") && !n.includes("portable");
}
