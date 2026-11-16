"use client";

import { useEffect, useRef, type ComponentProps } from "react";
import { cn } from "@/lib/utils";

interface MediaVideoProps
  extends Omit<ComponentProps<"video">, "src" | "children"> {
  stream: MediaStream | null;
  /** 0–1; aplicado no elemento de vídeo do espectador. */
  volume?: number;
  onAutoplayBlocked?: () => void;
}

export function MediaVideo({
  stream,
  className,
  muted,
  volume = 1,
  onAutoplayBlocked,
  ...props
}: MediaVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.srcObject = stream;
    if (!stream) {
      return () => {
        video.srcObject = null;
      };
    }

    void video.play().catch(() => {
      if (!video.muted) {
        onAutoplayBlocked?.();
      }
    });

    return () => {
      video.srcObject = null;
    };
  }, [stream, onAutoplayBlocked]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;

    video.muted = Boolean(muted);
    video.volume = Math.min(1, Math.max(0, volume));
    void video.play().catch(() => {
      if (!video.muted) {
        onAutoplayBlocked?.();
      }
    });
  }, [muted, volume, stream, onAutoplayBlocked]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={muted}
      className={cn("size-full bg-black object-contain", className)}
      {...props}
    />
  );
}
