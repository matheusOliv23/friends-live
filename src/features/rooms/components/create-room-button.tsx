"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LoaderCircle, MonitorUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createRoom, RoomApiError } from "@/features/rooms/api/client";
import { getStreamPath } from "@/features/rooms/lib/paths";
import { cn } from "@/lib/utils";

interface CreateRoomButtonProps {
  className?: string;
  fullWidth?: boolean;
}

export function CreateRoomButton({
  className,
  fullWidth,
}: CreateRoomButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    setIsPending(true);
    setError(null);

    try {
      const { room } = await createRoom();
      router.push(getStreamPath(room.id));
    } catch (err) {
      setError(
        err instanceof RoomApiError
          ? err.message
          : "Não foi possível criar a sala. Tente novamente.",
      );
      setIsPending(false);
    }
  }

  return (
    <div className={cn("flex flex-col items-center gap-2", fullWidth && "w-full")}>
      <Button
        size="lg"
        onClick={handleCreate}
        disabled={isPending}
        className={cn("h-11 gap-2 px-5 text-sm", fullWidth && "w-full", className)}
      >
        {isPending ? (
          <LoaderCircle data-icon="inline-start" className="animate-spin" />
        ) : (
          <MonitorUp data-icon="inline-start" />
        )}
        {isPending ? "Criando sala…" : "Iniciar transmissão"}
        {!isPending && <ArrowRight data-icon="inline-end" />}
      </Button>
      {error && (
        <p role="alert" className="max-w-sm text-center text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
