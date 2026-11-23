export type CaptureAudioMode =
  | "app-loopback"
  | "window-only"
  | "system-loopback"
  | "virtual-device";

export interface DesktopAudioPrefs {
  audioMode: CaptureAudioMode;
  selectedDeviceId: string;
}

export interface DesktopDeepLink {
  roomId: string;
  hostToken?: string;
}

export interface AppAudioFormat {
  sampleRate: number;
  channels: number;
  bitDepth: 16;
}

export type UpdateStatusPayload =
  | { status: "checking" }
  | { status: "available"; version: string }
  | { status: "not-available" }
  | { status: "downloading"; percent: number }
  | { status: "ready"; version: string }
  | { status: "error"; message: string };

export interface NexusDesktopApi {
  getConfig: () => Promise<{
    siteUrl: string;
    isPackaged: boolean;
    pendingDeepLink: DesktopDeepLink | null;
  }>;
  consumeDeepLink: () => Promise<DesktopDeepLink | null>;
  openStream: (payload: {
    roomId: string;
    hostToken?: string | null;
  }) => Promise<{ ok: boolean; url?: string }>;
  openWatch: (roomId?: string | null) => Promise<{ ok: boolean; url?: string }>;
  openExternal: (url: string) => Promise<void>;
  watchUrl: (roomId: string) => Promise<string>;
  listSources: () => Promise<Array<{ id: string; name: string }>>;
  goHome: () => Promise<void>;
  setAudioPrefs: (prefs: DesktopAudioPrefs) => Promise<DesktopAudioPrefs>;
  getAudioPrefs: () => Promise<DesktopAudioPrefs>;
  getAppAudioFormat: () => Promise<AppAudioFormat>;
  stopAppAudio: () => Promise<void>;
  /** Impede o Windows de suspender o app enquanto transmite. */
  setPowerSave: (enabled: boolean) => Promise<void>;
  checkForUpdates: () => Promise<{
    ok: boolean;
    version?: string | null;
    message?: string;
  }>;
  installUpdate: () => Promise<void>;
  onAppAudioChunk: (
    handler: (chunk: Uint8Array) => void,
  ) => () => void;
  onDeepLink: (handler: (link: DesktopDeepLink) => void) => () => void;
  onUpdateStatus: (
    handler: (payload: UpdateStatusPayload) => void,
  ) => () => void;
}
