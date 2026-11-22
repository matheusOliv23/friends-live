"use client";

import { useCallback, useReducer } from "react";
import {
  broadcastSessionReducer,
  initialBroadcastSessionState,
} from "@/features/streaming/model/broadcast-session";

export function useBroadcastSession() {
  const [state, dispatch] = useReducer(
    broadcastSessionReducer,
    initialBroadcastSessionState,
  );

  // Etapa de fundação: a sessão entra em "live" sem captura real (stream nulo).
  const startSharing = useCallback(() => {
    dispatch({ type: "started", stream: null, startedAt: Date.now() });
  }, []);

  const endBroadcast = useCallback(() => dispatch({ type: "ended" }), []);

  const reset = useCallback(() => dispatch({ type: "reset" }), []);

  return {
    ...state,
    startSharing,
    endBroadcast,
    reset,
  };
}
