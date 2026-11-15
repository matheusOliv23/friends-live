import Link from "next/link";
import { Radio } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="Nexus Stream — página inicial"
      className={cn(
        "group inline-flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/30 transition-colors group-hover:bg-primary/25">
        <Radio className="size-4" aria-hidden />
      </span>
      <span className="text-sm font-semibold tracking-tight">
        Nexus <span className="text-muted-foreground">Stream</span>
      </span>
    </Link>
  );
}
