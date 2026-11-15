import { toPublicRoom } from "@/features/rooms/lib/mappers";
import {
  generateBroadcasterId,
  generateHostToken,
  generateRoomId,
  hashToken,
  verifyToken,
} from "@/features/rooms/lib/tokens";
import { getRoomRepository } from "@/features/rooms/repository/prisma-room-repository";
import type { RoomRepository } from "@/features/rooms/repository/room-repository";
import { AppError } from "@/lib/http";
import type { CreateRoomResult, PublicRoom, RoomRecord } from "@/types/rooms";

export class RoomService {
  constructor(private readonly rooms: RoomRepository = getRoomRepository()) {}

  async createRoom(): Promise<CreateRoomResult> {
    const hostToken = generateHostToken();
    const room = await this.rooms.create({
      id: generateRoomId(),
      broadcasterId: generateBroadcasterId(),
      hostTokenHash: hashToken(hostToken),
      accessTokenHash: null,
    });

    return { room: toPublicRoom(room), hostToken };
  }

  async getPublicRoom(id: string): Promise<PublicRoom> {
    return toPublicRoom(await this.requireRoom(id));
  }

  async getRoomWithHostCheck(
    id: string,
    hostToken: string | null,
  ): Promise<{ room: PublicRoom; isHost: boolean }> {
    const record = await this.requireRoom(id);
    return {
      room: toPublicRoom(record),
      isHost: hostToken ? verifyToken(hostToken, record.hostTokenHash) : false,
    };
  }

  async goLive(id: string, hostToken: string): Promise<PublicRoom> {
    const record = await this.requireAuthorizedHost(id, hostToken);

    if (record.status === "ended") {
      throw new AppError(
        "Esta sala já foi encerrada.",
        409,
        "room_already_ended",
      );
    }

    if (record.status === "live") {
      return toPublicRoom(record);
    }

    const updated = await this.rooms.updateStatus(id, "live", {
      liveAt: new Date(),
      mediaSessionId: id,
    });
    return toPublicRoom(updated);
  }

  async endRoom(id: string, hostToken: string): Promise<PublicRoom> {
    const record = await this.requireAuthorizedHost(id, hostToken);

    if (record.status === "ended") {
      return toPublicRoom(record);
    }

    const updated = await this.rooms.updateStatus(id, "ended", {
      endedAt: new Date(),
    });
    return toPublicRoom(updated);
  }

  private async requireRoom(id: string): Promise<RoomRecord> {
    const room = await this.rooms.findById(id);
    if (!room) {
      throw new AppError("Sala não encontrada.", 404, "room_not_found");
    }
    return room;
  }

  private async requireAuthorizedHost(
    id: string,
    hostToken: string,
  ): Promise<RoomRecord> {
    const room = await this.requireRoom(id);
    if (!verifyToken(hostToken, room.hostTokenHash)) {
      throw new AppError(
        "Você não tem permissão para gerenciar esta sala.",
        403,
        "host_forbidden",
      );
    }
    return room;
  }
}

let service: RoomService | null = null;

export function getRoomService(): RoomService {
  service ??= new RoomService();
  return service;
}
