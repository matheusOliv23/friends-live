import { cn } from "@/lib/utils";

interface BrandMarkProps {
  className?: string;
}

/** Marca “F” com ponto ao vivo — usada no header e como base dos ícones. */
export function BrandMark({ className }: BrandMarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-8", className)}
      aria-hidden
    >
      <rect width="32" height="32" rx="8" className="fill-primary/15" />
      <rect
        x="0.75"
        y="0.75"
        width="30.5"
        height="30.5"
        rx="7.25"
        className="stroke-primary/35"
        strokeWidth="1.5"
      />
      <path
        d="M10 22V10h11v2.3H12.6v3.2H19V17.8H12.6V22H10Z"
        className="fill-primary"
      />
      <circle
        cx="23.5"
        cy="8.5"
        r="3.4"
        className="animate-mark-pulse fill-live/35"
      />
      <circle cx="23.5" cy="8.5" r="2.25" className="fill-live" />
    </svg>
  );
}
