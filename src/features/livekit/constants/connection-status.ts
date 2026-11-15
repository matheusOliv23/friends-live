import type { StatusTone } from "@/components/status-indicator";
import type { LiveKitConnectionStatus } from "@/features/livekit/types";

interface ConnectionMeta {
  label: string;
  tone: StatusTone;
  pulse?: boolean;
}

export const LIVEKIT_CONNECTION_META: Record<
  LiveKitConnectionStatus,
  ConnectionMeta
> = {
  idle: { label: "Mídia inativa", tone: "neutral" },
  connecting: { label: "Conectando…", tone: "accent", pulse: true },
  connected: { label: "Conectado", tone: "success" },
  reconnecting: { label: "Reconectando…", tone: "warning", pulse: true },
  disconnected: { label: "Desconectado", tone: "neutral" },
  error: { label: "Erro de conexão", tone: "live" },
};
