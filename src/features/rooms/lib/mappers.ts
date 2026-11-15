import type { PublicRoom, RoomRecord, RoomStatus } from "@/types/rooms";

const ROOM_STATUSES = new Set<RoomStatus>(["waiting", "live", "ended"]);

export function isRoomStatus(value: string): value is RoomStatus {
  return ROOM_STATUSES.has(value as RoomStatus);
}

export function toPublicRoom(room: RoomRecord): PublicRoom {
  return {
    id: room.id,
    status: room.status,
    broadcasterId: room.broadcasterId,
    createdAt: room.createdAt.toISOString(),
    liveAt: room.liveAt?.toISOString() ?? null,
    endedAt: room.endedAt?.toISOString() ?? null,
    mediaSessionId: room.mediaSessionId,
  };
}

export function mapPrismaRoom(row: {
  id: string;
  status: string;
  broadcasterId: string;
  hostTokenHash: string;
  accessTokenHash: string | null;
  mediaSessionId: string | null;
  createdAt: Date;
  liveAt: Date | null;
  endedAt: Date | null;
}): RoomRecord {
  if (!isRoomStatus(row.status)) {
    throw new Error(`Status de sala inválido persistido: ${row.status}`);
  }

  return {
    id: row.id,
    status: row.status,
    broadcasterId: row.broadcasterId,
    hostTokenHash: row.hostTokenHash,
    accessTokenHash: row.accessTokenHash,
    mediaSessionId: row.mediaSessionId,
    createdAt: row.createdAt,
    liveAt: row.liveAt,
    endedAt: row.endedAt,
  };
}
