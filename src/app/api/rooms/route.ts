import type { NextRequest } from "next/server";
import { attachHostCookie } from "@/features/rooms/lib/host-cookie";
import { getRoomService } from "@/features/rooms/services/room-service";
import { applyCorsHeaders, isDesktopClient } from "@/lib/cors";
import { jsonError, jsonOk } from "@/lib/http";

export async function POST(request: NextRequest) {
  try {
    const result = await getRoomService().createRoom();
    const desktop = isDesktopClient(request);

    // Web: hostToken só no cookie. Desktop: também no corpo (Bearer depois).
    const body = desktop
      ? { room: result.room, hostToken: result.hostToken }
      : { room: result.room };

    const response = jsonOk(body, { status: 201 });
    attachHostCookie(
      response,
      result.room.id,
      result.hostToken,
      desktop ? "desktop" : "web",
    );
    return applyCorsHeaders(request, response);
  } catch (error) {
    return applyCorsHeaders(request, jsonError(error));
  }
}

export async function OPTIONS(request: NextRequest) {
  const { NextResponse } = await import("next/server");
  return applyCorsHeaders(request, new NextResponse(null, { status: 204 }));
}
