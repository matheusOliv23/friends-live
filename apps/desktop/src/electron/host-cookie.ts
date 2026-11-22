import { createHmac } from "node:crypto";
import type { Session } from "electron";

const COOKIE_PREFIX = "ns_host_";

function sealHostToken(token: string, secret: string): string {
  const signature = createHmac("sha256", secret)
    .update(token)
    .digest("base64url");
  return `${token}.${signature}`;
}

/**
 * Injeta o cookie httpOnly do host no session do Electron para a UI web
 * carregar /stream com o mesmo auth do browser.
 */
export async function injectHostCookie(options: {
  session: Session;
  siteUrl: string;
  roomId: string;
  hostToken: string;
  cookieSecret: string;
}): Promise<void> {
  const { session, siteUrl, roomId, hostToken, cookieSecret } = options;
  const url = new URL(siteUrl);
  const secure = url.protocol === "https:";

  const cookieUrl = siteUrl.replace(/\/$/, "");

  await session.cookies.set({
    url: cookieUrl,
    name: `${COOKIE_PREFIX}${roomId}`,
    value: sealHostToken(hostToken, cookieSecret),
    path: "/",
    httpOnly: true,
    secure,
    sameSite: secure ? "no_restriction" : "lax",
    expirationDate: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
  });

  // Garante que o cookie está persistido antes do loadURL do /stream.
  await session.cookies.flushStore();
}
