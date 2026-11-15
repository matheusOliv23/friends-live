import type { ReactNode, Ref } from "react";
import { cn } from "@/lib/utils";

interface PlayerFrameProps {
  children: ReactNode;
  ref?: Ref<HTMLDivElement>;
  className?: string;
  live?: boolean;
}

export function PlayerFrame({
  children,
  ref,
  className,
  live = false,
}: PlayerFrameProps) {
  return (
    <div
      ref={ref}
      className={cn(
        "group/player relative flex size-full items-center justify-center overflow-hidden rounded-xl border bg-black transition-[box-shadow,border-color] duration-500",
        live
          ? "border-live/40 shadow-[0_0_0_1px_rgba(239,68,68,0.15),0_24px_60px_-28px_rgba(239,68,68,0.45)]"
          : "border-border",
        className,
      )}
    >
      {live ? (
        <div
          aria-hidden
          className="animate-shimmer pointer-events-none absolute inset-x-0 top-0 z-30 h-px bg-linear-to-r from-transparent via-live/80 to-transparent"
        />
      ) : null}
      {children}
    </div>
  );
}
