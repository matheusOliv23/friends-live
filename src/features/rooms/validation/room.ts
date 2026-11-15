import { isValidRoomId } from "@/features/rooms/lib/room-id";
import { AppError } from "@/lib/http";

export function assertValidRoomId(id: string): string {
  if (!isValidRoomId(id)) {
    throw new AppError("Identificador de sala inválido.", 400, "invalid_room_id");
  }
  return id;
}

export function assertHostTokenPresent(token: string | null): string {
  if (!token) {
    throw new AppError(
      "Autorização do anfitrião ausente.",
      401,
      "host_unauthorized",
    );
  }
  return token;
}
