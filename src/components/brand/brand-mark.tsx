import { cn } from "@/lib/utils";

interface BrandMarkProps {
  className?: string;
}

/** Marca “N” com ponto ao vivo — usada no header e como base dos ícones. */
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
        d="M10 22V10h2.4l5.2 8.2V10H22v12h-2.4L14.4 13.8V22H10Z"
        className="fill-primary"
      />
      <circle cx="23.5" cy="8.5" r="2.25" className="fill-live" />
    </svg>
  );
}
