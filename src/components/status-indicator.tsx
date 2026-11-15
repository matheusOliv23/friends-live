import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const dotVariants = cva("relative inline-flex size-2 rounded-full", {
  variants: {
    tone: {
      neutral: "bg-muted-foreground/60",
      accent: "bg-primary",
      success: "bg-success",
      warning: "bg-warning",
      live: "bg-live",
    },
  },
  defaultVariants: { tone: "neutral" },
});

export type StatusTone = NonNullable<VariantProps<typeof dotVariants>["tone"]>;

interface StatusIndicatorProps {
  label: string;
  tone?: StatusTone;
  pulse?: boolean;
  className?: string;
}

export function StatusIndicator({
  label,
  tone = "neutral",
  pulse = false,
  className,
}: StatusIndicatorProps) {
  return (
    <span
      role="status"
      className={cn(
        "inline-flex items-center gap-2 text-xs font-medium text-foreground",
        className,
      )}
    >
      <span className="relative flex size-2">
        {pulse && (
          <span
            className={cn(
              dotVariants({ tone }),
              "absolute inset-0 animate-ping opacity-60",
            )}
          />
        )}
        <span className={dotVariants({ tone })} />
      </span>
      {label}
    </span>
  );
}
