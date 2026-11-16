import type { NextRequest } from "next/server";
import { readHostTokenFromRequest } from "@/features/rooms/lib/host-cookie";
import { getRoomService } from "@/features/rooms/services/room-service";
import {
  assertHostTokenPresent,
  assertValidRoomId,
} from "@/features/rooms/validation/room";
import { applyCorsHeaders } from "@/lib/cors";
import { AppError, jsonError, jsonOk } from "@/lib/http";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * Entrega o hostToken ao anfitrião autenticado (cookie) para abrir a mesma
 * sala no app desktop via deep link `nexus://stream/{id}?ht=...`.
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    assertValidRoomId(id);

    const hostToken = assertHostTokenPresent(
      readHostTokenFromRequest(request, id),
    );

    const { isHost, room } = await getRoomService().getRoomWithHostCheck(
      id,
      hostToken,
    );
    if (!isHost) {
      throw new AppError(
        "Acesso restrito ao anfitrião.",
        403,
        "host_forbidden",
      );
    }
    if (room.status === "ended") {
      throw new AppError("Esta sala já foi encerrada.", 409, "room_ended");
    }

    const deepLink = `nexus://stream/${encodeURIComponent(id)}?ht=${encodeURIComponent(hostToken)}`;
    return applyCorsHeaders(
      request,
      jsonOk({ roomId: id, hostToken, deepLink }),
    );
  } catch (error) {
    return applyCorsHeaders(request, jsonError(error));
  }
}

export async function OPTIONS(request: NextRequest) {
  const { NextResponse } = await import("next/server");
  return applyCorsHeaders(request, new NextResponse(null, { status: 204 }));
}
