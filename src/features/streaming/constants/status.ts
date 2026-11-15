import type { StatusTone } from "@/components/status-indicator";
import type {
  BroadcastStatus,
  ConnectionQuality,
  ViewerStatus,
} from "@/types/streaming";

interface StatusMeta {
  label: string;
  tone: StatusTone;
  pulse?: boolean;
}

export const BROADCAST_STATUS_META: Record<BroadcastStatus, StatusMeta> = {
  idle: { label: "Offline", tone: "neutral" },
  live: { label: "Ao vivo", tone: "live", pulse: true },
  ended: { label: "Encerrada", tone: "neutral" },
};

export const VIEWER_STATUS_META: Record<ViewerStatus, StatusMeta> = {
  connecting: { label: "Conectando", tone: "accent", pulse: true },
  waiting: { label: "Aguardando início", tone: "warning" },
  live: { label: "Ao vivo", tone: "live", pulse: true },
  ended: { label: "Encerrada", tone: "neutral" },
};

export const CONNECTION_QUALITY_LABELS: Record<ConnectionQuality, string> = {
  unknown: "Sem conexão",
  good: "Conexão estável",
  fair: "Conexão instável",
  poor: "Conexão fraca",
};
