import { NextResponse, type NextRequest } from "next/server";
import { getSiteUrl } from "@/lib/site";

const DESKTOP_CLIENT_HEADER = "x-nexus-client";

export function isDesktopClient(request: NextRequest): boolean {
  return request.headers.get(DESKTOP_CLIENT_HEADER)?.toLowerCase() === "desktop";
}

export function getAllowedOrigins(): string[] {
  const origins = new Set<string>();
  origins.add(getSiteUrl().origin);
  origins.add("http://localhost:3000");
  origins.add("http://localhost:3001");
  origins.add("http://127.0.0.1:3000");
  origins.add("http://127.0.0.1:5173");
  origins.add("http://localhost:5173");
  origins.add("app://nexus-desktop");

  const extra = process.env.DESKTOP_CORS_ORIGINS?.split(",") ?? [];
  for (const origin of extra) {
    const trimmed = origin.trim();
    if (trimmed) origins.add(trimmed);
  }

  return [...origins];
}

export function resolveCorsOrigin(request: NextRequest): string | null {
  const origin = request.headers.get("origin");
  if (!origin) return null;
  if (getAllowedOrigins().includes(origin)) return origin;
  if (origin === "null" && isDesktopClient(request)) {
    return getAllowedOrigins()[0] ?? null;
  }
  return null;
}

export function applyCorsHeaders(
  request: NextRequest,
  response: NextResponse,
): NextResponse {
  const allowed = resolveCorsOrigin(request);
  if (allowed) {
    response.headers.set("Access-Control-Allow-Origin", allowed);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Nexus-Client",
    );
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    );
    response.headers.set("Vary", "Origin");
  }
  return response;
}

export function corsPreflight(request: NextRequest): NextResponse | null {
  if (request.method !== "OPTIONS") return null;
  return applyCorsHeaders(request, new NextResponse(null, { status: 204 }));
}
