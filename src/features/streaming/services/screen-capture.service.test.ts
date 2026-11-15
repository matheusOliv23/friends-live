import { afterEach, describe, expect, it, vi } from "vitest";
import { ScreenCaptureService } from "@/features/streaming/services/screen-capture.service";
import {
  createMockMediaStream,
  createMockMediaStreamTrack,
  mockGetDisplayMedia,
  mockUnsupportedDisplayMedia,
} from "@/features/streaming/test-utils/media-mocks";
import type { StreamQualitySettings } from "@/types/streaming";

const quality: StreamQualitySettings = {
  resolution: "1080p",
  frameRate: 60,
  contentHint: "motion",
  includeDisplayAudio: false,
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ScreenCaptureService", () => {
  it("inicia a captura e expõe o MediaStream", async () => {
    const stream = createMockMediaStream();
    const getDisplayMedia = mockGetDisplayMedia(async () => stream);
    const service = new ScreenCaptureService();
    const statuses: string[] = [];
    service.subscribe((snapshot) => statuses.push(snapshot.status));

    const result = await service.start(quality);

    expect(getDisplayMedia).toHaveBeenCalled();
    expect(result).toBe(stream);
    expect(service.getStream()).toBe(stream);
    expect(service.getSnapshot().status).toBe("active");
    expect(service.getSnapshot().detected).toEqual({
      width: 1920,
      height: 1080,
      frameRate: 60,
    });
    expect(statuses).toContain("requesting");
    expect(statuses).toContain("active");

    service.dispose();
  });

  it("trata cancelamento da seleção sem marcar active", async () => {
    mockGetDisplayMedia(async () => {
      throw new DOMException("The user aborted", "AbortError");
    });
    const service = new ScreenCaptureService();

    await expect(service.start(quality)).rejects.toThrow(/cancelado/i);
    expect(service.getSnapshot().status).toBe("error");
    expect(service.getSnapshot().errorCode).toBe("cancelled");
    expect(service.getStream()).toBeNull();

    service.dispose();
  });

  it("encerra tracks e limpa o stream ao chamar stop", async () => {
    const track = createMockMediaStreamTrack();
    const stream = createMockMediaStream([track]);
    mockGetDisplayMedia(async () => stream);
    const service = new ScreenCaptureService();

    await service.start(quality);
    service.stop();

    expect(track.stop).toHaveBeenCalled();
    expect(service.getStream()).toBeNull();
    expect(service.getSnapshot().status).toBe("ended");

    service.dispose();
  });

  it("atualiza o estado quando a track termina pela UI nativa", async () => {
    const track = createMockMediaStreamTrack();
    const stream = createMockMediaStream([track]);
    mockGetDisplayMedia(async () => stream);
    const service = new ScreenCaptureService();

    await service.start(quality);
    track.stop();

    expect(service.getSnapshot().status).toBe("ended");
    expect(service.getStream()).toBeNull();

    service.dispose();
  });

  it("faz fallback quando a primeira constraint falha com OverconstrainedError", async () => {
    const stream = createMockMediaStream();
    const getDisplayMedia = mockGetDisplayMedia(async () => stream);
    getDisplayMedia
      .mockRejectedValueOnce(
        new DOMException("overconstrained", "OverconstrainedError"),
      )
      .mockResolvedValueOnce(stream);

    const service = new ScreenCaptureService();
    await service.start(quality);

    expect(getDisplayMedia.mock.calls.length).toBeGreaterThan(1);
    expect(service.getSnapshot().status).toBe("active");

    service.dispose();
  });

  it("não tenta fallback quando o usuário cancela", async () => {
    const getDisplayMedia = mockGetDisplayMedia(async () => {
      throw new DOMException("Permission denied by user dismiss", "NotAllowedError");
    });
    const service = new ScreenCaptureService();

    await expect(service.start(quality)).rejects.toThrow();
    expect(getDisplayMedia).toHaveBeenCalledTimes(1);
    expect(service.getSnapshot().errorCode).toBe("cancelled");

    service.dispose();
  });

  it("reporta navegador incompatível", async () => {
    mockUnsupportedDisplayMedia();
    const service = new ScreenCaptureService();

    expect(ScreenCaptureService.isSupported()).toBe(false);
    await expect(service.start(quality)).rejects.toThrow(/navegador/i);
    expect(service.getSnapshot().errorCode).toBe("unsupported");

    service.dispose();
  });

  it("remove listeners no dispose e não deixa stream ativo", async () => {
    const track = createMockMediaStreamTrack();
    const stream = createMockMediaStream([track]);
    mockGetDisplayMedia(async () => stream);
    const service = new ScreenCaptureService();
    const listener = vi.fn();

    service.subscribe(listener);
    await service.start(quality);
    service.dispose();

    expect(track.stop).toHaveBeenCalled();
    expect(service.getStream()).toBeNull();
    expect(track.removeEventListener).toHaveBeenCalled();
  });
});
