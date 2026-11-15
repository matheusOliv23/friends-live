import { Hourglass, LoaderCircle, MonitorOff } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { buttonVariants } from "@/components/ui/button";
import type { ViewerStatus } from "@/types/streaming";

interface PlayerStateOverlayProps {
  status: ViewerStatus;
}

export function PlayerStateOverlay({ status }: PlayerStateOverlayProps) {
  switch (status) {
    case "connecting":
      return <PlayerLoading />;
    case "waiting":
      return (
        <EmptyState
          icon={Hourglass}
          title="A transmissão ainda não começou"
          description="O vídeo aparecerá aqui quando o anfitrião começar a compartilhar a tela."
        />
      );
    case "ended":
      return (
        <EmptyState
          icon={MonitorOff}
          title="A transmissão foi encerrada"
          description="O anfitrião parou de compartilhar a tela."
        >
          <Link href="/" className={buttonVariants({ variant: "outline", size: "lg" })}>
            Voltar ao início
          </Link>
        </EmptyState>
      );
    case "live":
      return null;
  }
}

export function PlayerLoading() {
  return (
    <div
      role="status"
      className="flex animate-in flex-col items-center gap-3 text-sm text-muted-foreground duration-300 fade-in-0"
    >
      <LoaderCircle className="size-6 animate-spin text-primary" aria-hidden />
      Conectando à transmissão…
    </div>
  );
}
