import type { ReactNode, Ref } from "react";
import { cn } from "@/lib/utils";

interface PlayerFrameProps {
  children: ReactNode;
  ref?: Ref<HTMLDivElement>;
  className?: string;
}

export function PlayerFrame({ children, ref, className }: PlayerFrameProps) {
  return (
    <div
      ref={ref}
      className={cn(
        "group/player relative flex size-full items-center justify-center overflow-hidden rounded-xl border bg-black",
        className,
      )}
    >
      {children}
    </div>
  );
}
