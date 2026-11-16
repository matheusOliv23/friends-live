import { getWatchPath } from "@/features/rooms/lib/room-id";

export function getStreamPath(roomId: string): `/stream/${string}` {
  return `/stream/${encodeURIComponent(roomId)}`;
}

export function getShareableWatchUrl(roomId: string, origin?: string): string {
  const path = getWatchPath(roomId);
  if (origin) return `${origin.replace(/\/$/, "")}${path}`;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (siteUrl) return `${siteUrl.replace(/\/$/, "")}${path}`;

  if (typeof window !== "undefined") return `${window.location.origin}${path}`;
  return path;
}

export { getWatchPath };
