import type { NextRequest } from "next/server";
import { readHostTokenFromRequest } from "@/features/rooms/lib/host-cookie";
import { getRoomService } from "@/features/rooms/services/room-service";
import {
  assertHostTokenPresent,
  assertValidRoomId,
} from "@/features/rooms/validation/room";
import { jsonError, jsonOk } from "@/lib/http";

export async function POST(
  request: NextRequest,
  context: RouteContext<"/api/rooms/[id]/live">,
) {
  try {
    const { id } = await context.params;
    assertValidRoomId(id);

    const hostToken = assertHostTokenPresent(
      readHostTokenFromRequest(request, id),
    );
    const room = await getRoomService().goLive(id, hostToken);
    return jsonOk({ room });
  } catch (error) {
    return jsonError(error);
  }
}
