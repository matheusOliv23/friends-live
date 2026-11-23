import type { NextRequest } from "next/server";
import { getLiveKitTokenService } from "@/features/livekit/services/livekit-token.factory";
import { readHostTokenFromRequest } from "@/features/rooms/lib/host-cookie";
import { assertValidRoomId } from "@/features/rooms/validation/room";
import { applyCorsHeaders, corsPreflight } from "@/lib/cors";
import { jsonError, jsonOk } from "@/lib/http";

export async function POST(
  request: NextRequest,
  context: RouteContext<"/api/rooms/[id]/livekit-token">,
) {
  try {
    const { id } = await context.params;
    assertValidRoomId(id);

    const hostToken = readHostTokenFromRequest(request, id);
    const token = await getLiveKitTokenService().issueToken(id, hostToken);
    return applyCorsHeaders(request, jsonOk(token));
  } catch (error) {
    return applyCorsHeaders(request, jsonError(error));
  }
}

export async function OPTIONS(request: NextRequest) {
  const { NextResponse } = await import("next/server");
  return (
    corsPreflight(request) ??
    applyCorsHeaders(request, new NextResponse(null, { status: 204 }))
  );
}
