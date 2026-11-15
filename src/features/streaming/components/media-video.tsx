"use client";

import { useEffect, useRef, type ComponentProps } from "react";
import { cn } from "@/lib/utils";

interface MediaVideoProps
  extends Omit<ComponentProps<"video">, "src" | "children"> {
  stream: MediaStream | null;
}

export function MediaVideo({
  stream,
  className,
  muted,
  ...props
}: MediaVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.srcObject = stream;
    if (stream) {
      void video.play().catch(() => {
        // autoplay pode ser bloqueado; muted+playsInline costuma bastar.
      });
    }

    return () => {
      video.srcObject = null;
    };
  }, [stream]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;
    void video.play().catch(() => {
      // Após gesto de unmute o browser costuma liberar a reprodução.
    });
  }, [muted, stream]);

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
