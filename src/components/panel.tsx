import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PanelProps {
  title: string;
  icon?: LucideIcon;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function Panel({
  title,
  icon: Icon,
  description,
  children,
  className,
}: PanelProps) {
  return (
    <section
      className={cn("rounded-xl border bg-surface p-4 sm:p-5", className)}
    >
      <header className="mb-4 space-y-1">
        <h2 className="flex items-center gap-2 text-sm font-medium">
          {Icon && <Icon className="size-4 text-muted-foreground" aria-hidden />}
          {title}
        </h2>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </header>
      {children}
    </section>
  );
}
