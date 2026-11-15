export type LiveKitConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected"
  | "error";

export type LiveKitParticipantRole = "publisher" | "subscriber";

export interface LiveKitTokenResponse {
  token: string;
  url: string;
  role: LiveKitParticipantRole;
  identity: string;
  roomName: string;
  expiresAt: string;
}

export interface LiveKitSessionSnapshot {
  status: LiveKitConnectionStatus;
  errorMessage: string | null;
  remoteStream: MediaStream | null;
  participantCount: number;
}
