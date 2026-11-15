import { describe, expect, it } from "vitest";
import {
  applyContentHint,
  buildDisplayMediaConstraintLadder,
  readDetectedSettings,
  streamHasLiveAudio,
} from "@/features/streaming/lib/display-media-constraints";
import {
  createMockMediaStream,
  createMockMediaStreamTrack,
} from "@/features/streaming/test-utils/media-mocks";
import type { StreamQualitySettings } from "@/types/streaming";

const quality: StreamQualitySettings = {
  resolution: "1080p",
  frameRate: 60,
  contentHint: "motion",
  includeDisplayAudio: true,
};

describe("buildDisplayMediaConstraintLadder", () => {
  it("exclui áudio do sistema e termina com fallback sem áudio", () => {
    const ladder = buildDisplayMediaConstraintLadder(quality);

    expect(ladder[0]).toMatchObject({
      video: {
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: { ideal: 60, max: 60 },
      },
      systemAudio: "exclude",
    });
    expect(ladder[0]?.audio).toEqual({
      suppressLocalAudioPlayback: true,
    });
    expect(ladder.at(-1)).toEqual({ video: true, audio: false });
    expect(ladder.some((step) => step.audio !== false)).toBe(true);
    expect(ladder.some((step) => step.audio === false)).toBe(true);
  });

  it("não pede áudio quando includeDisplayAudio está desligado", () => {
    const ladder = buildDisplayMediaConstraintLadder({
      ...quality,
      includeDisplayAudio: false,
    });

    expect(ladder.every((step) => step.audio === false)).toBe(true);
  });
});

describe("streamHasLiveAudio", () => {
  it("detecta track de áudio ao vivo", () => {
    const withAudio = createMockMediaStream([
      createMockMediaStreamTrack({ kind: "video" }),
      createMockMediaStreamTrack({ kind: "audio" }),
    ]);
    const videoOnly = createMockMediaStream();

    expect(streamHasLiveAudio(withAudio)).toBe(true);
    expect(streamHasLiveAudio(videoOnly)).toBe(false);
    expect(streamHasLiveAudio(null)).toBe(false);
  });
});

describe("readDetectedSettings", () => {
  it("lê width, height e frameRate da track", () => {
    const track = createMockMediaStreamTrack({
      settings: { width: 1280, height: 720, frameRate: 29.97 },
    });

    expect(readDetectedSettings(track)).toEqual({
      width: 1280,
      height: 720,
      frameRate: 30,
    });
  });

  it("retorna nulos sem track", () => {
    expect(readDetectedSettings(undefined)).toEqual({
      width: null,
      height: null,
      frameRate: null,
    });
  });
});

describe("applyContentHint", () => {
  it("define contentHint quando suportado", () => {
    const track = createMockMediaStreamTrack();
    applyContentHint(track, "detail");
    expect(track.contentHint).toBe("detail");
  });
});
