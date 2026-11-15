import {
  attachHostCookie,
} from "@/features/rooms/lib/host-cookie";
import { getRoomService } from "@/features/rooms/services/room-service";
import { jsonError, jsonOk } from "@/lib/http";

export async function POST() {
  try {
    const result = await getRoomService().createRoom();
    // O hostToken vai apenas no cookie httpOnly — nunca no corpo da resposta.
    const response = jsonOk({ room: result.room }, { status: 201 });
    attachHostCookie(response, result.room.id, result.hostToken);
    return response;
  } catch (error) {
    return jsonError(error);
  }
}
