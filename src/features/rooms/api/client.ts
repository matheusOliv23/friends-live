import type { PublicRoom } from "@/types/rooms";

export interface CreateRoomResponse {
  room: PublicRoom;
}

export class RoomApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
    this.name = "RoomApiError";
  }
}

interface ErrorBody {
  error?: { code?: string; message?: string };
}

async function parseJson<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => null)) as
    | (T & ErrorBody)
    | null;

  if (!response.ok) {
    throw new RoomApiError(
      body?.error?.message ?? "Não foi possível completar a solicitação.",
      response.status,
      body?.error?.code ?? "request_failed",
    );
  }

  return body as T;
}

export async function createRoom(): Promise<CreateRoomResponse> {
  const response = await fetch("/api/rooms", {
    method: "POST",
    credentials: "include",
  });
  return parseJson<CreateRoomResponse>(response);
}

export async function fetchRoom(
  roomId: string,
): Promise<{ room: PublicRoom; isHost: boolean }> {
  const response = await fetch(`/api/rooms/${encodeURIComponent(roomId)}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
  return parseJson(response);
}

export async function goLiveRoom(roomId: string): Promise<PublicRoom> {
  const response = await fetch(
    `/api/rooms/${encodeURIComponent(roomId)}/live`,
    {
      method: "POST",
      credentials: "include",
    },
  );
  const data = await parseJson<{ room: PublicRoom }>(response);
  return data.room;
}

export async function endRoom(roomId: string): Promise<PublicRoom> {
  const response = await fetch(
    `/api/rooms/${encodeURIComponent(roomId)}/end`,
    {
      method: "POST",
      credentials: "include",
    },
  );
  const data = await parseJson<{ room: PublicRoom }>(response);
  return data.room;
}

export async function requestDesktopHandoff(
  roomId: string,
): Promise<{ roomId: string; hostToken: string; deepLink: string }> {
  const response = await fetch(
    `/api/rooms/${encodeURIComponent(roomId)}/desktop-handoff`,
    {
      method: "POST",
      credentials: "include",
    },
  );
  return parseJson(response);
}
