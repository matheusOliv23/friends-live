import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "relative flex max-w-sm animate-in flex-col items-center gap-4 px-6 text-center duration-500 fade-in-0 slide-in-from-bottom-2",
        className,
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-xl border bg-surface-raised text-muted-foreground">
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="space-y-1.5">
        <h2 className="text-base font-medium text-foreground">{title}</h2>
        {description && (
          <p className="text-sm text-pretty text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          {children}
        </div>
      )}
    </div>
  );
}
