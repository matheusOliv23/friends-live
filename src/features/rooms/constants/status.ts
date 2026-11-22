import type { StatusTone } from "@/components/status-indicator";
import type { RoomStatus } from "@/types/rooms";
import type { ViewerStatus } from "@/types/streaming";

interface StatusMeta {
  label: string;
  tone: StatusTone;
  pulse?: boolean;
}

export const ROOM_STATUS_META: Record<RoomStatus, StatusMeta> = {
  waiting: { label: "Aguardando", tone: "warning" },
  live: { label: "Ao vivo", tone: "live", pulse: true },
  // Legado: salas antigas “encerradas” passam a se comportar como ociosas.
  ended: { label: "Aguardando", tone: "warning" },
};

export function roomStatusToViewerStatus(status: RoomStatus): ViewerStatus {
  switch (status) {
    case "live":
      return "live";
    case "waiting":
    case "ended":
      return "waiting";
  }
}
