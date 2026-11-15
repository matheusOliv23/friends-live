import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

interface SiteHeaderProps {
  children?: ReactNode;
  className?: string;
}

export function SiteHeader({ children, className }: SiteHeaderProps) {
  return (
    <header
      className={cn(
        "flex h-14 shrink-0 items-center justify-between gap-4 px-4 sm:px-6",
        className,
      )}
    >
      <Logo />
      {children && <div className="flex items-center gap-2">{children}</div>}
    </header>
  );
}
