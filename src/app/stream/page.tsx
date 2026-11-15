"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { createRoom, RoomApiError } from "@/features/rooms/api/client";
import { CreateRoomButton } from "@/features/rooms/components/create-room-button";
import { getStreamPath } from "@/features/rooms/lib/paths";

export default function StreamEntryPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const { room } = await createRoom();
        if (!cancelled) router.replace(getStreamPath(room.id));
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof RoomApiError
            ? err.message
            : "Não foi possível criar a sala.",
        );
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <>
      <SiteHeader className="border-b" />
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
        {error ? (
          <>
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
            <CreateRoomButton />
          </>
        ) : (
          <p
            role="status"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground"
          >
            <LoaderCircle className="size-4 animate-spin text-primary" aria-hidden />
            Criando sua sala…
          </p>
        )}
      </main>
    </>
  );
}
