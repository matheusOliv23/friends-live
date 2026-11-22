import type { Session } from "electron";

const hostTokensByRoom = new Map<string, string>();
let handlerInstalled = false;

export function rememberHostToken(roomId: string, hostToken: string): void {
  hostTokensByRoom.set(roomId, hostToken);
}

export function forgetHostToken(roomId: string): void {
  hostTokensByRoom.delete(roomId);
}

/**
 * Garante Authorization: Bearer nos fetches da API de salas.
 * Cobre o caso em que o cookie httpOnly ainda não foi enviado / secret diverge.
 */
export function installHostAuthHeader(session: Session, siteUrl: string): void {
  if (handlerInstalled) return;
  handlerInstalled = true;

  const base = siteUrl.replace(/\/$/, "");
  const filter = {
    urls: [`${base}/api/rooms/*`, `${base}/api/rooms/*/*`],
  };

  session.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
    const headers = { ...details.requestHeaders };
    headers["X-Nexus-Client"] = "desktop";

    const match = details.url.match(/\/api\/rooms\/([^/?#]+)/i);
    const roomId = match?.[1] ? decodeURIComponent(match[1]) : null;
    const token = roomId ? hostTokensByRoom.get(roomId) : null;

    if (token && !headers.Authorization && !headers.authorization) {
      headers.Authorization = `Bearer ${token}`;
    }

    callback({ requestHeaders: headers });
  });
}
