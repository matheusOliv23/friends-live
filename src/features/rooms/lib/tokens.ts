import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

const HOST_TOKEN_BYTES = 32;

export function generateRoomId(): string {
  // 16 chars URL-safe — cabe no padrão [A-Za-z0-9_-]{4,64}.
  return randomBytes(12).toString("base64url");
}

export function generateBroadcasterId(): string {
  return randomBytes(16).toString("hex");
}

export function generateHostToken(): string {
  return randomBytes(HOST_TOKEN_BYTES).toString("base64url");
}

/** Reserva o formato do futuro token de acesso do espectador. */
export function generateAccessToken(): string {
  return randomBytes(24).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function verifyToken(token: string, expectedHash: string): boolean {
  const actual = Buffer.from(hashToken(token), "hex");
  const expected = Buffer.from(expectedHash, "hex");

  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}
