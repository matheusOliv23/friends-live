import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest, NextResponse } from "next/server";

const COOKIE_PREFIX = "ns_host_";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24;

function getCookieSecret(): string {
  return process.env.HOST_COOKIE_SECRET ?? "nexus-stream-dev-secret";
}

/**
 * O cookie carrega `token.signature` para impedir que um cliente invente
 * um hostToken e se passe por anfitrião só conhecendo o roomId.
 */
export function sealHostToken(token: string): string {
  const signature = createHmac("sha256", getCookieSecret())
    .update(token)
    .digest("base64url");
  return `${token}.${signature}`;
}

export function unsealHostToken(value: string | undefined): string | null {
  if (!value) return null;
  const separator = value.lastIndexOf(".");
  if (separator <= 0) return null;

  const token = value.slice(0, separator);
  const signature = value.slice(separator + 1);
  const expected = createHmac("sha256", getCookieSecret())
    .update(token)
    .digest("base64url");

  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length) return null;
  if (!timingSafeEqual(actualBuffer, expectedBuffer)) return null;

  return token;
}

export function hostCookieName(roomId: string): string {
  return `${COOKIE_PREFIX}${roomId}`;
}

export function readHostTokenFromRequest(
  request: NextRequest,
  roomId: string,
): string | null {
  const fromCookie = unsealHostToken(
    request.cookies.get(hostCookieName(roomId))?.value,
  );
  if (fromCookie) return fromCookie;

  const header = request.headers.get("authorization");
  if (header?.startsWith("Bearer ")) {
    return header.slice("Bearer ".length).trim() || null;
  }

  return null;
}

export function attachHostCookie(
  response: NextResponse,
  roomId: string,
  hostToken: string,
): void {
  response.cookies.set({
    name: hostCookieName(roomId),
    value: sealHostToken(hostToken),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
}

export function clearHostCookie(response: NextResponse, roomId: string): void {
  response.cookies.set({
    name: hostCookieName(roomId),
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
