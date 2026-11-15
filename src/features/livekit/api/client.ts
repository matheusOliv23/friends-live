import { RoomApiError } from "@/features/rooms/api/client";
import type { LiveKitTokenResponse } from "@/features/livekit/types";

interface ErrorBody {
  error?: { code?: string; message?: string };
}

async function parseJson<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => null)) as
    | (T & ErrorBody)
    | null;

  if (!response.ok) {
    throw new RoomApiError(
      body?.error?.message ?? "Não foi possível obter acesso à mídia.",
      response.status,
      body?.error?.code ?? "request_failed",
    );
  }

  return body as T;
}

export async function fetchLiveKitToken(
  roomId: string,
): Promise<LiveKitTokenResponse> {
  const response = await fetch(
    `/api/rooms/${encodeURIComponent(roomId)}/livekit-token`,
    {
      method: "POST",
      credentials: "include",
    },
  );
  return parseJson<LiveKitTokenResponse>(response);
}
