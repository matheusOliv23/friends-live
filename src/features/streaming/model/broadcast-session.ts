import { DEFAULT_QUALITY_SETTINGS } from "@/features/streaming/constants/quality";
import type { BroadcastStatus, StreamQualitySettings } from "@/types/streaming";

export interface BroadcastSessionState {
  status: BroadcastStatus;
  quality: StreamQualitySettings;
  stream: MediaStream | null;
  viewerCount: number;
  startedAt: number | null;
}

export type BroadcastSessionAction =
  | { type: "started"; stream: MediaStream | null; startedAt: number }
  | { type: "ended" }
  | { type: "reset" };

export const initialBroadcastSessionState: BroadcastSessionState = {
  status: "idle",
  quality: DEFAULT_QUALITY_SETTINGS,
  stream: null,
  viewerCount: 0,
  startedAt: null,
};

export function broadcastSessionReducer(
  state: BroadcastSessionState,
  action: BroadcastSessionAction,
): BroadcastSessionState {
  switch (action.type) {
    case "started":
      if (state.status === "live") return state;
      return {
        ...state,
        status: "live",
        stream: action.stream,
        startedAt: action.startedAt,
        viewerCount: 0,
      };
    case "ended":
      if (state.status !== "live") return state;
      return { ...state, status: "ended", stream: null, viewerCount: 0 };
    case "reset":
      return { ...initialBroadcastSessionState };
  }
}
