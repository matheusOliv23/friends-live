import type { NextRequest } from "next/server";
import { readHostTokenFromRequest } from "@/features/rooms/lib/host-cookie";
import { getRoomService } from "@/features/rooms/services/room-service";
import { assertValidRoomId } from "@/features/rooms/validation/room";
import { jsonError, jsonOk } from "@/lib/http";

export async function GET(
  request: NextRequest,
  context: RouteContext<"/api/rooms/[id]">,
) {
  try {
    const { id } = await context.params;
    assertValidRoomId(id);

    const hostToken = readHostTokenFromRequest(request, id);
    const result = await getRoomService().getRoomWithHostCheck(id, hostToken);
    return jsonOk(result);
  } catch (error) {
    return jsonError(error);
  }
}
