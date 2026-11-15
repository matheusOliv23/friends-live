import { vi } from "vitest";

export interface MockTrackOptions {
  kind?: "audio" | "video";
  readyState?: MediaStreamTrackState;
  settings?: MediaTrackSettings;
}

export function createMockMediaStreamTrack(
  options: MockTrackOptions = {},
): MediaStreamTrack {
  const endedListeners = new Set<() => void>();
  let readyState: MediaStreamTrackState = options.readyState ?? "live";
  const kind = options.kind ?? "video";

  const track = {
    kind,
    id: `track-${Math.random().toString(36).slice(2)}`,
    label: kind === "audio" ? "mock-audio" : "mock-display",
    enabled: true,
    muted: false,
    readyState,
    contentHint: "" as MediaStreamTrack["contentHint"],
    getSettings: () =>
      options.settings ?? {
        width: 1920,
        height: 1080,
        frameRate: 60,
      },
    stop: vi.fn(() => {
      readyState = "ended";
      Object.defineProperty(track, "readyState", { value: "ended" });
      for (const listener of endedListeners) listener();
    }),
    addEventListener: vi.fn((event: string, listener: EventListener) => {
      if (event === "ended") {
        endedListeners.add(listener as () => void);
      }
    }),
    removeEventListener: vi.fn((event: string, listener: EventListener) => {
      if (event === "ended") {
        endedListeners.delete(listener as () => void);
      }
    }),
  };

  Object.defineProperty(track, "readyState", {
    get: () => readyState,
    configurable: true,
  });

  return track as unknown as MediaStreamTrack;
}

export function createMockMediaStream(
  tracks: MediaStreamTrack[] = [createMockMediaStreamTrack()],
): MediaStream {
  return {
    id: `stream-${Math.random().toString(36).slice(2)}`,
    active: true,
    getTracks: () => tracks,
    getVideoTracks: () => tracks.filter((track) => track.kind === "video"),
    getAudioTracks: () => tracks.filter((track) => track.kind === "audio"),
    addTrack: vi.fn(),
    removeTrack: vi.fn(),
  } as unknown as MediaStream;
}

export function mockGetDisplayMedia(
  implementation: () => Promise<MediaStream>,
) {
  const getDisplayMedia = vi.fn(implementation);

  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    writable: true,
    value: {
      mediaDevices: {
        getDisplayMedia,
      },
    },
  });

  return getDisplayMedia;
}

export function mockUnsupportedDisplayMedia() {
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    writable: true,
    value: {
      mediaDevices: {},
    },
  });
}
