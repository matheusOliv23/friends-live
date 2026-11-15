import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockConnect,
  mockDisconnect,
  mockPublishTrack,
  mockUnpublishTrack,
  MockRoom,
  ConnectionState,
  RoomEvent,
  Track,
} = vi.hoisted(() => {
  const mockConnect = vi.fn();
  const mockDisconnect = vi.fn();
  const mockPublishTrack = vi.fn();
  const mockUnpublishTrack = vi.fn();

  class MockRoom {
    state = "disconnected";
    numParticipants = 1;
    remoteParticipants = new Map();
    localParticipant = {
      publishTrack: mockPublishTrack,
      unpublishTrack: mockUnpublishTrack,
    };

    connect = mockConnect.mockImplementation(async () => {
      this.state = "connected";
    });
    disconnect = mockDisconnect;
    on = vi.fn().mockReturnValue(this);
    removeAllListeners = vi.fn();
  }

  return {
    mockConnect,
    mockDisconnect,
    mockPublishTrack,
    mockUnpublishTrack,
    MockRoom,
    ConnectionState: {
      Disconnected: "disconnected",
      Connecting: "connecting",
      Connected: "connected",
      Reconnecting: "reconnecting",
      SignalReconnecting: "signalReconnecting",
    },
    RoomEvent: {
      ConnectionStateChanged: "connectionStateChanged",
      Disconnected: "disconnected",
      Reconnecting: "reconnecting",
      SignalReconnecting: "signalReconnecting",
      Reconnected: "reconnected",
      ParticipantConnected: "participantConnected",
      ParticipantDisconnected: "participantDisconnected",
      TrackPublished: "trackPublished",
      TrackSubscribed: "trackSubscribed",
      TrackUnsubscribed: "trackUnsubscribed",
      TrackSubscriptionStatusChanged: "trackSubscriptionStatusChanged",
      MediaDevicesError: "mediaDevicesError",
    },
    Track: {
      Source: {
        ScreenShare: "screen_share",
        ScreenShareAudio: "screen_share_audio",
      },
      Kind: { Video: "video", Audio: "audio" },
    },
  };
});

vi.mock("livekit-client", () => ({
  Room: MockRoom,
  ConnectionState,
  RoomEvent,
  Track,
}));

import { LiveKitSessionService } from "@/features/livekit/services/livekit-session.service";
import { createMockMediaStream } from "@/features/streaming/test-utils/media-mocks";
import type { StreamQualitySettings } from "@/types/streaming";

const quality: StreamQualitySettings = {
  resolution: "1080p",
  frameRate: 60,
  contentHint: "motion",
};

describe("LiveKitSessionService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPublishTrack.mockResolvedValue({ trackSid: "pub_1" });
    mockUnpublishTrack.mockResolvedValue(undefined);
    mockDisconnect.mockResolvedValue(undefined);
  });

  it("conecta e publica a track de tela", async () => {
    const service = new LiveKitSessionService();
    const stream = createMockMediaStream();

    await service.connect("wss://example.livekit.cloud", "token", "room_1");
    await service.publishScreenShare(stream, quality);

    expect(mockConnect).toHaveBeenCalledWith(
      "wss://example.livekit.cloud",
      "token",
      { autoSubscribe: true },
    );
    expect(mockPublishTrack).toHaveBeenCalled();
    expect(service.getSnapshot().status).toBe("connected");

    await service.dispose();
  });

  it("propaga falha de conexão", async () => {
    mockConnect.mockRejectedValueOnce(new Error("unauthorized token"));
    const service = new LiveKitSessionService();

    await expect(
      service.connect("wss://example.livekit.cloud", "bad", "room_1"),
    ).rejects.toThrow();
    expect(service.getSnapshot().status).toBe("error");

    await service.dispose();
  });

  it("desconecta e limpa publicação", async () => {
    const service = new LiveKitSessionService();
    const stream = createMockMediaStream();

    await service.connect("wss://example.livekit.cloud", "token", "room_1");
    await service.publishScreenShare(stream, quality);
    await service.disconnect();

    expect(mockUnpublishTrack).toHaveBeenCalled();
    expect(mockDisconnect).toHaveBeenCalled();
    expect(service.getSnapshot().status).toBe("disconnected");
    expect(service.getRoom()).toBeNull();

    await service.dispose();
  });
});
