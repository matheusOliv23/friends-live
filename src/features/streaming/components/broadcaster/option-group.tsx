"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface OptionGroupProps<TValue extends string | number> {
  label: string;
  value: TValue;
  options: readonly { value: TValue; label: string }[];
  onChange: (value: TValue) => void;
  hint?: string;
  disabled?: boolean;
}

export function OptionGroup<TValue extends string | number>({
  label,
  value,
  options,
  onChange,
  hint,
  disabled,
}: OptionGroupProps<TValue>) {
  function handleValueChange([next]: string[]) {
    const option = options.find((item) => String(item.value) === next);
    if (option) onChange(option.value);
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <ToggleGroup
        aria-label={label}
        value={[String(value)]}
        onValueChange={handleValueChange}
        disabled={disabled}
        variant="outline"
        spacing={1}
        className="grid w-full auto-cols-fr grid-flow-col"
      >
        {options.map((option) => (
          <ToggleGroupItem
            key={option.value}
            value={String(option.value)}
            className="aria-pressed:border-primary/50 aria-pressed:bg-primary/15 aria-pressed:text-foreground"
          >
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
