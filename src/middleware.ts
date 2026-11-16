import { NextResponse, type NextRequest } from "next/server";
import { applyCorsHeaders, corsPreflight } from "@/lib/cors";

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const preflight = corsPreflight(request);
  if (preflight) return preflight;

  const response = NextResponse.next();
  return applyCorsHeaders(request, response);
}

export const config = {
  matcher: ["/api/:path*"],
};
