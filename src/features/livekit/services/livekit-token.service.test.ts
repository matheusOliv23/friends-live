/** @vitest-environment node */
import { beforeEach, describe, expect, it } from "vitest";
import { createLiveKitTokenServiceForTests } from "@/features/livekit/services/livekit-token.service";
import { hashToken } from "@/features/rooms/lib/tokens";
import type { RoomRepository } from "@/features/rooms/repository/room-repository";
import type { RoomRecord } from "@/types/rooms";
import { AppError } from "@/lib/http";

const HOST_TOKEN = "host-secret-token-value";

function createRoom(overrides: Partial<RoomRecord> = {}): RoomRecord {
  return {
    id: "room_abc123",
    status: "waiting",
    broadcasterId: "broadcaster-1",
    hostTokenHash: hashToken(HOST_TOKEN),
    accessTokenHash: null,
    mediaSessionId: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    liveAt: null,
    endedAt: null,
    ...overrides,
  };
}

function createMemoryRepo(initial?: RoomRecord | null): RoomRepository {
  let room = initial ?? null;
  return {
    async create() {
      throw new Error("not implemented");
    },
    async findById(id) {
      return room && room.id === id ? room : null;
    },
    async updateStatus(id, status, patch) {
      if (!room || room.id !== id) throw new Error("missing");
      room = {
        ...room,
        status,
        liveAt: patch.liveAt !== undefined ? patch.liveAt : room.liveAt,
        endedAt: patch.endedAt !== undefined ? patch.endedAt : room.endedAt,
        mediaSessionId:
          patch.mediaSessionId !== undefined
            ? patch.mediaSessionId
            : room.mediaSessionId,
      };
      return room;
    },
  };
}

describe("LiveKitTokenService", () => {
  beforeEach(() => {
    process.env.LIVEKIT_URL = "wss://example.livekit.cloud";
    process.env.LIVEKIT_API_KEY = "APItestkey";
    process.env.LIVEKIT_API_SECRET = "secretsecretsecretsecretsecret12";
  });

  it("gera token de publicação apenas para o anfitrião autenticado", async () => {
    const service = createLiveKitTokenServiceForTests(
      createMemoryRepo(createRoom()),
    );

    const token = await service.issueToken("room_abc123", HOST_TOKEN);

    expect(token.role).toBe("publisher");
    expect(token.identity).toBe("host_broadcaster-1");
    expect(token.roomName).toBe("room_abc123");
    expect(token.url).toBe("wss://example.livekit.cloud");
    expect(token.token.split(".")).toHaveLength(3);
  });

  it("gera token somente de assinatura para espectadores", async () => {
    const service = createLiveKitTokenServiceForTests(
      createMemoryRepo(createRoom({ status: "live" })),
    );

    const token = await service.issueToken("room_abc123", null);

    expect(token.role).toBe("subscriber");
    expect(token.identity.startsWith("viewer_")).toBe(true);
  });

  it("não promove espectador a publisher com hostToken inválido", async () => {
    const service = createLiveKitTokenServiceForTests(
      createMemoryRepo(createRoom()),
    );

    const token = await service.issueToken("room_abc123", "token-errado");
    expect(token.role).toBe("subscriber");
  });

  it("rejeita sala inexistente", async () => {
    const service = createLiveKitTokenServiceForTests(createMemoryRepo(null));

    await expect(service.issueToken("missing", null)).rejects.toMatchObject({
      code: "room_not_found",
      status: 404,
    } satisfies Partial<AppError>);
  });

  it("rejeita sala encerrada", async () => {
    const service = createLiveKitTokenServiceForTests(
      createMemoryRepo(createRoom({ status: "ended" })),
    );

    await expect(service.issueToken("room_abc123", HOST_TOKEN)).rejects.toMatchObject({
      code: "room_already_ended",
    });
  });

  it("falha quando LiveKit não está configurado", async () => {
    delete process.env.LIVEKIT_URL;
    delete process.env.LIVEKIT_API_KEY;
    delete process.env.LIVEKIT_API_SECRET;

    const service = createLiveKitTokenServiceForTests(
      createMemoryRepo(createRoom()),
    );

    await expect(service.issueToken("room_abc123", HOST_TOKEN)).rejects.toMatchObject({
      code: "livekit_not_configured",
      status: 503,
    });
  });
});
