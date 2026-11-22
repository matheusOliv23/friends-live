"use client";

import { MonitorOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StreamControlsProps {
  onStopSharing: () => void;
  disabled?: boolean;
}

export function StreamControls({
  onStopSharing,
  disabled = false,
}: StreamControlsProps) {
  return (
    <div className="absolute right-3 bottom-3 flex items-center gap-2">
      <Button
        variant="destructive"
        size="lg"
        onClick={onStopSharing}
        disabled={disabled}
        className="h-10 px-4 shadow-lg"
      >
        <MonitorOff data-icon="inline-start" />
        Parar compartilhamento
      </Button>
    </div>
  );
}
