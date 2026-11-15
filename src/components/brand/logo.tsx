import Link from "next/link";
import { BrandMark } from "@/components/brand/brand-mark";
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
      <BrandMark className="transition-transform duration-200 group-hover:scale-[1.04]" />
      <span className="text-sm font-semibold tracking-tight">
        Nexus <span className="text-muted-foreground">Stream</span>
      </span>
    </Link>
  );
}
