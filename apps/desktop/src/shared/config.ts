/** Fallback se o build não embutir NEXUS_SITE_URL. */
export const DEFAULT_SITE_URL = "https://friends-live.vercel.app";

export function resolveSiteUrl(): string {
  const fromEnv =
    process.env.NEXUS_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return (fromEnv || DEFAULT_SITE_URL).replace(/\/$/, "");
}

export function watchUrl(siteUrl: string, roomId: string): string {
  return `${siteUrl}/watch/${encodeURIComponent(roomId)}`;
}

export function streamUrl(siteUrl: string, roomId: string): string {
  return `${siteUrl}/stream/${encodeURIComponent(roomId)}`;
}
