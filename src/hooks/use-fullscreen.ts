"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  document.addEventListener("fullscreenchange", onChange);
  return () => document.removeEventListener("fullscreenchange", onChange);
}

const subscribeNoop = () => () => {};

export function useFullscreen<TElement extends HTMLElement>() {
  const ref = useRef<TElement>(null);

  const isFullscreen = useSyncExternalStore(
    subscribe,
    () => document.fullscreenElement !== null,
    () => false,
  );

  const isSupported = useSyncExternalStore(
    subscribeNoop,
    () => document.fullscreenEnabled,
    () => false,
  );

  const toggle = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await ref.current?.requestFullscreen();
      }
    } catch {
      // O navegador pode negar a solicitação; o estado continua sincronizado
      // pelo evento "fullscreenchange".
    }
  }, []);

  return { ref, isFullscreen, isSupported, toggle };
}
