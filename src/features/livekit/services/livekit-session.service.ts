import {
  ConnectionState,
  Room,
  RoomEvent,
  Track,
  type LocalTrackPublication,
  type RemoteParticipant,
  type RemoteTrack,
  type RemoteTrackPublication,
  type Room as LiveKitRoom,
} from "livekit-client";
import {
  buildScreenShareAudioPublishOptions,
  buildScreenSharePublishOptions,
} from "@/features/livekit/lib/publish-options";
import type {
  LiveKitConnectionStatus,
  LiveKitSessionSnapshot,
} from "@/features/livekit/types";
import type { StreamQualitySettings } from "@/types/streaming";

type SessionListener = (snapshot: LiveKitSessionSnapshot) => void;

const IDLE_SNAPSHOT: LiveKitSessionSnapshot = {
  status: "idle",
  errorMessage: null,
  remoteStream: null,
  participantCount: 0,
};

/**
 * Encapsula conexão LiveKit + publicação/assinatura.
 * Tracks de captura locais são tratados como user-provided (não param ao unpublish).
 */
export class LiveKitSessionService {
  private room: LiveKitRoom | null = null;
  private publications: LocalTrackPublication[] = [];
  private publishedMediaTracks: MediaStreamTrack[] = [];
  private status: LiveKitConnectionStatus = "idle";
  private errorMessage: string | null = null;
  private remoteStream: MediaStream | null = null;
  private participantCount = 0;
  private snapshot: LiveKitSessionSnapshot = IDLE_SNAPSHOT;
  private readonly listeners = new Set<SessionListener>();
  private generation = 0;
  private activeRoomName: string | null = null;
  private connectInFlight: Promise<void> | null = null;
  private connectInFlightRoom: string | null = null;

  subscribe(listener: SessionListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getSnapshot(): LiveKitSessionSnapshot {
    return this.snapshot;
  }

  getRoom(): LiveKitRoom | null {
    return this.room;
  }

  getActiveRoomName(): string | null {
    return this.activeRoomName;
  }

  isConnectedTo(roomName: string): boolean {
    return (
      this.activeRoomName === roomName &&
      this.room !== null &&
      (this.status === "connected" || this.status === "reconnecting")
    );
  }

  async connect(url: string, token: string, roomName: string): Promise<void> {
    if (this.isConnectedTo(roomName)) {
      this.refreshRemoteStream();
      return;
    }

    if (
      this.connectInFlight &&
      this.connectInFlightRoom === roomName &&
      (this.status === "connecting" || this.status === "reconnecting")
    ) {
      return this.connectInFlight;
    }

    const run = this.connectWithRetry(url, token, roomName);
    this.connectInFlight = run;
    this.connectInFlightRoom = roomName;

    try {
      await run;
    } finally {
      if (this.connectInFlight === run) {
        this.connectInFlight = null;
        this.connectInFlightRoom = null;
      }
    }
  }

  private async connectWithRetry(
    url: string,
    token: string,
    roomName: string,
  ): Promise<void> {
    const maxAttempts = 3;
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        await this.performConnect(url, token, roomName);
        return;
      } catch (error) {
        lastError = error;
        if (!isRetryableSignalError(error) || attempt === maxAttempts) {
          const friendly = toFriendlyConnectionError(error);
          this.setError(friendly);
          throw new Error(friendly);
        }
        await wait(400 * attempt);
      }
    }

    const friendly = toFriendlyConnectionError(lastError);
    this.setError(friendly);
    throw new Error(friendly);
  }

  private async performConnect(
    url: string,
    token: string,
    roomName: string,
  ): Promise<void> {
    this.generation += 1;
    const generation = this.generation;

    await this.teardownRoom();
    this.errorMessage = null;
    this.activeRoomName = roomName;
    this.setStatus("connecting");

    const room = new Room({
      adaptiveStream: true,
      dynacast: true,
      // Amigo troca para o jogo/outra janela — não pode derrubar a sala.
      disconnectOnPageLeave: false,
      stopLocalTrackOnUnpublish: false,
    });
    this.bindRoomEvents(room);
    this.room = room;

    try {
      await room.connect(url, token, { autoSubscribe: true });
      if (generation !== this.generation) {
        if (this.room === room) {
          await this.teardownRoom();
        } else {
          room.removeAllListeners();
          void room.disconnect(true);
        }
        return;
      }
      // O SDK registra `freeze` mesmo com disconnectOnPageLeave:false e
      // desconecta ao ir pro jogo (aba em segundo plano). Removemos isso.
      keepRoomAliveInBackground(room);
      this.participantCount = room.numParticipants;
      this.setStatus("connected");
      this.ensureRemoteMediaSubscriptions(room);
      this.refreshRemoteStream();
    } catch (error) {
      if (generation !== this.generation) return;
      await this.teardownRoom();
      throw error;
    }
  }

  async publishScreenShare(
    mediaStream: MediaStream,
    quality: StreamQualitySettings,
  ): Promise<void> {
    const room = this.room;
    if (!room || room.state !== ConnectionState.Connected) {
      throw new Error("Conecte-se ao LiveKit antes de publicar a tela.");
    }

    const videoTrack = mediaStream.getVideoTracks()[0];
    if (!videoTrack) {
      throw new Error("A captura não possui uma track de vídeo.");
    }

    if (this.publications.length > 0) {
      await this.unpublish(false);
    }

    const publishedTracks: MediaStreamTrack[] = [];
    const publications: LocalTrackPublication[] = [];

    try {
      publications.push(
        await room.localParticipant.publishTrack(
          videoTrack,
          buildScreenSharePublishOptions(quality),
        ),
      );
      publishedTracks.push(videoTrack);

      const audioTrack = mediaStream.getAudioTracks()[0];
      if (audioTrack) {
        publications.push(
          await room.localParticipant.publishTrack(
            audioTrack,
            buildScreenShareAudioPublishOptions(),
          ),
        );
        publishedTracks.push(audioTrack);
      }

      this.publications = publications;
      this.publishedMediaTracks = publishedTracks;
      this.emit();
    } catch (error) {
      for (const track of publishedTracks) {
        try {
          await room.localParticipant.unpublishTrack(track, false);
        } catch {
          // limpeza best-effort
        }
      }
      this.publications = [];
      this.publishedMediaTracks = [];
      this.setError(
        "Não foi possível publicar a captura de tela. Verifique a conexão e tente novamente.",
      );
      throw error;
    }
  }

  async unpublish(stopTrack = false): Promise<void> {
    const room = this.room;
    const tracks = [...this.publishedMediaTracks];
    if (room) {
      for (const track of tracks) {
        try {
          await room.localParticipant.unpublishTrack(track, stopTrack);
        } catch {
          // A track pode já ter sido removida pelo servidor.
        }
      }
    }
    this.publications = [];
    this.publishedMediaTracks = [];
    this.emit();
  }

  async disconnect(): Promise<void> {
    this.generation += 1;
    await this.unpublish(false);
    await this.teardownRoom();
    this.errorMessage = null;
    this.setStatus("disconnected");
  }

  async dispose(): Promise<void> {
    this.generation += 1;
    await this.unpublish(false);
    await this.teardownRoom();
    this.status = "idle";
    this.errorMessage = null;
    this.remoteStream = null;
    this.participantCount = 0;
    this.snapshot = IDLE_SNAPSHOT;
    this.listeners.clear();
  }

  private bindRoomEvents(room: LiveKitRoom): void {
    room.on(RoomEvent.ConnectionStateChanged, (state) => {
      this.handleConnectionState(state);
    });

    room.on(RoomEvent.Disconnected, () => {
      this.participantCount = 0;
      this.remoteStream = null;
      if (this.status !== "idle") {
        this.setStatus("disconnected");
      }
    });

    room.on(RoomEvent.Reconnecting, () => {
      this.setStatus("reconnecting");
    });

    room.on(RoomEvent.SignalReconnecting, () => {
      this.setStatus("reconnecting");
    });

    room.on(RoomEvent.Reconnected, () => {
      keepRoomAliveInBackground(room);
      this.setStatus("connected");
      this.ensureRemoteMediaSubscriptions(room);
      this.refreshRemoteStream();
    });

    room.on(RoomEvent.ParticipantConnected, (participant) => {
      this.participantCount = room.numParticipants;
      this.ensureParticipantMediaSubscriptions(participant);
      this.emit();
    });

    room.on(RoomEvent.ParticipantDisconnected, () => {
      this.participantCount = room.numParticipants;
      this.refreshRemoteStream();
    });

    room.on(
      RoomEvent.TrackPublished,
      (publication: RemoteTrackPublication, participant: RemoteParticipant) => {
        if (
          publication.kind === Track.Kind.Video ||
          publication.kind === Track.Kind.Audio
        ) {
          publication.setSubscribed(true);
          this.ensureParticipantMediaSubscriptions(participant);
          this.refreshRemoteStream();
        }
      },
    );

    room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack) => {
      if (
        track.kind === Track.Kind.Video ||
        track.kind === Track.Kind.Audio
      ) {
        this.refreshRemoteStream();
      }
    });

    room.on(RoomEvent.TrackUnsubscribed, () => {
      this.refreshRemoteStream();
    });

    room.on(RoomEvent.TrackSubscriptionStatusChanged, () => {
      this.ensureRemoteMediaSubscriptions(room);
      this.refreshRemoteStream();
    });

    room.on(RoomEvent.MediaDevicesError, () => {
      this.setError(
        "Ocorreu um problema com os dispositivos de mídia durante a transmissão.",
      );
    });
  }

  private ensureRemoteMediaSubscriptions(room: LiveKitRoom): void {
    for (const participant of room.remoteParticipants.values()) {
      this.ensureParticipantMediaSubscriptions(participant);
    }
  }

  private ensureParticipantMediaSubscriptions(
    participant: RemoteParticipant,
  ): void {
    for (const publication of participant.trackPublications.values()) {
      if (
        (publication.kind === Track.Kind.Video ||
          publication.kind === Track.Kind.Audio) &&
        !publication.isSubscribed
      ) {
        publication.setSubscribed(true);
      }
    }
  }

  private handleConnectionState(state: ConnectionState): void {
    switch (state) {
      case ConnectionState.Connecting:
        this.setStatus("connecting");
        break;
      case ConnectionState.Connected:
        this.setStatus("connected");
        break;
      case ConnectionState.Reconnecting:
      case ConnectionState.SignalReconnecting:
        this.setStatus("reconnecting");
        break;
      case ConnectionState.Disconnected:
        this.setStatus("disconnected");
        break;
    }
  }

  private refreshRemoteStream(): void {
    const room = this.room;
    if (!room) {
      this.remoteStream = null;
      this.emit();
      return;
    }

    const mediaStream = new MediaStream();
    for (const participant of room.remoteParticipants.values()) {
      for (const publication of participant.trackPublications.values()) {
        const track = publication.track;
        if (
          track &&
          publication.isSubscribed &&
          (track.kind === Track.Kind.Video || track.kind === Track.Kind.Audio)
        ) {
          mediaStream.addTrack(track.mediaStreamTrack);
        }
      }
    }

    this.remoteStream =
      mediaStream.getVideoTracks().length > 0 ? mediaStream : null;
    this.participantCount = room.numParticipants;
    this.emit();
  }

  private async teardownRoom(): Promise<void> {
    const room = this.room;
    this.room = null;
    this.publications = [];
    this.publishedMediaTracks = [];
    this.remoteStream = null;
    this.participantCount = 0;
    this.activeRoomName = null;

    if (room) {
      room.removeAllListeners();
      try {
        await room.disconnect(true);
      } catch {
        // ignore
      }
    }
  }

  private setStatus(status: LiveKitConnectionStatus): void {
    this.status = status;
    if (status !== "error") {
      this.errorMessage = null;
    }
    this.emit();
  }

  private setError(message: string): void {
    this.status = "error";
    this.errorMessage = message;
    this.emit();
  }

  private emit(): void {
    this.snapshot = {
      status: this.status,
      errorMessage: this.errorMessage,
      remoteStream: this.remoteStream,
      participantCount: this.participantCount,
    };
    for (const listener of this.listeners) {
      listener(this.snapshot);
    }
  }
}

/**
 * Workaround para livekit/client-sdk-js#1968: o SDK sempre escuta `freeze` e
 * chama disconnect() quando o Chrome/Edge hiberna a aba ao focar o jogo.
 */
function keepRoomAliveInBackground(room: LiveKitRoom): void {
  if (typeof window === "undefined") return;
  const handler = (
    room as unknown as { onPageLeave?: EventListenerOrEventListenerObject }
  ).onPageLeave;
  if (!handler) return;
  window.removeEventListener("freeze", handler);
  window.removeEventListener("pagehide", handler);
  window.removeEventListener("beforeunload", handler);
}

function toFriendlyConnectionError(error: unknown): string {
  const message =
    error instanceof Error ? error.message.toLowerCase() : "";

  if (message.includes("permission") || message.includes("unauthorized")) {
    return "Não foi possível autenticar na sala de mídia.";
  }
  if (message.includes("expired") || message.includes("token")) {
    return "A autorização da transmissão expirou. Tente novamente.";
  }
  if (
    message.includes("websocket") ||
    message.includes("signal connection") ||
    message.includes("failed to fetch") ||
    message.includes("serverunreachable")
  ) {
    return "Não foi possível conectar ao servidor de transmissão. Desative VPN/proxy se estiver usando e tente de novo.";
  }
  if (message.includes("room")) {
    return "Não foi possível entrar na sala de mídia.";
  }
  return "Falha ao conectar ao servidor de transmissão. Verifique a rede e tente novamente.";
}

function isRetryableSignalError(error: unknown): boolean {
  const message =
    error instanceof Error ? error.message.toLowerCase() : String(error);
  return (
    message.includes("websocket") ||
    message.includes("signal connection") ||
    message.includes("network") ||
    message.includes("timeout") ||
    message.includes("failed to fetch")
  );
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
