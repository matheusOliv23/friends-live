export type RoomStatus = "waiting" | "live" | "ended";

/** Entidade completa da sala (inclui segredos — nunca serializar para o cliente). */
export interface RoomRecord {
  id: string;
  status: RoomStatus;
  broadcasterId: string;
  hostTokenHash: string;
  accessTokenHash: string | null;
  mediaSessionId: string | null;
  createdAt: Date;
  liveAt: Date | null;
  endedAt: Date | null;
}

/** Dados públicos da sala — seguros para API e UI. */
export interface PublicRoom {
  id: string;
  status: RoomStatus;
  broadcasterId: string;
  createdAt: string;
  liveAt: string | null;
  endedAt: string | null;
  /** Campo reservado para a futura sessão de mídia (LiveKit/WebRTC). */
  mediaSessionId: string | null;
}

export interface CreateRoomResult {
  room: PublicRoom;
  /** Entregue apenas na criação; nunca é persistido em texto puro. */
  hostToken: string;
}

export interface RoomCreateInput {
  id: string;
  broadcasterId: string;
  hostTokenHash: string;
  accessTokenHash?: string | null;
}
