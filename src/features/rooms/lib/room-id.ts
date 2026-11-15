const ROOM_ID_PATTERN = /^[A-Za-z0-9_-]{4,64}$/;
const WATCH_PATH_PATTERN = /\/watch\/([^/?#]+)/;

export function isValidRoomId(value: string): boolean {
  return ROOM_ID_PATTERN.test(value);
}

export function getWatchPath(roomId: string): `/watch/${string}` {
  return `/watch/${encodeURIComponent(roomId)}`;
}

/**
 * Aceita tanto um link completo (`https://.../watch/abc123`) quanto
 * apenas o código da sala. Retorna `null` quando o valor é inválido.
 */
export function parseRoomInput(input: string): string | null {
  const value = input.trim();
  const candidate = WATCH_PATH_PATTERN.exec(value)?.[1] ?? value;

  let roomId: string;
  try {
    roomId = decodeURIComponent(candidate);
  } catch {
    return null;
  }

  return isValidRoomId(roomId) ? roomId : null;
}
