"use client";

import { useEffect, useState } from "react";

interface Tick {
  origin: number | null;
  seconds: number;
}

export function useElapsedSeconds(startedAt: number | null): number {
  const [tick, setTick] = useState<Tick>({ origin: null, seconds: 0 });

  useEffect(() => {
    if (startedAt === null) return;

    const interval = window.setInterval(() => {
      setTick({
        origin: startedAt,
        seconds: Math.floor((Date.now() - startedAt) / 1000),
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [startedAt]);

  return startedAt !== null && tick.origin === startedAt ? tick.seconds : 0;
}
