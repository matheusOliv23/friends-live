import { mapPrismaRoom } from "@/features/rooms/lib/mappers";
import type { RoomRepository } from "@/features/rooms/repository/room-repository";
import { prisma } from "@/lib/prisma";
import type { RoomCreateInput, RoomRecord, RoomStatus } from "@/types/rooms";

export class PrismaRoomRepository implements RoomRepository {
  async create(input: RoomCreateInput): Promise<RoomRecord> {
    const row = await prisma.room.create({
      data: {
        id: input.id,
        status: "waiting",
        broadcasterId: input.broadcasterId,
        hostTokenHash: input.hostTokenHash,
        accessTokenHash: input.accessTokenHash ?? null,
      },
    });

    return mapPrismaRoom(row);
  }

  async findById(id: string): Promise<RoomRecord | null> {
    const row = await prisma.room.findUnique({ where: { id } });
    return row ? mapPrismaRoom(row) : null;
  }

  async updateStatus(
    id: string,
    status: RoomStatus,
    patch: {
      liveAt?: Date | null;
      endedAt?: Date | null;
      mediaSessionId?: string | null;
    },
  ): Promise<RoomRecord> {
    const row = await prisma.room.update({
      where: { id },
      data: {
        status,
        ...(patch.liveAt !== undefined ? { liveAt: patch.liveAt } : {}),
        ...(patch.endedAt !== undefined ? { endedAt: patch.endedAt } : {}),
        ...(patch.mediaSessionId !== undefined
          ? { mediaSessionId: patch.mediaSessionId }
          : {}),
      },
    });

    return mapPrismaRoom(row);
  }
}

let repository: RoomRepository | null = null;

export function getRoomRepository(): RoomRepository {
  repository ??= new PrismaRoomRepository();
  return repository;
}
