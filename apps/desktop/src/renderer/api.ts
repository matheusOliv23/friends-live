export interface PublicRoom {
  id: string;
  status: "waiting" | "live" | "ended";
  broadcasterId: string;
  createdAt: string;
  liveAt: string | null;
  endedAt: string | null;
  mediaSessionId: string | null;
}

export class DesktopApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
    this.name = "DesktopApiError";
  }
}

async function parseJson<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => null)) as {
    error?: { code?: string; message?: string };
  } | null;

  if (!response.ok) {
    throw new DesktopApiError(
      body?.error?.message ?? "Falha na solicitação.",
      response.status,
      body?.error?.code ?? "request_failed",
    );
  }

  return body as T;
}

function desktopHeaders(hostToken?: string | null): HeadersInit {
  const headers: Record<string, string> = {
    "X-Nexus-Client": "desktop",
  };
  if (hostToken) {
    headers.Authorization = `Bearer ${hostToken}`;
  }
  return headers;
}

export async function createRoom(
  siteUrl: string,
): Promise<{ room: PublicRoom; hostToken: string }> {
  const response = await fetch(`${siteUrl}/api/rooms`, {
    method: "POST",
    credentials: "include",
    headers: desktopHeaders(),
  });
  return parseJson(response);
}

export async function fetchRoom(
  siteUrl: string,
  roomId: string,
  hostToken?: string | null,
): Promise<{ room: PublicRoom; isHost: boolean }> {
  const response = await fetch(
    `${siteUrl}/api/rooms/${encodeURIComponent(roomId)}`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: desktopHeaders(hostToken),
    },
  );
  return parseJson(response);
}

const HOST_TOKEN_STORE = "nexus.desktop.hostTokens";

export function saveHostToken(roomId: string, hostToken: string): void {
  const raw = localStorage.getItem(HOST_TOKEN_STORE);
  const map = raw ? (JSON.parse(raw) as Record<string, string>) : {};
  map[roomId] = hostToken;
  localStorage.setItem(HOST_TOKEN_STORE, JSON.stringify(map));
}

export function loadHostToken(roomId: string): string | null {
  const raw = localStorage.getItem(HOST_TOKEN_STORE);
  if (!raw) return null;
  try {
    const map = JSON.parse(raw) as Record<string, string>;
    return map[roomId] ?? null;
  } catch {
    return null;
  }
}
