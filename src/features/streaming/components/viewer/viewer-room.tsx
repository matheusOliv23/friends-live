"use client";

import Link from "next/link";
import { Unlink } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { StreamPlayer } from "@/features/streaming/components/viewer/stream-player";
import { useViewerSession } from "@/features/streaming/hooks/use-viewer-session";

interface ViewerRoomProps {
  roomId: string;
}

export function ViewerRoom({ roomId }: ViewerRoomProps) {
  const session = useViewerSession(roomId);

  if (session.notFound) {
    return (
      <div className="flex size-full items-center justify-center">
        <EmptyState
          icon={Unlink}
          title="Sala não encontrada"
          description="Este link não corresponde a nenhuma sala existente."
        >
          <Link
            href="/watch"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            Informar outro link
          </Link>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="flex size-full flex-col">
      <div className="min-h-0 flex-1">
        <StreamPlayer
          status={session.status}
          stream={session.stream}
          quality={session.quality}
          connectionQuality={session.connectionQuality}
          mediaConnectionStatus={session.mediaConnectionStatus}
          mediaError={session.mediaError}
        />
      </div>
    </div>
  );
}
