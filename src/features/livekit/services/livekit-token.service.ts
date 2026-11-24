import { randomBytes } from "node:crypto";
import { AccessToken, type VideoGrant } from "livekit-server-sdk";
import { verifyToken } from "@/features/rooms/lib/tokens";
import type { RoomRepository } from "@/features/rooms/repository/room-repository";
import type { LiveKitTokenResponse } from "@/features/livekit/types";
import { AppError } from "@/lib/http";
import { getLiveKitServerConfig } from "@/lib/livekit-env";

/** Sessões longas (jogo + alt-tab) precisam de JWT válido se o sinal reconectar. */
const TOKEN_TTL = "24h";
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

export class LiveKitTokenService {
  constructor(private readonly rooms: RoomRepository) {}

  /**
   * O papel é determinado apenas pela autenticação do anfitrião —
   * o cliente não escolhe se é publisher ou subscriber.
   */
  async issueToken(
    roomId: string,
    hostToken: string | null,
  ): Promise<LiveKitTokenResponse> {
    const config = getLiveKitServerConfig();
    const room = await this.rooms.findById(roomId);

    if (!room) {
      throw new AppError("Sala não encontrada.", 404, "room_not_found");
    }

    // Salas `ended` legadas ainda podem emitir token — o host revive com goLive.

    const isHost =
      hostToken !== null && verifyToken(hostToken, room.hostTokenHash);

    if (isHost) {
      return this.createPublisherToken(config, room.id, room.broadcasterId);
    }

    return this.createSubscriberToken(config, room.id);
  }

  private async createPublisherToken(
    config: ReturnType<typeof getLiveKitServerConfig>,
    roomName: string,
    broadcasterId: string,
  ): Promise<LiveKitTokenResponse> {
    const identity = `host_${broadcasterId}`;
    const grant: VideoGrant = {
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: false,
    };

    return this.signToken(config, {
      identity,
      name: "Transmissor",
      grant,
      role: "publisher",
      roomName,
    });
  }

  private async createSubscriberToken(
    config: ReturnType<typeof getLiveKitServerConfig>,
    roomName: string,
  ): Promise<LiveKitTokenResponse> {
    const identity = `viewer_${randomBytes(8).toString("hex")}`;
    const grant: VideoGrant = {
      roomJoin: true,
      room: roomName,
      canPublish: false,
      canSubscribe: true,
      canPublishData: false,
    };

    return this.signToken(config, {
      identity,
      name: "Espectador",
      grant,
      role: "subscriber",
      roomName,
    });
  }

  private async signToken(
    config: ReturnType<typeof getLiveKitServerConfig>,
    options: {
      identity: string;
      name: string;
      grant: VideoGrant;
      role: LiveKitTokenResponse["role"];
      roomName: string;
    },
  ): Promise<LiveKitTokenResponse> {
    const at = new AccessToken(config.apiKey, config.apiSecret, {
      identity: options.identity,
      name: options.name,
      ttl: TOKEN_TTL,
    });
    at.addGrant(options.grant);

    const token = await at.toJwt();
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS).toISOString();

    return {
      token,
      url: config.url,
      role: options.role,
      identity: options.identity,
      roomName: options.roomName,
      expiresAt,
    };
  }
}

/** Exportado para testes unitários sem banco. */
export function createLiveKitTokenServiceForTests(
  rooms: RoomRepository,
): LiveKitTokenService {
  return new LiveKitTokenService(rooms);
}
