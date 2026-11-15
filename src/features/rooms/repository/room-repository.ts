import type { RoomCreateInput, RoomRecord, RoomStatus } from "@/types/rooms";

export interface RoomRepository {
  create(input: RoomCreateInput): Promise<RoomRecord>;
  findById(id: string): Promise<RoomRecord | null>;
  updateStatus(
    id: string,
    status: RoomStatus,
    patch: {
      liveAt?: Date | null;
      endedAt?: Date | null;
      mediaSessionId?: string | null;
    },
  ): Promise<RoomRecord>;
}
