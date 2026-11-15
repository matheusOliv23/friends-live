import type { ReactNode } from "react";
import Link from "next/link";
import { LoaderCircle, MonitorOff, MonitorUp } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Button, buttonVariants } from "@/components/ui/button";
import { ScreenPreview } from "@/features/streaming/components/screen-preview";
import { StreamControls } from "@/features/streaming/components/stream-controls";
import type {
  DetectedCaptureSettings,
  ScreenCaptureStatus,
} from "@/features/streaming/types/capture";
import type { RoomStatus } from "@/types/rooms";
import type { StreamQualitySettings } from "@/types/streaming";

interface BroadcastStageProps {
  roomStatus: RoomStatus;
  captureStatus: ScreenCaptureStatus;
  stream: MediaStream | null;
  quality: StreamQualitySettings;
  detected: DetectedCaptureSettings;
  error?: string | null;
  isSupported: boolean;
  onStartSharing: () => void;
  onStopSharing: () => void;
}

export function BroadcastStage({
  roomStatus,
  captureStatus,
  stream,
  quality,
  detected,
  error,
  isSupported,
  onStartSharing,
  onStopSharing,
}: BroadcastStageProps) {
  if (roomStatus === "ended") {
    return (
      <StageShell>
        <EmptyState
          icon={MonitorOff}
          title="Transmissão encerrada"
          description="Esta sala foi encerrada. Crie uma nova sala para transmitir novamente."
        >
          <Link
            href="/"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            Voltar ao início
          </Link>
        </EmptyState>
      </StageShell>
    );
  }

  if (captureStatus === "active" && stream) {
    return (
      <StageShell>
        <ScreenPreview stream={stream} quality={quality} detected={detected} />
        <StreamControls onStopSharing={onStopSharing} />
      </StageShell>
    );
  }

  if (captureStatus === "requesting") {
    return (
      <StageShell>
        <div
          role="status"
          className="relative flex flex-col items-center gap-3 text-sm text-muted-foreground"
        >
          <LoaderCircle className="size-6 animate-spin text-primary" aria-hidden />
          Selecione a tela ou janela no diálogo do navegador…
        </div>
      </StageShell>
    );
  }

  const description = !isSupported
    ? "Este navegador não oferece compartilhamento de tela. Use Chrome, Edge ou Firefox em localhost ou HTTPS."
    : captureStatus === "ended"
      ? "O compartilhamento foi encerrado. Você pode compartilhar novamente quando quiser."
      : "Para incluir áudio, compartilhe uma aba e marque “Compartilhar áudio” no diálogo do navegador.";

  return (
    <StageShell>
      <EmptyState
        icon={MonitorUp}
        title="Nenhuma tela está sendo compartilhada"
        description={description}
      >
        <Button
          size="lg"
          onClick={onStartSharing}
          disabled={!isSupported}
          className="h-10 px-4"
        >
          <MonitorUp data-icon="inline-start" />
          Compartilhar minha tela
        </Button>
        {error && (
          <p role="alert" className="text-xs text-destructive">
            {error}
          </p>
        )}
      </EmptyState>
    </StageShell>
  );
}

function StageShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-80 w-full items-center justify-center overflow-hidden rounded-xl border bg-surface py-8 sm:aspect-video sm:min-h-0">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-linear-to-b from-surface-raised/60 to-transparent"
      />
      {children}
    </div>
  );
}
